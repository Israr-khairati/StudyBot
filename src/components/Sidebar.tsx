// src/components/Sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { api } from "@/lib/trpc";

const NAV = [
  { href: "/chat", label: "Ask a doubt", icon: "💬" },
  { href: "/timetable", label: "Timetable", icon: "📅" },
  { href: "/notes", label: "Notes", icon: "📝" },
  { href: "/exams", label: "Exam prep", icon: "🎯" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Fetch recent chat history
  const { data: recentChats, isLoading } = api.doubt.getChats.useQuery(undefined, {
    enabled: !!session?.user,
  });

  const sidebarWidth = isCollapsed ? 64 : 240;

  return (
    <aside style={{
      width: sidebarWidth, minHeight: "100vh", background: "#f3f4f6",
      borderRight: "1px solid #e5e7eb", display: "flex",
      flexDirection: "column", flexShrink: 0,
      transition: "width 0.2s ease",
    }}>
      {/* Logo Area */}
      <div style={{
        padding: "16px", borderBottom: "1px solid #e5e7eb",
        display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
          <div style={{
            width: 28, height: 28, background: "#185FA5", borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 600, fontSize: 14, flexShrink: 0,
          }}>S</div>
          {!isCollapsed && <span style={{ fontSize: 15, fontWeight: 600, color: "#111", whiteSpace: "nowrap" }}>StudyBot</span>}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 4, borderRadius: 4, display: "flex", alignItems: "center",
            color: "#6b7280", transition: "background 0.2s",
            marginLeft: isCollapsed ? 0 : 4,
          }}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isCollapsed ? (
              <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
            ) : (
              <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
            )}
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav style={{ padding: 8 }}>
        {!isCollapsed && (
          <p style={{ fontSize: 11, color: "#9ca3af", padding: "8px 8px 4px", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
            Features
          </p>
        )}
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "flex-start",
              gap: 8, padding: "7px 10px", borderRadius: 7, marginBottom: 2,
              textDecoration: "none", fontSize: 13,
              background: active ? "white" : "transparent",
              color: active ? "#111" : "#6b7280",
              fontWeight: active ? 500 : 400,
              border: active ? "1px solid #e5e7eb" : "1px solid transparent",
              overflow: "hidden",
            }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>{item.icon}</span>
              {!isCollapsed && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Recent Chats Section */}
      <div style={{ padding: 8, flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {!isCollapsed && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 8px 4px" }}>
            <p style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
              Recent History
            </p>
            <Link href="/chat" style={{ fontSize: 11, color: "#185FA5", textDecoration: "none", fontWeight: 500 }}>
              New +
            </Link>
          </div>
        )}

        <div style={{ marginTop: 4, display: "flex", flexDirection: "column", alignItems: isCollapsed ? "center" : "stretch" }}>
          {isLoading ? (
            !isCollapsed && <div style={{ padding: "8px", fontSize: 12, color: "#9ca3af" }}>Loading...</div>
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
                  width: "100%", overflow: "hidden",
                }}>
                  {isCollapsed ? (
                    <div style={{ display: "flex", justifyContent: "center", fontSize: 14 }}>💬</div>
                  ) : (
                    <>
                      <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {chat.subject ?? "General Chat"}
                      </div>
                      <div style={{ fontSize: 11, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {lastMsg}
                      </div>
                    </>
                  )}
                </Link>
              );
            })
          ) : (
            !isCollapsed && <div style={{ padding: "8px", fontSize: 12, color: "#9ca3af" }}>No recent chats</div>
          )}
        </div>
      </div>

      {/* User */}
      {session?.user && (
        <div style={{
          padding: "10px 12px", borderTop: "1px solid #e5e7eb",
          display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "flex-start",
          gap: 8,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", background: "#E6F1FB",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 500, color: "#185FA5", flexShrink: 0,
          }}>
            {session.user.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          {!isCollapsed && (
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
          )}
        </div>
      )}
    </aside>
  );
}
