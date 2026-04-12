import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useTypedSelector } from "@/app/hook";
import { ChatMode, type ChatMessage, type HistoryItem } from "./types";
import ChatHeader from "./_component/ChatHeader";
import ChatScreen from "./_component/ChatScreen";
import { MAX_HISTORY } from "@/constant";
import ChatInput from "./_component/ChatInput";
import { buildMessageWithMode } from "./utils";

export default function AiChat() {
  const accessToken = useTypedSelector((state) => state.auth.access_token)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<ChatMode>('general')
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const buildHistory = useCallback((msgs: ChatMessage[]): HistoryItem[] => {
    return msgs
      .slice(-MAX_HISTORY)
      .map((m) => ({ role: m.role, content: m.content }));
  }, []);

  const clearChat = () => {
    setMessages([])
  }

  const sendMessage = useCallback(
    async (text: string, baseMessages?: ChatMessage[], overrrideMode?: ChatMode) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;


      console.log("current mode:  ", mode)
      console.log("override mode: ", overrrideMode)

      console.log("message: ", trimmed)


      const activeMode = overrrideMode ?? mode
      const userMessageWithMode = buildMessageWithMode(trimmed, activeMode)

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
        mode: activeMode
      };

      const currentMessages = baseMessages ?? messages;
      const newMessages = [...currentMessages, userMsg];

      setMessages(newMessages);
      setInput("");

      setIsLoading(true);
      
      if (inputRef.current) inputRef.current.style.height = "24px";

      try {
        const history = buildHistory(currentMessages);

        const res = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({ message: userMessageWithMode, history }),
        });


        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error((errData as { message?: string }).message || `Request failed (${res.status})`);
        }

        const data = await res.json();
        if(data.success) {
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: "assistant", content: JSON.stringify(data.data), parsed:  data.data, isError: false, timestamp: new Date() },
          ]);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Something went wrong.";
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `I'm having trouble connecting right now. ${errorMsg}`,
            isError: true,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    },
    [messages, isLoading, buildHistory, accessToken, mode]
  );

  const handleRetry = useCallback(() => {
    const withoutError = messages.slice(0, -1);
    const lastUserMsg = [...withoutError].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;
    sendMessage(lastUserMsg.content, messages.slice(0, -2));
  }, [messages, sendMessage]);


  const handleSuggestion = useCallback((prompt: string) => {
    sendMessage(prompt);
  }, [sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleModeChange = (newMode: ChatMode) => {
    setMode(newMode);
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <ChatHeader messages={messages} clearMessages={clearChat} mode={mode} onModeChange={handleModeChange} /> 

      {/* messages screen */}
      <ChatScreen messages={messages} isLoading={isLoading} mode={mode} bottomRef={bottomRef} sendMessage={sendMessage} handleRetry={handleRetry} onSuggest={handleSuggestion} />
      
      {/* Input */}
      <ChatInput input={input} setInput={setInput} inputRef={inputRef} isLoading={isLoading} sendMessage={sendMessage} handleKeyDown={handleKeyDown} />
    </div>
  );
}