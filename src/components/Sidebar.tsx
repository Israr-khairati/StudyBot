// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { api } from "@/lib/trpc";

const NAV = [
  { href: "/chat",       label: "Ask a doubt",  icon: "💬" },
  { href: "/timetable",  label: "Timetable",    icon: "📅" },
  { href: "/notes",      label: "Notes",        icon: "📝" },
  { href: "/exams",      label: "Exam prep",    icon: "🎯" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Fetch recent chat history
  const { data: recentChats, isLoading } = api.doubt.getChats.useQuery(undefined, {
    enabled: !!session?.user,
  });

  return (
    <aside style={{
      width: 240, minHeight: "100vh", background: "#f3f4f6",
      borderRight: "1px solid #e5e7eb", display: "flex",
      flexDirection: "column", flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, background: "#185FA5", borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 600, fontSize: 14,
          }}>S</div>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>StudyBot</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: 8 }}>
        <p style={{ fontSize: 11, color: "#9ca3af", padding: "8px 8px 4px", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
          Features
        </p>
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "7px 10px", borderRadius: 7, marginBottom: 2,
              textDecoration: "none", fontSize: 13,
              background: active ? "white" : "transparent",
              color: active ? "#111" : "#6b7280",
              fontWeight: active ? 500 : 400,
              border: active ? "1px solid #e5e7eb" : "1px solid transparent",
            }}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Recent Chats Section */}
      <div style={{ padding: 8, flex: 1, overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 8px 4px" }}>
          <p style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
            Recent History
          </p>
          <Link href="/chat" style={{ fontSize: 11, color: "#185FA5", textDecoration: "none", fontWeight: 500 }}>
            New +
          </Link>
        </div>

        <div style={{ marginTop: 4 }}>
          {isLoading ? (
            <div style={{ padding: "8px", fontSize: 12, color: "#9ca3af" }}>Loading...</div>
          ) : recentChats && recentChats.length > 0 ? (
            recentChats.map((chat) => {
              const active = pathname === `/chat/${chat.id}`;
              const lastMsg = chat.messages[0]?.content ?? "New chat...";
              
              return (
                <Link key={chat.id} href={`/chat/${chat.id}`} style={{
                  display: "flex", flexDirection: "column", gap: 2,
                  padding: "8px 10px", borderRadius: 7, marginBottom: 4,
                  textDecoration: "none", fontSize: 12,
                  background: active ? "white" : "transparent",
                  color: active ? "#111" : "#6b7280",
                  border: active ? "1px solid #e5e7eb" : "1px solid transparent",
                }}>
                  <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {chat.subject ?? "General Chat"}
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {lastMsg}
                  </div>
                </Link>
              );
            })
          ) : (
            <div style={{ padding: "8px", fontSize: 12, color: "#9ca3af" }}>No recent chats</div>
          )}
        </div>
      </div>

      {/* User */}
      {session?.user && (
        <div style={{ padding: "10px 12px", borderTop: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", background: "#E6F1FB",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 500, color: "#185FA5", flexShrink: 0,
          }}>
            {session.user.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {session.user.name}
            </div>
            <button
              onClick={() => signOut()}
              style={{ fontSize: 11, color: "#9ca3af", background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
