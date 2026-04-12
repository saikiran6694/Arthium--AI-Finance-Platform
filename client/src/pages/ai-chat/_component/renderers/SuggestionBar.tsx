import React, { useEffect, useState } from 'react'
import { ProactiveSuggestion } from '../../types';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

const SuggestionsBar: React.FC<({
    suggestions: ProactiveSuggestion[];
    onSelect: (prompt: string) => void;
    delay?: number;
})> = ({
    suggestions,
    onSelect,
    delay = 0,
}) => {
        const [visible, setVisible] = useState(false);
        
        useEffect(() => {
            const t = setTimeout(() => setVisible(true), delay);
            return () => clearTimeout(t);
        }, [delay]);

        if (!suggestions.length) return null;

        return (
            <div
                className="mt-3 pt-3 border-t border-border/60"
                style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(6px)",
                    transition: "opacity 0.4s ease, transform 0.4s ease",
                }}
            >
                <p className="text-[11px] text-muted-foreground mb-2 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" /> Follow-up
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => onSelect(s.prompt)}
                            className={cn(
                                "text-[11px] px-3 py-1.5 rounded-full border border-green-500/30",
                                "bg-green-500/5 text-green-600 dark:text-green-400",
                                "hover:bg-green-500/15 hover:border-green-500/50",
                                "transition-all duration-150 cursor-pointer flex items-center gap-1"
                            )}
                            style={{ animationDelay: `${i * 60}ms` }}
                        >
                            {s.label}
                            <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                    ))}
                </div>
            </div>
        );
    }

export default SuggestionsBar
