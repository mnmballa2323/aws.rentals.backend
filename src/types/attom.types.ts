/**
 * ATTOM Data API response type definitions.
 * Based on the ATTOM Property API V4 / V2 response formats.
 */

// ─────────────────────────────────────────────────────────
// Common
// ─────────────────────────────────────────────────────────

export interface AttomAddress {
  country?: string;
  countrySubd?: string;
  line1?: string;
  line2?: string;
  locality?: string;
  matchCode?: string;
  oneLine?: string;
  postal1?: string;
  postal2?: string;
  postal3?: string;
}

export interface AttomLocation {
  accuracy?: string;
  latitude?: string;
  longitude?: string;
  distance?: number;
  geoid?: string;
}

export interface AttomIdentifier {
  Id?: number;
  fips?: string;
  apn?: string;
  attomId?: number;
}

export interface AttomStatus {
  version?: string;
  code?: number;
  msg?: string;
  total?: number;
  page?: number;
  pagesize?: number;
  transactionID?: string;
}

// ─────────────────────────────────────────────────────────
// Property Profile
// ─────────────────────────────────────────────────────────

export interface AttomPropertySummary {
  propclass?: string;
  propsubtype?: string;
  proptype?: string;
  yearbuilt?: number;
  propLandUse?: string;
  propIndicator?: string;
}

export interface AttomBuilding {
  size?: {
    bldgsize?: number;
    grosssize?: number;
    grosssizeadjusted?: number;
    groundfloorsize?: number;
    livingsize?: number;
    sizeInd?: string;
    universalsize?: number;
  };
  rooms?: {
    bathfixtures?: number;
    bathsfull?: number;
    bathshalf?: number;
    bathstotal?: number;
    beds?: number;
    roomsTotal?: number;
  };
  interior?: {
    bsmtsize?: number;
    bsmttype?: string;
    fplccount?: number;
    fplcind?: string;
    fplctype?: string;
  };
  construction?: {
    condition?: string;
    constructiontype?: string;
    frameType?: string;
    roofcover?: string;
    roofShape?: string;
    wallType?: string;
  };
  parking?: {
    garagetype?: string;
    prkgSize?: number;
    prkgSpaces?: string;
    prkgType?: string;
  };
  summary?: {
    archStyle?: string;
    bldgsNum?: number;
    bldgType?: string;
    imprType?: string;
    levels?: number;
    mobileHome?: string;
    quality?: string;
    storyDesc?: string;
    unitsCount?: string;
    yearbuilteffective?: number;
  };
}

export interface AttomLot {
  lotnum?: string;
  lotsize1?: number;
  lotsize2?: number;
  zoningType?: string;
  poolind?: string;
  pooltype?: string;
  siteInfluence?: string[];
}

export interface AttomUtilities {
  coolingtype?: string;
  heatingfuel?: string;
  heatingtype?: string;
  sewertype?: string;
  watertype?: string;
  energyType?: string;
}

export interface AttomPropertyDetail {
  identifier?: AttomIdentifier;
  lot?: AttomLot;
  address?: AttomAddress;
  location?: AttomLocation;
  summary?: AttomPropertySummary;
  building?: AttomBuilding[];
  utilities?: AttomUtilities;
  vintage?: { lastModified?: string; pubDate?: string };
}

export interface AttomPropertyProfileResponse {
  status?: AttomStatus;
  property?: AttomPropertyDetail[];
}

// ─────────────────────────────────────────────────────────
// AVM / Valuation
// ─────────────────────────────────────────────────────────

export interface AttomAvmDetail {
  amount?: {
    scr?: number;
    value?: number;
    high?: number;
    low?: number;
    valueRange?: number;
  };
  calculations?: {
    perSizeUnit?: number;
    ratioTaxAmt?: number;
    ratioTaxValue?: number;
    monthlyChgPct?: number;
    monthlyChgValue?: number;
    rangePctOfValue?: number;
  };
  eventDate?: string;
}

export interface AttomAvmResponse {
  status?: AttomStatus;
  property?: Array<{
    identifier?: AttomIdentifier;
    address?: AttomAddress;
    avm?: AttomAvmDetail;
  }>;
}

// ─────────────────────────────────────────────────────────
// Rental AVM
// ─────────────────────────────────────────────────────────

export interface AttomRentalAvmDetail {
  rentAmount?: number;
  rentHigh?: number;
  rentLow?: number;
  confidence?: number;
}

export interface AttomRentalAvmResponse {
  status?: AttomStatus;
  property?: Array<{
    identifier?: AttomIdentifier;
    address?: AttomAddress;
    rentalAVM?: AttomRentalAvmDetail;
  }>;
}

