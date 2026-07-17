import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { requireFamily } from "../lib/auth-guards.js";
import { getOwnedElder } from "../lib/owned-elder.js";
import { parseQuery } from "../lib/http-errors.js";
import { computeReport } from "../lib/report.js";

const reportQuerySchema = z.object({
  period: z.enum(["week", "month"]).default("week"),
});

export async function reportRoutes(app: FastifyInstance) {
  app.get("/elders/:id/report", { preHandler: requireFamily }, async (request) => {
    const { id } = request.params as { id: string };
    await getOwnedElder(request.familyMemberId!, id);
    const query = parseQuery(reportQuerySchema, request.query);
    return computeReport(id, query.period);
  });
}
