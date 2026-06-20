import type { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export async function writeAuditLog(input: {
  userId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}) {
  await prisma.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      details: input.details as Prisma.InputJsonValue | undefined,
      ipAddress: input.ipAddress,
    },
  });
}
