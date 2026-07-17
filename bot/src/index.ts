import { createWhatsAppSocket } from "./whatsapp/client.js";
import { registerInboundHandler } from "./whatsapp/inbound.js";
import { createTelegramBot } from "./telegram/client.js";
import { env } from "./config.js";
import { logger } from "./logger.js";

async function main() {
  const telegramBot = createTelegramBot();
  if (telegramBot) {
    telegramBot.start();
    logger.info("Telegram bot started (primary channel)");
  } else {
    logger.warn("TELEGRAM_BOT_TOKEN not set — Telegram is the default channel, add a token to enable it");
  }

  if (env.whatsappEnabled) {
    const socket = await createWhatsAppSocket();
    registerInboundHandler(socket);
    logger.info("WhatsApp bot started (secondary channel)");
  }
}

main().catch((err) => {
  logger.fatal({ err }, "Fatal error during startup");
  process.exit(1);
});
