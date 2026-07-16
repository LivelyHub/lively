import type { WASocket } from "@whiskeysockets/baileys";
import { sendHumanPaced } from "../texting.js";
import { reply } from "../companion.js";
import { logger } from "../logger.js";

export function registerInboundHandler(socket: WASocket) {
  socket.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (msg.key.fromMe || !msg.message) continue;
      const jid = msg.key.remoteJid;
      const text = msg.message.conversation ?? msg.message.extendedTextMessage?.text;
      if (!jid || !text) continue;
      logger.debug({ jid }, "Inbound message received");
      try {
        const answer = await reply(jid, text);
        await sendHumanPaced(socket, jid, answer);
      } catch (err) {
        logger.error({ err, jid }, "Failed to send reply");
      }
    }
  });
}
