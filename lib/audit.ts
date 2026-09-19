import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth-token";

type Actor = Pick<SessionPayload, "userId" | "role"> | "system";

/**
 * Append-only audit trail (NFR-C4). Never throws: a logging failure must not
 * break the action being logged.
 */
export async function audit(
  actor: Actor,
  action: string,
  entityType: string,
  entityId: string,
  metadata?: Prisma.InputJsonValue,
  tx: Prisma.TransactionClient | typeof prisma = prisma
): Promise<void> {
  try {
    await tx.auditLog.create({
      data: {
        actorId: actor === "system" ? null : actor.userId,
        actorRole: actor === "system" ? "SYSTEM" : actor.role,
        action,
        entityType,
        entityId,
        metadata,
      },
    });
  } catch (err) {
    console.error("audit log write failed:", action, entityType, entityId, err);
  }
}
