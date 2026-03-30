import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect("/chat");
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
      <div style={{ maxWidth: 480, width: "100%", padding: "2rem", textAlign: "center" }}>
        <div style={{
          width: 56, height: 56, background: "#185FA5", borderRadius: 14,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, color: "white", fontWeight: 600, margin: "0 auto 1.5rem"
        }}>S</div>

        <h1 style={{ fontSize: 28, fontWeight: 600, margin: "0 0 0.5rem", color: "#111" }}>
          StudyBot
        </h1>
        <p style={{ color: "#6b7280", marginBottom: "2rem", lineHeight: 1.6 }}>
          Your AI-powered student assistant. Solve doubts, generate timetables,
          organise notes and prepare for exams — all in one place.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "2rem" }}>
          {[
            { icon: "💬", label: "Doubt solving", desc: "Ask anything, get instant AI answers" },
            { icon: "📅", label: "Timetable", desc: "Auto-generate your weekly schedule" },
            { icon: "📝", label: "Smart notes", desc: "AI-summarised notes by subject" },
            { icon: "🎯", label: "Exam prep", desc: "Practice questions & study plans" },
          ].map((f) => (
            <div key={f.label} style={{
              background: "white", border: "1px solid #e5e7eb", borderRadius: 10,
              padding: "1rem", textAlign: "left"
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111", marginBottom: 2 }}>{f.label}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{f.desc}</div>
            </div>
          ))}
        </div>

        <a href="/auth/signin" style={{
          display: "block", background: "#185FA5", color: "white",
          padding: "0.75rem 1.5rem", borderRadius: 8, textDecoration: "none",
          fontWeight: 500, fontSize: 15
        }}>
          Get started — it's free
        </a>
      </div>
    </main>
  );
}
