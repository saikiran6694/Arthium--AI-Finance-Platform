import { cn } from '@/lib/utils';
import React from 'react'
import {
    Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from '../types';


interface IChatInput {
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    inputRef: React.RefObject<HTMLTextAreaElement | null>
    isLoading: boolean;
    sendMessage: (text: string, baseMessages?: ChatMessage[] | undefined) => Promise<void>
    handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const ChatInput: React.FC<IChatInput> = ({ input, setInput, inputRef, sendMessage, isLoading, handleKeyDown }) => {

    const charCount = input.length;
    const isOverLimit = charCount > 2000;

    return (
        <div className="shrink-0 border-t border-border bg-background px-6 lg:px-8 py-4">
            <div className="max-w-[var(--max-width)] mx-auto space-y-2">
                <div
                    className={cn(
                        "flex items-end gap-3 rounded-2xl border bg-muted/40 px-4 py-3 transition-colors duration-150",
                        isOverLimit
                            ? "border-red-500/60"
                            : "border-border focus-within:border-green-500/50 focus-within:bg-muted/60"
                    )}
                >
                    <textarea
                        ref={inputRef}
                        rows={1}
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            e.target.style.height = "auto";
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about your finances…"
                        disabled={isLoading}
                        className={cn(
                            "flex-1 resize-none bg-transparent text-sm text-foreground",
                            "placeholder:text-muted-foreground outline-none border-none",
                            "max-h-[120px] leading-relaxed disabled:opacity-50"
                        )}
                        style={{ height: "24px" }}
                    />
                    <Button
                        size="icon"
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || isLoading || isOverLimit}
                        className="shrink-0 h-8 w-8 rounded-xl bg-green-500 hover:bg-green-600 text-white disabled:opacity-30 transition-all duration-150"
                    >
                        <Send className="w-3.5 h-3.5" />
                    </Button>
                </div>


                <div className="flex items-center justify-between px-1">
                    <p className="text-[11px] text-muted-foreground">
                        <kbd className="font-mono">Enter</kbd> to send ·{" "}
                        <kbd className="font-mono">Shift+Enter</kbd> for new line
                    </p>
                    <span className={cn("text-[11px] tabular-nums", isOverLimit ? "text-red-500" : "text-muted-foreground")}>
                        {charCount}/2000
                    </span>
                </div>
            </div>
        </div>
    )
}

export default ChatInput
