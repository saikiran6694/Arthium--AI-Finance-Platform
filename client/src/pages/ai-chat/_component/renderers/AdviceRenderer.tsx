import React, { useEffect, useState } from 'react'
import { AdviceItem, AdviceResponse } from '../../types';
import { cn } from '@/lib/utils';
import { ArrowRight, Zap } from 'lucide-react';
import { SEVERITY_CONFIG } from '@/constant';
import SuggestionsBar from './SuggestionBar';
import { renderMarkdown } from '../../renders';


function AdviceCard({ item, index, visible }: { item: AdviceItem; index: number; visible: boolean }) {

    const cfg = SEVERITY_CONFIG[item.severity];
    const Icon = cfg.icon;

    return (
        <div className={cn("rounded-xl border p-4 transition-all duration-350", cfg.bg)}
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transitionDelay: `${index * 100}ms` }}>
            <div className="flex items-start gap-3">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", cfg.badge)}>
                    <Icon className={cn("w-3.5 h-3.5", cfg.color)} />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{item.title}</span>
                        <div className="flex items-center gap-2">
                            {item.potential_savings !== undefined && (
                                <span className="text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                                    Save ${item.potential_savings.toLocaleString()}/mo
                                </span>
                            )}
                            <span className={cn("text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full", cfg.badge)}>
                                {item.severity}
                            </span>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{renderMarkdown(item.description)}</p>
                    <div className="flex items-center gap-1.5 pt-1">
                        <ArrowRight className="w-3 h-3 text-foreground/40 shrink-0" />
                        <p className="text-xs font-medium text-foreground/70">{renderMarkdown(item.action)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}


const AdviceRenderer: React.FC<{ data: AdviceResponse; onSuggest?: (prompt: string) => void }> = ({ data, onSuggest }) => {

    const [visibleCount, setVisibleCount] = useState(0);

    useEffect(() => {
        let i = 0;
        const iv = setInterval(() => { i++; setVisibleCount(i); if (i >= data.items.length) clearInterval(iv); }, 150);
        return () => clearInterval(iv);
    }, [data.items.length]);

    return (
        <div className="space-y-3">
            {data.title && (
                <div className="flex items-center gap-2" style={{ animation: "fadeSlideIn 0.3s ease both" }}>
                    <div className="w-5 h-5 rounded-md bg-purple-500/15 flex items-center justify-center">
                        <Zap className="w-3 h-3 text-purple-400" />
                    </div>
                    <p className="text-sm font-semibold">{data.title}</p>
                </div>
            )}
            <div className="space-y-2.5">
                {data.items.map((item, i) => (
                    <AdviceCard key={i} item={item} index={i} visible={i < visibleCount} />
                ))}
            </div>
            {data.message && visibleCount >= data.items.length && (
                <p className="text-xs text-muted-foreground pt-1" style={{ animation: "fadeSlideIn 0.4s ease both" }}>{renderMarkdown(data.message)}</p>
            )}
            {data.suggestions && visibleCount >= data.items.length && onSuggest && (
                <SuggestionsBar suggestions={data.suggestions} onSelect={onSuggest} delay={400} />
            )}
        </div>
    );

}

export default AdviceRenderer
