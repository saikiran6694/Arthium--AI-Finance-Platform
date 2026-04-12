import React, { useEffect, useState } from 'react'
import { BulletsResponse } from '../../types';
import SuggestionsBar from './SuggestionBar';
import { renderMarkdown } from '../../renders';

const BulletRenderer: React.FC<{ data: BulletsResponse, onSuggest?: (prompt: string) => void }> = ({ data, onSuggest }) => {

    const [visibleCount, setVisibleCount] = useState(0);

    useEffect(() => {
        let i = 0;
        const iv = setInterval(() => { i++; setVisibleCount(i); if (i >= data.items.length) clearInterval(iv); }, 120);
        return () => clearInterval(iv);
    }, [data.items.length]);

    return (
        <div className="space-y-3">
            {data.title && <p className="text-sm font-semibold" style={{ animation: "fadeSlideIn 0.3s ease both" }}>{data.title}</p>}
            <div className="space-y-2">
                {data.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border transition-all duration-300"
                        style={{ opacity: i < visibleCount ? 1 : 0, transform: i < visibleCount ? "translateY(0)" : "translateY(10px)", transitionDelay: `${i * 40}ms` }}>
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-green-500">{i + 1}</span>
                        </span>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="text-sm font-medium">{item.label}</span>
                                <span className="text-sm font-semibold text-green-600 dark:text-green-400 shrink-0">{item.value}</span>
                            </div>
                            {item.note && <p className="text-xs text-muted-foreground mt-0.5">{item.note}</p>}
                        </div>
                    </div>
                ))}
            </div>
            {data.message && visibleCount >= data.items.length && <p className="text-xs text-muted-foreground pt-1" style={{ animation: "fadeSlideIn 0.4s ease both" }}>{renderMarkdown(data.message)}</p>}
            {data.suggestions && visibleCount >= data.items.length && onSuggest && (
                <SuggestionsBar suggestions={data.suggestions} onSelect={onSuggest} delay={300} />
            )}
        </div>
    )
}

export default BulletRenderer