import type { WASocket } from "@whiskeysockets/baileys";

const CHARS_PER_SEC = 40;
const MAX_TYPING_MS = 8000;
const MIN_REPLY_MS = 2000;

export function splitMessage(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function typingDelayMs(bubble: string): number {
  return Math.min(MAX_TYPING_MS, Math.max(MIN_REPLY_MS, (bubble.length / CHARS_PER_SEC) * 1000));
}

export async function sendHumanPaced(socket: WASocket, jid: string, text: string) {
  const bubbles = splitMessage(text);
  for (const bubble of bubbles) {
    await socket.sendPresenceUpdate("composing", jid);
    await new Promise((resolve) => setTimeout(resolve, typingDelayMs(bubble)));
    await socket.sendMessage(jid, { text: bubble });
  }
}
