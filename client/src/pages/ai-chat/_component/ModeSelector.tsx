import React from 'react'
import { CHAT_MODES, ChatMode } from '../types'
import { cn } from '@/lib/utils'

const ModeSelector: React.FC<{ active: ChatMode, onModeChange: (m: ChatMode) => void }> = ({ active, onModeChange }) => {
    return (
        <div className='flex items-center gap-1.5'>
            {CHAT_MODES.map((m) => (
                <button
                    key={m.id}
                    onClick={() => onModeChange(m.id)}
                    title={m.description}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                        active === m.id
                            ? m.color
                            : "text-white/40 border-white/10 hover:text-white/70 hover:border-white/25 bg-transparent"
                    )}
                >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                </button>
            ))}
        </div>
    )
}

export default ModeSelector


