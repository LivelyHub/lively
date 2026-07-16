import { chat } from "./llmClient.js";

const SYSTEM_PROMPT = "You are a warm, concise companion. Keep replies short.";
const MAX_HISTORY = 20;

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const histories = new Map<string, ChatMessage[]>();

function getHistory(id: string): ChatMessage[] {
  let history = histories.get(id);
  if (!history) {
    history = [{ role: "system", content: SYSTEM_PROMPT }];
    histories.set(id, history);
  }
  return history;
}

export async function reply(id: string, text: string): Promise<string> {
  const history = getHistory(id);
  history.push({ role: "user", content: text });
  const answer = await chat(history);
  history.push({ role: "assistant", content: answer });
  if (history.length > MAX_HISTORY + 1) history.splice(1, history.length - (MAX_HISTORY + 1));
  return answer;
}
