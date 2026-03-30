// src/app/(app)/chat/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/trpc";

const SUBJECTS = ["All", "Physics", "Maths", "Chemistry", "CS", "English"];
const SUGGESTIONS = [
  "Explain Newton's second law with an example",
  "What is the quadratic formula?",
  "Explain covalent bonding",
  "What is Big O notation?",
  "Summarise photosynthesis",
];

type Message = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [activeSubject, setActiveSubject] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const createChat = api.doubt.createChat.useMutation();
  const sendMessage = api.doubt.sendMessage.useMutation();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const ensureChatId = async () => {
    if (chatId) return chatId;
    const chat = await createChat.mutateAsync({ subject: activeSubject });
    setChatId(chat.id);
    return chat.id;
  };

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setIsLoading(true);
    try {
      const id = await ensureChatId();
      const res = await sendMessage.mutateAsync({ chatId: id, message: text, subject: activeSubject });
      setMessages((m) => [...m, { role: "assistant", content: res.message.content }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", maxHeight: "100vh" }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #e5e7eb", background: "white" }}>
        <h1 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 10px", color: "#111" }}>Ask a doubt</h1>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {SUBJECTS.map((s) => (
            <button key={s} onClick={() => setActiveSubject(s === "All" ? undefined : s)} style={{
              fontSize: 12, padding: "4px 10px", borderRadius: 999, cursor: "pointer",
              border: "1px solid",
              borderColor: (activeSubject === s || (s === "All" && !activeSubject)) ? "#185FA5" : "#e5e7eb",
              background: (activeSubject === s || (s === "All" && !activeSubject)) ? "#E6F1FB" : "transparent",
              color: (activeSubject === s || (s === "All" && !activeSubject)) ? "#185FA5" : "#6b7280",
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", margin: "auto", paddingTop: "4rem" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
            <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>
              Ask me anything about your subjects — I'm here to help you understand, not just answer.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 500, margin: "0 auto" }}>
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} style={{
                  fontSize: 12, padding: "6px 12px", borderRadius: 999,
                  border: "1px solid #e5e7eb", background: "white", cursor: "pointer", color: "#374151",
                }}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "assistant" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#185FA5", fontWeight: 600, flexShrink: 0, marginTop: 2 }}>AI</div>
            )}
            <div style={{
              maxWidth: "75%", padding: "10px 14px", borderRadius: 12,
              fontSize: 14, lineHeight: 1.6,
              background: m.role === "user" ? "#185FA5" : "white",
              color: m.role === "user" ? "white" : "#111",
              border: m.role === "assistant" ? "1px solid #e5e7eb" : "none",
              borderRadius: m.role === "user" ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
              whiteSpace: "pre-wrap",
            }}>{m.content}</div>
            {m.role === "user" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#EAF3DE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#3B6D11", fontWeight: 600, flexShrink: 0, marginTop: 2 }}>You</div>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#185FA5", fontWeight: 600, flexShrink: 0 }}>AI</div>
            <div style={{ padding: "12px 16px", background: "white", border: "1px solid #e5e7eb", borderRadius: "4px 12px 12px 12px", display: "flex", gap: 6 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: "50%", background: "#d1d5db",
                  animation: "bounce 1.2s infinite", animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid #e5e7eb", background: "white", display: "flex", gap: 8 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder={`Ask a ${activeSubject ?? "subject"} question…`}
          rows={1}
          style={{
            flex: 1, resize: "none", padding: "9px 12px", border: "1px solid #e5e7eb",
            borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none",
            background: "#f9fafb", minHeight: 38,
          }}
        />
        <button onClick={() => send(input)} disabled={!input.trim() || isLoading} style={{
          width: 38, height: 38, background: "#185FA5", border: "none", borderRadius: 8,
          color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          opacity: !input.trim() || isLoading ? 0.5 : 1,
          flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}
