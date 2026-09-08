import { config } from '../config';
import { ExternalServiceError } from '../utils/errors';
import { logger } from '../utils/logger';
import type {
  AttomPropertyProfileResponse,
  AttomAvmResponse,
  AttomRentalAvmResponse,
  AttomAssessmentResponse,
  AttomSaleHistoryResponse,
  AttomNaturalHazardResponse,
  AttomSchoolResponse,
  AttomCommunityResponse,
  AttomPoiResponse,
  AttomBuildingPermitResponse,
  AttomSalesTrendResponse,
  AttomAreaBoundaryResponse,
  AttomForeclosureResponse,
} from '../types/attom.types';

// ─────────────────────────────────────────────────────────
// Rate Limiter (Token Bucket)
// ─────────────────────────────────────────────────────────

class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per ms

  constructor(maxPerMinute: number) {
    this.maxTokens = maxPerMinute;
    this.tokens = maxPerMinute;
    this.refillRate = maxPerMinute / 60_000;
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    this.refill();

    if (this.tokens < 1) {
      const waitMs = Math.ceil((1 - this.tokens) / this.refillRate);
      logger.debug(`ATTOM rate limit: waiting ${waitMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      this.refill();
    }

    this.tokens -= 1;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
}

// ─────────────────────────────────────────────────────────
// Response Cache
// ─────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class ResponseCache {
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private readonly defaultTtlMs: number;

  constructor(defaultTtlMs: number = 3_600_000) {
    this.defaultTtlMs = defaultTtlMs;

    // Periodic cleanup every 5 minutes
    const cleanup = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache) {
        if (now > entry.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, 300_000);
    cleanup.unref();
  }

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

// ─────────────────────────────────────────────────────────
// ATTOM Service
// ─────────────────────────────────────────────────────────

/** Cache TTLs by data type */
const CACHE_TTL = {
  PROPERTY: 24 * 60 * 60_000,     // 24 hours
  VALUATION: 12 * 60 * 60_000,    // 12 hours
  ASSESSMENT: 30 * 24 * 60 * 60_000, // 30 days
  SALES: 24 * 60 * 60_000,        // 24 hours
  HAZARD: 90 * 24 * 60 * 60_000,  // 90 days
  SCHOOLS: 30 * 24 * 60 * 60_000, // 30 days
  COMMUNITY: 7 * 24 * 60 * 60_000, // 7 days
  PERMITS: 7 * 24 * 60 * 60_000,  // 7 days
  TRENDS: 24 * 60 * 60_000,       // 24 hours
} as const;

type QueryParams = Record<string, string | number | undefined>;

/**
 * Comprehensive ATTOM Data API client.
 * Includes rate limiting (200 calls/min), response caching, and error handling.
 */
export class AttomService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly rateLimiter: TokenBucket;
  private readonly cache: ResponseCache;

  constructor() {
    this.baseUrl = config.attom.baseUrl;
    this.apiKey = config.attom.apiKey;
    this.rateLimiter = new TokenBucket(config.attom.rateLimit);
    this.cache = new ResponseCache();
  }

  // ─────────────────────────────────────────────────────
  // HTTP Client
  // ─────────────────────────────────────────────────────

  private async request<T>(
    endpoint: string,
    params: QueryParams = {},
    cacheTtl?: number,
  ): Promise<T> {
    // Build cache key
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;

    // Check cache
    if (cacheTtl) {
      const cached = this.cache.get<T>(cacheKey);
      if (cached) {
        logger.debug(`ATTOM cache hit: ${endpoint}`);
        return cached;
      }
    }

    // Rate limit
    await this.rateLimiter.acquire();

    // Build URL with query params
    const url = new URL(endpoint, this.baseUrl);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    logger.info(`ATTOM API request: ${url.pathname}`, { params });

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          apikey: this.apiKey,
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`ATTOM API error: ${response.status}`, { endpoint, errorBody });
        throw new ExternalServiceError(
          'ATTOM',
          `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      const data = (await response.json()) as T;

      // Cache successful response
      if (cacheTtl) {
        this.cache.set(cacheKey, data, cacheTtl);
      }

      return data;
    } catch (error) {
      if (error instanceof ExternalServiceError) throw error;
      logger.error('ATTOM API request failed', { endpoint, error });
      throw new ExternalServiceError('ATTOM', 'Request failed');
    }
  }

  // ─────────────────────────────────────────────────────
  // Property Profile Endpoints
  // ─────────────────────────────────────────────────────

  /**
   * Get basic property profile by address.
   */
  async getPropertyBasicProfile(
    address1: string,
    address2: string,
  ): Promise<AttomPropertyProfileResponse> {
    return this.request<AttomPropertyProfileResponse>(
      '/propertyapi/v1.0.0/property/basicprofile',
      { address1, address2 },
      CACHE_TTL.PROPERTY,
    );
  }

  /**
   * Get expanded property profile by address.
   */
  async getPropertyExpandedProfile(
    address1: string,
    address2: string,
  ): Promise<AttomPropertyProfileResponse> {
    return this.request<AttomPropertyProfileResponse>(
      '/propertyapi/v1.0.0/property/expandedprofile',
      { address1, address2 },
      CACHE_TTL.PROPERTY,
    );
  }

  /**
   * Get detailed property profile by ATTOM ID.
   */
  async getPropertyDetailByAttomId(
    attomId: number,
  ): Promise<AttomPropertyProfileResponse> {
    return this.request<AttomPropertyProfileResponse>(
      '/propertyapi/v1.0.0/property/detail',
      { attomid: attomId },
      CACHE_TTL.PROPERTY,
    );
  }

  /**
   * Get property detail by address.
   */
  async getPropertyDetail(
    address1: string,
    address2: string,
  ): Promise<AttomPropertyProfileResponse> {
    return this.request<AttomPropertyProfileResponse>(
      '/propertyapi/v1.0.0/property/detail',
      { address1, address2 },
      CACHE_TTL.PROPERTY,
    );
  }

  // ─────────────────────────────────────────────────────
  // Valuation / AVM
  // ─────────────────────────────────────────────────────

  /**
   * Get AVM (Automated Valuation Model) by address.
   */
  async getAvmByAddress(
    address1: string,
    address2: string,
  ): Promise<AttomAvmResponse> {
    return this.request<AttomAvmResponse>(
      '/propertyapi/v1.0.0/attomavm/detail',
      { address1, address2 },
      CACHE_TTL.VALUATION,
    );
  }

  /**
   * Get AVM by ATTOM ID.
   */
  async getAvmByAttomId(attomId: number): Promise<AttomAvmResponse> {
    return this.request<AttomAvmResponse>(
      '/propertyapi/v1.0.0/attomavm/detail',
      { attomid: attomId },
      CACHE_TTL.VALUATION,
    );
  }

  // ─────────────────────────────────────────────────────
  // Rental AVM
  // ─────────────────────────────────────────────────────

  /**
   * Get Rental AVM by address.
   */
  async getRentalAvmByAddress(
    address1: string,
    address2: string,
  ): Promise<AttomRentalAvmResponse> {
    return this.request<AttomRentalAvmResponse>(
      '/propertyapi/v1.0.0/allevents/detail',
      { address1, address2 },
      CACHE_TTL.VALUATION,
    );
  }

  /**
   * Get Rental AVM by ATTOM ID.
   */
  async getRentalAvmByAttomId(attomId: number): Promise<AttomRentalAvmResponse> {
    return this.request<AttomRentalAvmResponse>(
      '/propertyapi/v1.0.0/allevents/detail',
      { attomid: attomId },
      CACHE_TTL.VALUATION,
    );
  }

  // ─────────────────────────────────────────────────────
  // Tax / Assessment
  // ─────────────────────────────────────────────────────

  /**
   * Get assessment/tax data by address.
   */
  async getAssessmentByAddress(
    address1: string,
    address2: string,
  ): Promise<AttomAssessmentResponse> {
    return this.request<AttomAssessmentResponse>(
      '/propertyapi/v1.0.0/assessment/detail',
      { address1, address2 },
      CACHE_TTL.ASSESSMENT,
    );
  }

  /**
   * Get assessment/tax data by ATTOM ID.
   */
  async getAssessmentByAttomId(attomId: number): Promise<AttomAssessmentResponse> {
    return this.request<AttomAssessmentResponse>(
      '/propertyapi/v1.0.0/assessment/detail',
      { attomid: attomId },
      CACHE_TTL.ASSESSMENT,
    );
  }

  // ─────────────────────────────────────────────────────
  // Sale / Deed History
  // ─────────────────────────────────────────────────────

  /**
   * Get sale history by address.
   */
  async getSaleHistoryByAddress(
    address1: string,
    address2: string,
  ): Promise<AttomSaleHistoryResponse> {
    return this.request<AttomSaleHistoryResponse>(
      '/propertyapi/v1.0.0/saleshistory/detail',
      { address1, address2 },
      CACHE_TTL.SALES,
    );
  }

  /**
   * Get sale history by ATTOM ID.
   */
  async getSaleHistoryByAttomId(attomId: number): Promise<AttomSaleHistoryResponse> {
    return this.request<AttomSaleHistoryResponse>(
      '/propertyapi/v1.0.0/saleshistory/detail',
      { attomid: attomId },
      CACHE_TTL.SALES,
    );
  }

  /**
   * Get all deed/sale events snapshot by address.
   */
  async getSaleSnapshotByAddress(
    address1: string,
    address2: string,
  ): Promise<AttomSaleHistoryResponse> {
    return this.request<AttomSaleHistoryResponse>(
      '/propertyapi/v1.0.0/saleshistory/snapshot',
      { address1, address2 },
      CACHE_TTL.SALES,
    );
  }

  // ─────────────────────────────────────────────────────
  // Foreclosure
  // ─────────────────────────────────────────────────────

  /**
   * Get pre-foreclosure data by address.
   */
  async getForeclosureByAddress(
    address1: string,
    address2: string,
  ): Promise<AttomForeclosureResponse> {
    return this.request<AttomForeclosureResponse>(
      '/propertyapi/v1.0.0/allevents/detail',
      { address1, address2 },
      CACHE_TTL.SALES,
    );
  }

  /**
   * Search foreclosures in a geographic area.
   */
  async searchForeclosures(
    geoIdV4: string,
    pageSize: number = 10,
    page: number = 1,
  ): Promise<AttomForeclosureResponse> {
    return this.request<AttomForeclosureResponse>(
      '/propertyapi/v1.0.0/allevents/detail',
      { geoid: geoIdV4, pagesize: pageSize, page },
      CACHE_TTL.SALES,
    );
  }

  // ─────────────────────────────────────────────────────
  // Building Permits
  // ─────────────────────────────────────────────────────

  /**
   * Get building permits by address.
   */
  async getBuildingPermitsByAddress(
    address1: string,
    address2: string,
  ): Promise<AttomBuildingPermitResponse> {
    return this.request<AttomBuildingPermitResponse>(
      '/propertyapi/v1.0.0/property/buildingpermits',
      { address1, address2 },
      CACHE_TTL.PERMITS,
    );
  }

  /**
   * Get building permits by ATTOM ID.
   */
  async getBuildingPermitsByAttomId(
    attomId: number,
  ): Promise<AttomBuildingPermitResponse> {
    return this.request<AttomBuildingPermitResponse>(
      '/propertyapi/v1.0.0/property/buildingpermits',
      { attomid: attomId },
      CACHE_TTL.PERMITS,
    );
  }

  // ─────────────────────────────────────────────────────
  // Schools (V4)
  // ─────────────────────────────────────────────────────

  /**
   * Get nearby schools by latitude/longitude.
   */
  async getSchoolsByLocation(
    latitude: number,
    longitude: number,
    searchRange: number = 5,
  ): Promise<AttomSchoolResponse> {
    return this.request<AttomSchoolResponse>(
      '/v4/school/search',
      { latitude, longitude, searchRange },
      CACHE_TTL.SCHOOLS,
    );
  }

  /**
   * Get schools near a property by address.
   */
  async getSchoolsByAddress(
    address1: string,
    address2: string,
    searchRange: number = 5,
  ): Promise<AttomSchoolResponse> {
    return this.request<AttomSchoolResponse>(
      '/v4/school/search',
      { address1, address2, searchRange },
      CACHE_TTL.SCHOOLS,
    );
  }

  // ─────────────────────────────────────────────────────
  // Community / Neighborhood
  // ─────────────────────────────────────────────────────

  /**
   * Get community demographics by geographic ID.
   */
  async getCommunityByGeoId(geoIdV4: string): Promise<AttomCommunityResponse> {
    return this.request<AttomCommunityResponse>(
      '/v4/neighborhood/community',
      { geoIdV4 },
      CACHE_TTL.COMMUNITY,
    );
  }

  /**
   * Get neighborhood data by address.
   */
  async getNeighborhoodByAddress(
    address1: string,
    address2: string,
  ): Promise<AttomCommunityResponse> {
    return this.request<AttomCommunityResponse>(
      '/v4/neighborhood/community',
      { address1, address2 },
      CACHE_TTL.COMMUNITY,
    );
  }

  // ─────────────────────────────────────────────────────
  // Natural Hazard / Risk
  // ─────────────────────────────────────────────────────

  /**
   * Get natural hazard risk data by address.
   */
  async getNaturalHazardByAddress(
    address1: string,
    address2: string,
  ): Promise<AttomNaturalHazardResponse> {
    return this.request<AttomNaturalHazardResponse>(
      '/propertyapi/v1.0.0/property/naturalhazard',
      { address1, address2 },
      CACHE_TTL.HAZARD,
    );
  }

  /**
   * Get natural hazard risk data by ATTOM ID.
   */
  async getNaturalHazardByAttomId(
    attomId: number,
  ): Promise<AttomNaturalHazardResponse> {
    return this.request<AttomNaturalHazardResponse>(
      '/propertyapi/v1.0.0/property/naturalhazard',
      { attomid: attomId },
      CACHE_TTL.HAZARD,
    );
  }

  // ─────────────────────────────────────────────────────
  // POI (Points of Interest)
  // ─────────────────────────────────────────────────────

  /**
   * Get POI data near an address.
   */
  async getPoiByAddress(
    address1: string,
    address2: string,
    searchRange: number = 5,
  ): Promise<AttomPoiResponse> {
    return this.request<AttomPoiResponse>(
      '/v4/neighborhood/poi',
      { address1, address2, searchRange },
      CACHE_TTL.COMMUNITY,
    );
  }

  /**
   * Get POI data by latitude/longitude.
   */
  async getPoiByLocation(
    latitude: number,
    longitude: number,
    searchRange: number = 5,
  ): Promise<AttomPoiResponse> {
    return this.request<AttomPoiResponse>(
      '/v4/neighborhood/poi',
      { latitude, longitude, searchRange },
      CACHE_TTL.COMMUNITY,
    );
  }

  // ─────────────────────────────────────────────────────
  // Sales Trends
  // ─────────────────────────────────────────────────────

  /**
   * Get sales trends by geographic area.
   */
  async getSalesTrends(
    geoIdV4: string,
    interval: 'monthly' | 'quarterly' | 'yearly' = 'monthly',
    startMonth?: string,
    endMonth?: string,
  ): Promise<AttomSalesTrendResponse> {
    return this.request<AttomSalesTrendResponse>(
      '/v4/salestrend/snapshot',
      { geoIdV4, interval, startmonth: startMonth, endmonth: endMonth },
      CACHE_TTL.TRENDS,
    );
  }

  // ─────────────────────────────────────────────────────
  // Area / Boundary
  // ─────────────────────────────────────────────────────

  /**
   * Look up geographic area IDs by address.
   */
  async getAreaByAddress(
    address1: string,
    address2: string,
  ): Promise<AttomAreaBoundaryResponse> {
    return this.request<AttomAreaBoundaryResponse>(
      '/v4/area/lookup',
      { address1, address2 },
      CACHE_TTL.COMMUNITY,
    );
  }

  /**
   * Get geographic boundary polygon data.
   */
  async getBoundary(geoIdV4: string): Promise<AttomAreaBoundaryResponse> {
    return this.request<AttomAreaBoundaryResponse>(
      '/v4/area/boundary',
      { geoIdV4 },
      CACHE_TTL.COMMUNITY,
    );
  }

  // ─────────────────────────────────────────────────────
  // Convenience: Full Enrichment
  // ─────────────────────────────────────────────────────

  /**
   * Fetches a comprehensive property enrichment from multiple ATTOM endpoints.
   * Used when onboarding a new property.
   */
  async getFullPropertyEnrichment(address1: string, address2: string) {
    const [profile, avm, assessment, saleHistory, hazard] = await Promise.allSettled([
      this.getPropertyExpandedProfile(address1, address2),
      this.getAvmByAddress(address1, address2),
      this.getAssessmentByAddress(address1, address2),
      this.getSaleHistoryByAddress(address1, address2),
      this.getNaturalHazardByAddress(address1, address2),
    ]);

    return {
      profile: profile.status === 'fulfilled' ? profile.value : null,
      avm: avm.status === 'fulfilled' ? avm.value : null,
      assessment: assessment.status === 'fulfilled' ? assessment.value : null,
      saleHistory: saleHistory.status === 'fulfilled' ? saleHistory.value : null,
      hazard: hazard.status === 'fulfilled' ? hazard.value : null,
    };
  }

  /**
   * Invalidate cache for a specific property.
   */
  invalidatePropertyCache(attomId: string): void {
    this.cache.invalidate(attomId);
  }
}

/** Singleton instance */
export const attomService = new AttomService();
