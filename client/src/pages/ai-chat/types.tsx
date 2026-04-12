export type MessageRole = "user" | "assistant";

export interface HistoryItem {
  role: MessageRole;
  content: string;
}

export type ChatMode = "general" | "advice" | "simulator";

export const CHAT_MODES: { id: ChatMode; label: string; icon: string; description: string; color: string }[] = [
  {
    id: "general",
    label: "General",
    icon: "💬",
    description: "Ask anything about your finances",
    color: "text-blue-400 border-blue-400/40 bg-blue-400/10",
  },
  {
    id: "advice",
    label: "Advice",
    icon: "🧠",
    description: "Get analysis and recommendations",
    color: "text-purple-400 border-purple-400/40 bg-purple-400/10",
  },
  {
    id: "simulator",
    label: "Simulator",
    icon: "⚡",
    description: "Simulate what-if scenarios",
    color: "text-amber-400 border-amber-400/40 bg-amber-400/10",
  },
];

export interface ProactiveSuggestion {
  label: string;
  prompt: string;
}

export interface WhatIfScenario {
  category: string;
  change_percent: number;
  current_spend: number;
  new_spend: number;
  monthly_savings: number;
  annual_savings: number;
  new_savings_rate: number;
  old_savings_rate: number;
  verdict: "good" | "great" | "neutral" | "risky";
  insight: string;
}

export interface AdviceItem {
  title: string;
  severity: "high" | "medium" | "low";
  description: string;
  action: string;
  potential_savings?: number;
}

export interface AdviceResponse {
  format: "advice";
  title: string;
  items: AdviceItem[];
  message?: string;
  suggestions?: ProactiveSuggestion[];
}

export interface WhatIfResponse {
  format: "whatif";
  title: string;
  scenario: WhatIfScenario;
  message?: string;
  suggestions?: ProactiveSuggestion[];
}

export interface TextResponse {
  format: "text";
  message: string;
  suggestions?: ProactiveSuggestion[];
}

export interface BulletItem {
  label: string;
  value: string;
  note?: string;
}

export interface BulletsResponse {
  format: "bullets";
  title: string;
  items: BulletItem[];
  message?: string;
  suggestions?: ProactiveSuggestion[];
}

export interface TableResponse {
  format: "table";
  title: string;
  columns: string[];
  rows: string[][];
  message?: string;
  suggestions?: ProactiveSuggestion[];
}

export interface ChartSeries {
  name: string;
  data: { x: string; y: number }[];
}

export interface PieSeries {
  name: string;
  value: number;
}

export interface ChartResponse {
  format: "chart";
  chart_type: "line" | "bar" | "pie" | "donut";
  title: string;
  x_label?: string;
  y_label?: string;
  series: ChartSeries[] | PieSeries[];
  message?: string;
  suggestions?: ProactiveSuggestion[];
}

export type AssistantResponse =
  | TextResponse
  | BulletsResponse
  | TableResponse
  | ChartResponse
  | AdviceResponse
  | WhatIfResponse

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  parsed?: AssistantResponse;
  timestamp: Date;
  isError?: boolean;
  mode?: ChatMode;
}