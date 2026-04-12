import React, { useEffect, useState } from 'react'
import { TableResponse } from '../../types'
import { cn } from '@/lib/utils'
import SuggestionsBar from './SuggestionBar';
import { renderMarkdown } from '../../renders';

const TableRenderer: React.FC<{ data: TableResponse, onSuggest?: (prompt: string) => void }> = ({ data, onSuggest }) => {
    const [visibleRows, setVisibleRows] = useState(0);
    const [headerVisible, setHeaderVisible] = useState(false);
    
    useEffect(() => {
        const t1 = setTimeout(() => setHeaderVisible(true), 80);
        let i = 0;
        const iv = setInterval(() => { i++; setVisibleRows(i); if (i >= data.rows.length) clearInterval(iv); }, 80);
        return () => { clearTimeout(t1); clearInterval(iv); };
    }, [data.rows.length]);

    return (
        <div className="space-y-3">
            {data.title && <p className="text-sm font-semibold" style={{ animation: "fadeSlideIn 0.3s ease both" }}>{data.title}</p>}
            <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-black/5 dark:bg-white/5 border-b border-border"
                            style={{ opacity: headerVisible ? 1 : 0, transform: headerVisible ? "translateY(0)" : "translateY(-6px)", transition: "opacity 0.3s ease, transform 0.3s ease" }}>
                            {data.columns.map((col, i) => <th key={i} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{col}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {data.rows.map((row, ri) => (
                            <tr key={ri} className={cn("border-b border-border last:border-0", ri % 2 !== 0 && "bg-black/[0.02] dark:bg-white/[0.02]")}
                                style={{ opacity: ri < visibleRows ? 1 : 0, transform: ri < visibleRows ? "translateX(0)" : "translateX(-8px)", transition: "opacity 0.25s ease, transform 0.25s ease", transitionDelay: `${ri * 30}ms` }}>
                                {row.map((cell, ci) => <td key={ci} className="px-4 py-2.5 text-sm whitespace-nowrap">{cell}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {data.message && visibleRows >= data.rows.length && <p className="text-xs text-muted-foreground" style={{ animation: "fadeSlideIn 0.4s ease both" }}>{renderMarkdown(data.message)}</p>}
            {data.suggestions && visibleRows >= data.rows.length && onSuggest && (
                <SuggestionsBar suggestions={data.suggestions} onSelect={onSuggest} delay={200} />
            )}
        </div>
    );
}

export default TableRenderer
