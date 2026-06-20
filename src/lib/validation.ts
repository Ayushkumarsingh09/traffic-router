import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const destinationSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(80).optional().nullable(),
  url: z.string().url(),
  type: z.enum(["INTERNAL", "EXTERNAL"]),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const poolMemberSchema = z.object({
  destinationId: z.string().min(1),
  weight: z.number().int().min(1).max(100),
});

export const poolSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
  members: z.array(poolMemberSchema).min(1),
});

export const ruleConditionSchema = z.object({
  field: z.enum([
    "DEVICE_TYPE",
    "BROWSER",
    "OS",
    "REFERRER",
    "COUNTRY",
    "LANGUAGE",
    "USER_AGENT",
    "IS_FACEBOOK_INAPP",
    "IS_MOBILE",
  ]),
  operator: z.enum(["EQUALS", "NOT_EQUALS", "CONTAINS", "NOT_CONTAINS", "IN", "NOT_IN", "REGEX"]),
  value: z.string().min(1).max(500),
});

export const ruleSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  priority: z.number().int().min(1).max(1000).optional(),
  isActive: z.boolean().optional(),
  action: z.enum(["SHOW", "REDIRECT"]).optional(),
  destinationId: z.string().optional().nullable(),
  poolId: z.string().optional().nullable(),
  conditions: z.array(ruleConditionSchema).min(1),
});

export const conversionSchema = z.object({
  visitId: z.string().min(1),
  eventName: z.string().min(1).max(80).optional(),
  destinationId: z.string().optional().nullable(),
  value: z.number().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export function parseBody<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}
