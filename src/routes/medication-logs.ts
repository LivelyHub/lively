import { and, eq, gte, lt } from "drizzle-orm";
import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { medications, medicationLogs } from "../db/schema.js";
import { requireBot } from "../lib/auth-guards.js";
import { HttpError, parseBody } from "../lib/http-errors.js";
import { utcDayRange } from "../lib/dates.js";

const medicationLogSchema = z.object({
  medication_id: z.string().uuid(),
  elder_id: z.string().uuid(),
  method: z.enum(["reply", "emoji", "photo"]),
  taken_at: z.string().datetime().optional(),
});

export async function medicationLogRoutes(app: FastifyInstance) {
  // Idempotency here is per medication per UTC calendar day, not per
  // medication + slot as BACKLOG.md B6.2 originally specs. Slot-level
  // idempotency needs a scheduled_time/slot column on medication_logs,
  // which doesn't exist and CORE.md's schema froze end of Day 1 — adding
  // one now means a contract change lively-bot would need to adopt
  // mid-hackathon. Day-level idempotency is exactly correct for the
  // single-dose-per-day case (the seed data, and likely the demo); it
  // under-confirms a second same-day dose for multi-dose medications.
  // Flagged here and in B6.1/B5.3 rather than silently shipped as if exact.
  app.post("/medication-logs", { preHandler: requireBot }, async (request, reply) => {
    const body = parseBody(medicationLogSchema, request.body);

    const [medication] = await db.select().from(medications).where(eq(medications.id, body.medication_id));
    if (!medication) {
      throw new HttpError(404, "NOT_FOUND", "Medication not found");
    }
    if (medication.elderId !== body.elder_id) {
      throw new HttpError(400, "VALIDATION", "Medication does not belong to this elder", {
        medication_id: "Belongs to a different elder",
      });
    }

    const takenAt = body.taken_at ? new Date(body.taken_at) : new Date();
    const { start, end } = utcDayRange(takenAt);

    const [existing] = await db
      .select()
      .from(medicationLogs)
      .where(
        and(
          eq(medicationLogs.medicationId, medication.id),
          gte(medicationLogs.takenAt, start),
          lt(medicationLogs.takenAt, end),
        ),
      );

    if (existing) {
      return {
        id: existing.id,
        medication_id: existing.medicationId,
        elder_id: existing.elderId,
        method: existing.method,
        taken_at: existing.takenAt,
      };
    }

    const [inserted] = await db
      .insert(medicationLogs)
      .values({ medicationId: medication.id, elderId: medication.elderId, method: body.method, takenAt })
      .returning();

    reply.code(201);
    return {
      id: inserted.id,
      medication_id: inserted.medicationId,
      elder_id: inserted.elderId,
      method: inserted.method,
      taken_at: inserted.takenAt,
    };
  });
}
