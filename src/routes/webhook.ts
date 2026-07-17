import type { FastifyInstance } from "fastify";
import { safeCompare } from "../lib/auth-guards.js";

// Meta WhatsApp Cloud API webhook verification handshake (CORE.md §2).
// Meta calls this once when the callback URL is saved in the developer
// console: we must echo hub.challenge as plain text iff hub.verify_token
// matches WHATSAPP_VERIFY_TOKEN. Message delivery (POST /webhook) is a
// separate concern and is not implemented here yet.
export async function webhookRoutes(app: FastifyInstance) {
  app.get("/webhook", async (request, reply) => {
    const query = request.query as Record<string, string | undefined>;
    const mode = query["hub.mode"];
    const token = query["hub.verify_token"];
    const challenge = query["hub.challenge"];

    const expected = process.env.WHATSAPP_VERIFY_TOKEN;
    if (!expected) {
      app.log.warn("GET /webhook called but WHATSAPP_VERIFY_TOKEN is not set");
      return reply.code(403).send();
    }

    if (mode !== "subscribe" || !token || !challenge || !safeCompare(token, expected)) {
      return reply.code(403).send();
    }

    return reply.type("text/plain").send(challenge);
  });
}
