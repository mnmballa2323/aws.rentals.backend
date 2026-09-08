import { PrismaClient, Prisma, Property, PropertyStatus, PropertyType } from '@prisma/client';
import { attomService } from './attom.service';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import type { CreatePropertyInput, UpdatePropertyInput, PropertyQueryInput } from '../types/api.types';

const prisma = new PrismaClient();

/**
 * Service layer for property CRUD operations with ATTOM enrichment.
 */
export class PropertiesService {
  /**
   * Create a new property with optional ATTOM data enrichment.
   */
  async create(companyId: string, input: CreatePropertyInput): Promise<Property> {
    const property = await prisma.property.create({
      data: {
        companyId,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2,
        city: input.city,
        state: input.state,
        zip: input.zip,
        county: input.county,
        propertyType: input.propertyType as PropertyType,
        beds: input.beds,
        baths: input.baths,
        sqft: input.sqft,
        lotSize: input.lotSize,
        yearBuilt: input.yearBuilt,
      },
    });

    // Enrich with ATTOM data in background (fire-and-forget)
    if (input.enrichWithAttom) {
      this.enrichWithAttom(property).catch((err) => {
        logger.error('ATTOM enrichment failed for property', {
          propertyId: property.id,
          error: err,
        });
      });
    }

    return property;
  }

  /**
   * Retrieve a property by ID.
   * @throws NotFoundError if property doesn't exist
   */
  async getById(id: string, companyId: string): Promise<Property> {
    const property = await prisma.property.findFirst({
      where: { id, companyId },
      include: {
        units: true,
        attomValuations: { take: 1, orderBy: { fetchedAt: 'desc' } },
        attomRentalAvms: { take: 1, orderBy: { fetchedAt: 'desc' } },
      },
    });

    if (!property) {
      throw new NotFoundError(`Property not found: ${id}`);
    }

    return property;
  }

  /**
   * List properties for a company with filtering and pagination.
   */
  async list(companyId: string, query: PropertyQueryInput) {
    const where: Prisma.PropertyWhereInput = { companyId };

    if (query.status) {
      where.status = query.status as PropertyStatus;
    }
    if (query.propertyType) {
      where.propertyType = query.propertyType as PropertyType;
    }
    if (query.city) {
      where.city = { contains: query.city, mode: 'insensitive' };
    }
    if (query.state) {
      where.state = query.state;
    }
    if (query.search) {
      where.OR = [
        { addressLine1: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const page = query.page;
    const limit = query.limit;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { units: { select: { id: true, unitNumber: true, status: true } } },
      }),
      prisma.property.count({ where }),
    ]);

    return {
      data: properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update a property.
   */
  async update(id: string, companyId: string, input: UpdatePropertyInput): Promise<Property> {
    // Verify ownership
    await this.getById(id, companyId);

    return prisma.property.update({
      where: { id },
      data: {
        ...input,
        propertyType: input.propertyType as PropertyType | undefined,
      },
    });
  }

  /**
   * Soft-delete (archive) a property.
   */
  async archive(id: string, companyId: string): Promise<Property> {
    await this.getById(id, companyId);

    return prisma.property.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }

  /**
   * Enrich a property with ATTOM data.
   */
  private async enrichWithAttom(property: Property): Promise<void> {
    const address2 = `${property.city}, ${property.state} ${property.zip}`;

    const enrichment = await attomService.getFullPropertyEnrichment(
      property.addressLine1,
      address2,
    );

    const profileProp = enrichment.profile?.property?.[0];

    // Store raw profile data
    if (profileProp) {
      const attomId = profileProp.identifier?.attomId;

      await prisma.attomPropertyData.create({
        data: {
          propertyId: property.id,
          attomId: attomId?.toString() ?? '',
          rawData: profileProp as unknown as Prisma.JsonObject,
        },
      });

      // Update property with ATTOM-sourced fields
      const building = profileProp.building?.[0];
      const lot = profileProp.lot;

      await prisma.property.update({
        where: { id: property.id },
        data: {
          attomId: attomId?.toString(),
          latitude: profileProp.location?.latitude
            ? parseFloat(profileProp.location.latitude)
            : undefined,
          longitude: profileProp.location?.longitude
            ? parseFloat(profileProp.location.longitude)
            : undefined,
          fips: profileProp.identifier?.fips,
          apn: profileProp.identifier?.apn,
          beds: building?.rooms?.beds ?? property.beds,
          baths: building?.rooms?.bathstotal ?? property.baths,
          sqft: building?.size?.livingsize ?? property.sqft,
          yearBuilt: profileProp.summary?.yearbuilt ?? property.yearBuilt,
          lotSize: lot?.lotsize1 ?? property.lotSize,
          constructionType: building?.construction?.constructiontype,
          roofType: building?.construction?.roofcover,
          pool: lot?.poolind === 'Y',
        },
      });
    }

    // Store AVM data
    const avmProp = enrichment.avm?.property?.[0];
    if (avmProp?.avm?.amount?.value) {
      await prisma.attomValuation.create({
        data: {
          propertyId: property.id,
          avmValue: avmProp.avm.amount.value,
          avmHigh: avmProp.avm.amount.high,
          avmLow: avmProp.avm.amount.low,
          confidenceScore: avmProp.avm.amount.scr,
          valueChangePct: avmProp.avm.calculations?.monthlyChgPct,
        },
      });
    }

    // Store assessment data
    const assessProp = enrichment.assessment?.property?.[0];
    if (assessProp?.assessment) {
      const a = assessProp.assessment;
      await prisma.attomAssessment.create({
        data: {
          propertyId: property.id,
          assessedValue: a.assessed?.assdTtlValue,
          landValue: a.assessed?.assdLandValue,
          improvementValue: a.assessed?.assdImprValue,
          taxAmount: a.tax?.taxAmt,
          taxYear: a.tax?.taxYear,
        },
      });
    }

    // Store sale history
    const saleProp = enrichment.saleHistory?.property?.[0];
    if (saleProp?.sale?.length) {
      for (const sale of saleProp.sale) {
        await prisma.attomSaleHistory.create({
          data: {
            propertyId: property.id,
            saleDate: sale.date?.saleTransDate
              ? new Date(sale.date.saleTransDate)
              : null,
            salePrice: sale.amount?.saleAmt,
            deedType: sale.deed?.deedType,
          },
        });
      }
    }

    logger.info('ATTOM enrichment completed', { propertyId: property.id });
  }
}

export const propertiesService = new PropertiesService();
