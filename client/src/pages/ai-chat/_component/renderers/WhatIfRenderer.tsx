import React, { useEffect, useState } from 'react'
import { WhatIfResponse } from '../../types';
import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp } from 'lucide-react';
import SuggestionsBar from './SuggestionBar';
import { VERDICT_CONFIG } from '@/constant';
import { renderMarkdown } from '../../renders';

const WhatIfRenderer: React.FC<{ data: WhatIfResponse, onSuggest?: (prompt: string) => void }> = ({ data, onSuggest }) => {
    const [stage, setStage] = useState(0);
    const sc = data.scenario;
    const verdict = VERDICT_CONFIG[sc.verdict];
    const isReduction = sc.change_percent < 0;

    useEffect(() => {
        const timers = [
            setTimeout(() => setStage(1), 100),
            setTimeout(() => setStage(2), 350),
            setTimeout(() => setStage(3), 600),
            setTimeout(() => setStage(4), 850),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    const statStyle = (s: number) => ({
        opacity: stage >= s ? 1 : 0,
        transform: stage >= s ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
    });

    return (
        <div className="space-y-4">
            {data.title && <p className="text-sm font-semibold" style={{ animation: "fadeSlideIn 0.3s ease both" }}>{data.title}</p>}

            {/* Verdict banner */}
            <div className={cn("rounded-xl border p-3.5 flex items-center gap-3", verdict.bg)} style={statStyle(1)}>
                <div className="flex-1">
                    <p className={cn("text-sm font-bold", verdict.color)}>{verdict.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{sc.insight}</p>
                </div>
                <div className={cn("text-right shrink-0")}>
                    <p className="text-xs text-muted-foreground">Monthly savings</p>
                    <p className={cn("text-lg font-bold tabular-nums", isReduction ? "text-green-400" : "text-red-400")}>
                        {isReduction ? "+" : "-"}${Math.abs(sc.monthly_savings).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Before / After comparison */}
            <div className="grid grid-cols-2 gap-2.5" style={statStyle(2)}>
                <div className="rounded-xl border border-border bg-black/5 dark:bg-white/5 p-3 space-y-1">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Current</p>
                    <p className="text-base font-bold tabular-nums">${sc.current_spend.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                    <p className="text-xs text-muted-foreground">{sc.old_savings_rate.toFixed(1)}% savings rate</p>
                </div>
                <div className={cn("rounded-xl border p-3 space-y-1", isReduction ? "border-green-500/30 bg-green-500/8" : "border-red-500/30 bg-red-500/8")}>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">After change</p>
                    <p className={cn("text-base font-bold tabular-nums", isReduction ? "text-green-400" : "text-red-400")}>
                        ${sc.new_spend.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/mo</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{sc.new_savings_rate.toFixed(1)}% savings rate</p>
                </div>
            </div>

            {/* Annual impact */}
            <div className="rounded-xl border border-border bg-muted/30 p-3 flex items-center justify-between" style={statStyle(3)}>
                <div className="flex items-center gap-2">
                    {isReduction ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                    <span className="text-sm">Annual impact on savings</span>
                </div>
                <span className={cn("text-sm font-bold tabular-nums", isReduction ? "text-green-400" : "text-red-400")}>
                    {isReduction ? "+" : "-"}${Math.abs(sc.annual_savings).toLocaleString()}/year
                </span>
            </div>

            {data.message && <p className="text-xs text-muted-foreground" style={statStyle(4)}>{renderMarkdown(data.message)}</p>}
            {data.suggestions && stage >= 4 && onSuggest && (
                <SuggestionsBar suggestions={data.suggestions} onSelect={onSuggest} delay={200} />
            )}
        </div>
    );
}

export default WhatIfRenderer
