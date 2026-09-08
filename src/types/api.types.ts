/** API request/response types for route handlers */

import { z } from 'zod';

// ─────────────────────────────────────────────────────────
// Properties
// ─────────────────────────────────────────────────────────

export const createPropertySchema = z.object({
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2-letter code'),
  zip: z.string().min(5, 'ZIP code is required'),
  county: z.string().optional(),
  propertyType: z.enum([
    'SINGLE_FAMILY', 'MULTI_FAMILY', 'CONDO', 'TOWNHOUSE',
    'DUPLEX', 'TRIPLEX', 'FOURPLEX', 'APARTMENT',
    'COMMERCIAL', 'MIXED_USE', 'LAND', 'OTHER',
  ]).default('SINGLE_FAMILY'),
  beds: z.number().int().min(0).optional(),
  baths: z.number().min(0).optional(),
  sqft: z.number().int().min(0).optional(),
  lotSize: z.number().int().min(0).optional(),
  yearBuilt: z.number().int().min(1600).max(2100).optional(),
  enrichWithAttom: z.boolean().default(true),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;

export const updatePropertySchema = createPropertySchema.partial().omit({
  enrichWithAttom: true,
});

export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;

export const propertyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'SOLD', 'ARCHIVED']).optional(),
  propertyType: z.enum([
    'SINGLE_FAMILY', 'MULTI_FAMILY', 'CONDO', 'TOWNHOUSE',
    'DUPLEX', 'TRIPLEX', 'FOURPLEX', 'APARTMENT',
    'COMMERCIAL', 'MIXED_USE', 'LAND', 'OTHER',
  ]).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  search: z.string().optional(),
});

export type PropertyQueryInput = z.infer<typeof propertyQuerySchema>;

// ─────────────────────────────────────────────────────────
// Units
// ─────────────────────────────────────────────────────────

export const createUnitSchema = z.object({
  propertyId: z.string().uuid('Invalid property ID'),
  unitNumber: z.string().min(1, 'Unit number is required'),
  beds: z.number().int().min(0).optional(),
  baths: z.number().min(0).optional(),
  sqft: z.number().int().min(0).optional(),
  floor: z.number().int().optional(),
  marketRent: z.number().min(0).optional(),
  currentRent: z.number().min(0).optional(),
  amenities: z.array(z.string()).default([]),
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>;

export const updateUnitSchema = createUnitSchema.partial().omit({
  propertyId: true,
});

export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;

// ─────────────────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────────────────

export const createUserSchema = z.object({
  firebaseUid: z.string().min(1, 'Firebase UID is required'),
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  role: z.enum([
    'SUPER_ADMIN', 'COMPANY_ADMIN', 'PROPERTY_MANAGER',
    'MAINTENANCE', 'OWNER', 'TENANT', 'PROSPECT',
  ]).default('PROSPECT'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.partial().omit({
  firebaseUid: true,
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// ─────────────────────────────────────────────────────────
// Common
// ─────────────────────────────────────────────────────────

export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});