// ─────────────────────────────────────────────────────────
// Assessment / Tax
// ─────────────────────────────────────────────────────────

export interface AttomAssessmentDetail {
  assessed?: {
    assdImprValue?: number;
    assdLandValue?: number;
    assdTtlValue?: number;
  };
  market?: {
    mktImprValue?: number;
    mktLandValue?: number;
    mktTtlValue?: number;
  };
  tax?: {
    taxAmt?: number;
    taxPerSizeUnit?: number;
    taxYear?: number;
  };
}

export interface AttomAssessmentResponse {
  status?: AttomStatus;
  property?: Array<{
    identifier?: AttomIdentifier;
    address?: AttomAddress;
    assessment?: AttomAssessmentDetail;
  }>;
}

// ─────────────────────────────────────────────────────────
// Sale History
// ─────────────────────────────────────────────────────────

export interface AttomSaleDetail {
  amount?: {
    saleAmt?: number;
    saleCode?: string;
    saleTransType?: string;
  };
  calculation?: {
    pricePerBed?: number;
    pricePerSizeUnit?: number;
  };
  date?: {
    saleSearchDate?: string;
    saleTransDate?: string;
    saleDocDate?: string;
  };
  deed?: {
    deedType?: string;
    documentId?: string;
  };
}

export interface AttomSaleHistoryResponse {
  status?: AttomStatus;
  property?: Array<{
    identifier?: AttomIdentifier;
    address?: AttomAddress;
    sale?: AttomSaleDetail[];
  }>;
}

// ─────────────────────────────────────────────────────────
// Natural Hazard / Risk
// ─────────────────────────────────────────────────────────

export interface AttomHazardDetail {
  type?: string;
  risk?: string;
  description?: string;
  score?: number;
}

export interface AttomNaturalHazardResponse {
  status?: AttomStatus;
  property?: Array<{
    identifier?: AttomIdentifier;
    address?: AttomAddress;
    hazard?: AttomHazardDetail[];
  }>;
}

// ─────────────────────────────────────────────────────────
// Schools
// ─────────────────────────────────────────────────────────

export interface AttomSchoolDetail {
  InstitutionName?: string;
  SchoolType?: string;
  Gradelevel?: string;
  SchoolRating?: number;
  distance?: number;
  fipisstateCode?: string;
  city?: string;
}

export interface AttomSchoolResponse {
  status?: AttomStatus;
  school?: AttomSchoolDetail[];
}

// ─────────────────────────────────────────────────────────
// Community / Neighborhood / POI
// ─────────────────────────────────────────────────────────

export interface AttomCommunityResponse {
  status?: AttomStatus;
  community?: Record<string, unknown>[];
}

export interface AttomPoiResponse {
  status?: AttomStatus;
  poi?: Array<{
    name?: string;
    type?: string;
    distance?: number;
    latitude?: string;
    longitude?: string;
  }>;
}

// ─────────────────────────────────────────────────────────
// Building Permits
// ─────────────────────────────────────────────────────────

export interface AttomBuildingPermitDetail {
  effectiveDate?: string;
  type?: string;
  status?: string;
  description?: string;
  estimatedCost?: number;
  jobValue?: number;
}

export interface AttomBuildingPermitResponse {
  status?: AttomStatus;
  property?: Array<{
    identifier?: AttomIdentifier;
    address?: AttomAddress;
    permit?: AttomBuildingPermitDetail[];
  }>;
}

// ─────────────────────────────────────────────────────────
// Sales Trends
// ─────────────────────────────────────────────────────────

export interface AttomSalesTrendResponse {
  status?: AttomStatus;
  salestrend?: Array<{
    dateRange?: { start?: string; end?: string };
    areaIndicator?: string;
    medianSalePrice?: number;
    averageSalePrice?: number;
    totalSales?: number;
    priceChangePct?: number;
  }>;
}

// ─────────────────────────────────────────────────────────
// Area / Boundary
// ─────────────────────────────────────────────────────────

export interface AttomAreaBoundaryResponse {
  status?: AttomStatus;
  area?: Array<{
    type?: string;
    name?: string;
    geoIdV4?: string;
    boundary?: Record<string, unknown>;
  }>;
}

// ─────────────────────────────────────────────────────────
// Foreclosure
// ─────────────────────────────────────────────────────────

export interface AttomForeclosureDetail {
  loanNumber?: string;
  originalLoanAmount?: number;
  defaultAmount?: number;
  auctionDate?: string;
  recordingDate?: string;
  estimatedValue?: number;
}

export interface AttomForeclosureResponse {
  status?: AttomStatus;
  property?: Array<{
    identifier?: AttomIdentifier;
    address?: AttomAddress;
    foreclosure?: AttomForeclosureDetail;
  }>;
}
