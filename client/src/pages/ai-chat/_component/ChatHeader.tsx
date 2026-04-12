import { Download, Sparkles, Trash2 } from 'lucide-react'
import React from 'react'
import { CHAT_MODES, ChatMessage, ChatMode } from '../types'
import { exportChat } from '../utils'
import ModeSelector from './ModeSelector'


interface IChatHeader {
    messages: ChatMessage[];
    clearMessages: () => void;
    mode: ChatMode;
    onModeChange: (m: ChatMode) => void;
}

const ChatHeader: React.FC<IChatHeader> = ({ messages, clearMessages, mode, onModeChange }) => {

    const activeModeConfig = CHAT_MODES.find((m) => m.id === mode)!;

    return (

        <div className="shrink-0 px-6 lg:px-8 py-4 border-b border-border bg-[#1a1e2a]">

            <div className="max-w-[var(--max-width)] mx-auto flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-green-400" />
                </div>
                <div>
                    <h1 className="text-base font-semibold text-white leading-tight">Arthium AI</h1>
                    <p className="text-xs text-white/40">Personal finance assistant</p>
                </div>


                <div className="ml-auto flex items-center gap-2">
                    {messages.length > 0 && (
                        <>
                            <button
                                onClick={() => exportChat(messages)}
                                title="Export chat"
                                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                            <button
                                onClick={clearMessages}
                                title="Clear chat"
                                className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                    <div className="flex items-center gap-1.5 ml-1">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs text-white/40">Online</span>
                    </div>
                </div>
            </div>

            <div className="px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
                <ModeSelector active={mode} onModeChange={onModeChange}  />
                <p className="text-[11px] text-white/30 hidden sm:block">{activeModeConfig.description}</p>
            </div>

        </div>

    )
}

export default ChatHeader
