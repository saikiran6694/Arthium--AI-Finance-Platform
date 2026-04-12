import { AssistantResponse, ChatMessage, ChatMode } from "./types";

export function parseAssistantContent(raw: string): { parsed?: AssistantResponse; isError: boolean } {
  const trimmed = raw.trim();
  const jsonStr = trimmed.startsWith("```")
    ? trimmed.replace(/^```json?\n?/, "").replace(/\n?```$/, "")
    : trimmed;
  try {
    const obj = JSON.parse(jsonStr);
    if (obj && typeof obj === "object" && "format" in obj) {
      return { parsed: obj as AssistantResponse, isError: false };
    }
  } catch { /* fall through */ }
  return { parsed: undefined, isError: false };
}

export function exportChat(messages: ChatMessage[]) {
  const lines = ["# Arthium AI Chat Export", ""];
  messages.forEach((m) => {
    const time = m.timestamp.toLocaleString();
    lines.push(`**${m.role === "user" ? "You" : "Arthium AI"}** · ${time}`);
    lines.push(m.parsed ? JSON.stringify(m.parsed, null, 2) : m.content);
    lines.push("");
  });
  const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "arthium-chat.md";
  a.click();
  URL.revokeObjectURL(url);
}

export function buildMessageWithMode(text: string, mode: ChatMode): string {
  if (mode === "general") return text;
  if (mode === "advice")
    return `[ADVICE MODE] Please provide a detailed financial advice analysis for: ${text}`;
  if (mode === "simulator")
    return `[WHATIF MODE] Please run a what-if simulation for: ${text}`;
  return text;
}
