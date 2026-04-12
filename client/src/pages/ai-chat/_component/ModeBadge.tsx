import { cn } from "@/lib/utils";
import { ChatMode } from "../types";

export function ModeBadge({ mode }: { mode: ChatMode }) {
    if (mode === "general") return null;
    const styles: Record<string, string> = {
        advice: "bg-purple-500/10 text-purple-400 border-purple-400/30",
        simulator: "bg-amber-500/10 text-amber-400 border-amber-400/30",
    };
    const labels: Record<string, string> = { advice: "🧠 Advice Mode", simulator: "⚡ Simulator" };
    return (
        <span className={cn("inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border mb-2", styles[mode])}>
            {labels[mode]}
        </span>
    );
}