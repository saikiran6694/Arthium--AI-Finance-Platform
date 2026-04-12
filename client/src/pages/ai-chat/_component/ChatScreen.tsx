import React from 'react'
import { ChatMessage, ChatMode } from '../types'
import { Bot, Sparkles } from 'lucide-react';
import { MODE_SUGGESTIONS } from '@/constant';
import { cn } from '@/lib/utils';
import MessageBubble from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { useTypedSelector } from '@/app/hook';

interface ChatScreenItems {
    messages: ChatMessage[];
    isLoading: boolean;
    bottomRef: React.RefObject<HTMLDivElement | null>;
    sendMessage: (text: string, baseMessages?: ChatMessage[] | undefined) => Promise<void>;
    handleRetry: () => void;
    mode: ChatMode;
    onSuggest: (prompt: string) => void;
}

const ChatScreen: React.FC<ChatScreenItems> = ({ messages, isLoading, bottomRef, sendMessage, handleRetry, mode = "general", onSuggest }) => {
    const { user } = useTypedSelector((state) => state.auth);
    const suggestions = MODE_SUGGESTIONS[mode];

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-[var(--max-width)] mx-auto px-6 lg:px-8 py-6 space-y-5">
                {/* Empty state */}
                {messages.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-12 gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                            <Sparkles className="w-7 h-7 text-green-400" />
                        </div>
                        <div className="text-center space-y-1.5">
                            <h2 className="text-xl font-semibold text-foreground">
                                Hi{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋
                            </h2>
                            <p className="text-sm text-muted-foreground max-w-xs">
                                Ask me anything about your finances — spending patterns, budgeting, or savings goals.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
                            {suggestions.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => sendMessage(s)}
                                    disabled={isLoading}
                                    className={cn(
                                        "text-left text-sm px-4 py-3 rounded-xl border border-border",
                                        "text-muted-foreground hover:text-foreground",
                                        "hover:border-green-500/40 hover:bg-green-500/5",
                                        "transition-all duration-150 cursor-pointer disabled:opacity-50"
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Messages */}
                {messages.map((msg, i) => (
                    <MessageBubble
                        key={msg.id}
                        msg={msg}
                        onRetry={msg.isError && i === messages.length - 1 ? handleRetry : undefined}
                        onSuggest={onSuggest}
                    />
                ))}

                {/* Loading */}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-green-500/15 border border-green-500/30">
                            <Bot className="w-4 h-4 text-green-400" />
                        </div>
                        <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm">
                            <TypingIndicator />
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>
        </div>
    )
}

export default ChatScreen
