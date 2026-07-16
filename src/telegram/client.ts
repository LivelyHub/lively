import { Bot } from "grammy";
import { env } from "../config.js";
import { reply } from "../companion.js";
import { splitMessage, typingDelayMs } from "../texting.js";
import { logger } from "../logger.js";

export function createTelegramBot(): Bot | null {
  if (!env.telegramBotToken) {
    logger.info("TELEGRAM_BOT_TOKEN not set, skipping Telegram bot");
    return null;
  }

  const bot = new Bot(env.telegramBotToken);

  bot.on("message:text", async (ctx) => {
    const chatId = String(ctx.chat.id);
    logger.debug({ chatId }, "Inbound Telegram message received");
    try {
      const answer = await reply(chatId, ctx.message.text);
      for (const bubble of splitMessage(answer)) {
        await ctx.replyWithChatAction("typing");
        await new Promise((resolve) => setTimeout(resolve, typingDelayMs(bubble)));
        await ctx.reply(bubble);
      }
    } catch (err) {
      logger.error({ err, chatId }, "Failed to send Telegram reply");
    }
  });

  bot.catch((err) => {
    logger.error({ err }, "Telegram bot error");
  });

  return bot;
}
