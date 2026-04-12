import { cn } from '@/lib/utils';
import type { ChatMessage } from "../types";
import React from 'react';
import { Bot, RefreshCw, User } from 'lucide-react';
import { ResponseRenderer } from '../renders';

const MessageBubble: React.FC<{ msg: ChatMessage; onRetry?: () => void, onSuggest?: (prompt: string) => void; }> = ({ msg, onRetry, onSuggest }) => {
  const isUser = msg.role === 'user'
  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  return (
    <div className={cn("flex gap-3 group", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
          isUser
            ? "bg-[#1a1e2a] border border-white/10"
            : "bg-green-500/15 border border-green-500/30"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white/70" />
        ) : (
          <Bot className="w-4 h-4 text-green-400" />
        )}
      </div>

      <div className={cn("flex flex-col gap-1", isUser ? "items-end max-w-[70%]" : "items-start max-w-[85%] w-full")}>
        <div
          className={cn(
            "rounded-2xl text-sm",
            isUser
              ? "bg-[#1a1e2a] text-white px-4 py-3 rounded-tr-sm"
              : "bg-muted text-foreground px-4 py-3.5 rounded-tl-sm w-full"
          )}
        >
          {isUser ? (
            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <ResponseRenderer parsed={msg.parsed} raw={msg.content} isError={msg.isError} onSuggest={onSuggest} />
          )}
        </div>

        <div className={cn("flex items-center gap-2 px-1", isUser ? "flex-row-reverse" : "flex-row")}>
          <span className="text-[11px] text-muted-foreground">{formatTime(msg.timestamp)}</span>
          {msg.isError && onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessageBubble