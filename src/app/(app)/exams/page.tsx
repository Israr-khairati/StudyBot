// src/app/(app)/exams/page.tsx
"use client";

import { useState } from "react";
import { api } from "@/lib/trpc";

const SUBJECTS = ["Physics", "Maths", "Chemistry", "CS", "English", "Biology", "History", "Geography", "Economics", "Psychology", "Sociology", "Physical Education", "Art", "Music"];
const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Physics:            { bg: "#E6F1FB", text: "#185FA5", border: "#B5D4F4" },
  Maths:              { bg: "#EAF3DE", text: "#3B6D11", border: "#C0DD97" },
  Chemistry:          { bg: "#FAEEDA", text: "#854F0B", border: "#FAC775" },
  CS:                 { bg: "#EEEDFE", text: "#534AB7", border: "#CECBF6" },
  English:            { bg: "#FAECE7", text: "#993C1D", border: "#F5C4B3" },
  Biology:            { bg: "#E6F4EA", text: "#1E7E34", border: "#C3E6CB" },
  History:            { bg: "#FEF7E0", text: "#B06000", border: "#FDE293" },
  Geography:          { bg: "#E8F0FE", text: "#1967D2", border: "#AECBFA" },
  Economics:          { bg: "#FCE8E6", text: "#C5221F", border: "#FAD2CF" },
  Psychology:         { bg: "#F3E5F5", text: "#7B1FA2", border: "#E1BEE7" },
  Sociology:          { bg: "#FFF3E0", text: "#E65100", border: "#FFE0B2" },
  "Physical Education": { bg: "#E0F2F1", text: "#00695C", border: "#B2DFDB" },
  Art:                { bg: "#FCE4EC", text: "#C2185B", border: "#F8BBD0" },
  Music:              { bg: "#E1F5FE", text: "#0288D1", border: "#B3E5FC" },
};

type View = "list" | "practice" | "plan";

type Question = {
  id: number; type: string; question: string;
  options?: string[]; answer: string; explanation: string;
  difficulty: string; chapter: string;
};

export default function ExamsPage() {
  const [view, setView] = useState<View>("list");
  const [showAdd, setShowAdd] = useState(false);
  const [practiceExamId, setPracticeExamId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [studyPlan, setStudyPlan] = useState<{ plan: string; daysUntilExam: number } | null>(null);
  const [form, setForm] = useState({ subject: "Physics", title: "", date: "", duration: 120, room: "", chapters: "" });
  const [practiceConfig, setPracticeConfig] = useState({ count: 10, difficulty: "mixed" as const, types: ["mcq", "short"] as string[] });

  const { data: exams, refetch } = api.exams.getAll.useQuery();
  const create = api.exams.create.useMutation({ onSuccess: () => { refetch(); setShowAdd(false); } });
  const deleteExam = api.exams.delete.useMutation({ onSuccess: () => refetch() });
  const genQuestions = api.exams.generateQuestions.useMutation({ onSuccess: (d) => { setQuestions(d.questions); setRevealed(new Set()); setView("practice"); } });
  const genPlan = api.exams.getStudyPlan.useMutation({ onSuccess: (d) => { setStudyPlan(d); setView("plan"); } });

  const daysUntil = (date: Date) => Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);

  const urgencyBadge = (days: number) => {
    if (days < 0) return { label: "Past", bg: "#f3f4f6", text: "#9ca3af" };
    if (days <= 7) return { label: `${days}d left`, bg: "#fee2e2", text: "#991b1b" };
    if (days <= 14) return { label: `${days}d left`, bg: "#FAEEDA", text: "#854F0B" };
    return { label: `${days}d left`, bg: "#EAF3DE", text: "#3B6D11" };
  };

  if (view === "practice") {
    return (
      <div style={{ padding: 20, flex: 1, maxWidth: 720 }}>
        <button onClick={() => setView("list")} style={{ fontSize: 13, color: "#185FA5", background: "none", border: "none", cursor: "pointer", marginBottom: 16, padding: 0 }}>← Back</button>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 4px" }}>Practice questions</h2>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>
          {Array.isArray(questions) ? `${questions.length} questions generated` : "Generating questions..."}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {Array.isArray(questions) && questions.map((q, i) => (
            <div key={q.id} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "#f3f4f6", color: "#6b7280" }}>{q.type.toUpperCase()}</span>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: q.difficulty === "easy" ? "#EAF3DE" : q.difficulty === "hard" ? "#fee2e2" : "#FAEEDA", color: q.difficulty === "easy" ? "#3B6D11" : q.difficulty === "hard" ? "#991b1b" : "#854F0B" }}>{q.difficulty}</span>
                <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: "auto" }}>{q.chapter}</span>
              </div>
              <p style={{ fontSize: 14, color: "#111", margin: "0 0 10px", lineHeight: 1.6 }}><strong>Q{i + 1}.</strong> {q.question}</p>
              {q.options && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                  {q.options.map((opt, oi) => (
                    <div key={oi} style={{ fontSize: 13, padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: 6, color: "#374151" }}>
                      {String.fromCharCode(65 + oi)}. {opt}
                    </div>
                  ))}
                </div>
              )}
              {revealed.has(i) ? (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#166534", margin: "0 0 4px" }}>Answer:</p>
                  <p style={{ fontSize: 13, color: "#15803d", margin: "0 0 6px" }}>{q.answer}</p>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{q.explanation}</p>
                </div>
              ) : (
                <button onClick={() => setRevealed((r) => new Set([...r, i]))} style={{ fontSize: 12, padding: "6px 12px", border: "1px solid #e5e7eb", borderRadius: 7, background: "transparent", cursor: "pointer", color: "#374151" }}>
                  Reveal answer
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === "plan" && studyPlan) {
    return (
      <div style={{ padding: 20, flex: 1, maxWidth: 700 }}>
        <button onClick={() => setView("list")} style={{ fontSize: 13, color: "#185FA5", background: "none", border: "none", cursor: "pointer", marginBottom: 16, padding: 0 }}>← Back</button>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 4px" }}>Study plan</h2>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>{studyPlan.daysUntilExam} days until the exam</p>
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
          <pre style={{ fontSize: 14, whiteSpace: "pre-wrap", margin: 0, fontFamily: "inherit", lineHeight: 1.7, color: "#374151" }}>{studyPlan.plan}</pre>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: "#111" }}>Exam prep</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "2px 0 0" }}>Track upcoming exams and practice</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ fontSize: 13, padding: "8px 14px", background: "#185FA5", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 500 }}>
          {showAdd ? "Cancel" : "+ Add exam"}
        </button>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Upcoming", value: exams?.filter((e) => daysUntil(e.date) >= 0).length ?? 0 },
          { label: "Days to next", value: exams?.filter((e) => daysUntil(e.date) >= 0).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ? daysUntil(exams!.filter((e) => daysUntil(e.date) >= 0)[0]!.date) : "—" },
          { label: "Total exams", value: exams?.length ?? 0 },
        ].map((s) => (
          <div key={s.label} style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: "#111", marginTop: 2 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px" }}>Add exam</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <select value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} style={{ padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13 }}>
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <input placeholder="Exam title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={{ padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13 }} />
            <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} style={{ padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13 }} />
            <input placeholder="Duration (min)" type="number" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: Number(e.target.value) }))} style={{ padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13 }} />
            <input placeholder="Room (optional)" value={form.room} onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} style={{ padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13 }} />
            <input placeholder="Chapters (comma separated)" value={form.chapters} onChange={(e) => setForm((f) => ({ ...f, chapters: e.target.value }))} style={{ padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13 }} />
          </div>
          <button onClick={() => create.mutate({ ...form, date: new Date(form.date), chapters: form.chapters.split(",").map((c) => c.trim()).filter(Boolean) })} disabled={create.isPending || !form.title || !form.date} style={{ marginTop: 12, padding: "8px 16px", background: "#185FA5", color: "white", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
            {create.isPending ? "Saving…" : "Save exam"}
          </button>
        </div>
      )}

      {/* Practice config */}
      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 10px" }}>Generate practice questions</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <select onChange={(e) => setPracticeExamId(e.target.value)} defaultValue="" style={{ padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12 }}>
            <option value="" disabled>Select exam</option>
            {exams?.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          <input type="number" min={5} max={30} value={practiceConfig.count} onChange={(e) => setPracticeConfig((p) => ({ ...p, count: Number(e.target.value) }))} style={{ width: 60, padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12 }} />
          <span style={{ fontSize: 12, color: "#6b7280" }}>questions</span>
          {["mcq", "short", "long"].map((t) => (
            <button key={t} onClick={() => setPracticeConfig((p) => ({ ...p, types: p.types.includes(t) ? p.types.filter((x) => x !== t) : [...p.types, t] }))} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 999, cursor: "pointer", border: "1px solid", borderColor: practiceConfig.types.includes(t) ? "#185FA5" : "#e5e7eb", background: practiceConfig.types.includes(t) ? "#E6F1FB" : "transparent", color: practiceConfig.types.includes(t) ? "#185FA5" : "#6b7280" }}>{t.toUpperCase()}</button>
          ))}
          <button onClick={() => { const exam = exams?.find((e) => e.id === practiceExamId); if (!exam) return; genQuestions.mutate({ subject: exam.subject, chapters: exam.chapters, types: practiceConfig.types as ("mcq"|"short"|"long")[], count: practiceConfig.count, difficulty: practiceConfig.difficulty }); }} disabled={!practiceExamId || genQuestions.isPending} style={{ padding: "6px 14px", background: "#185FA5", color: "white", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 500, opacity: !practiceExamId ? 0.5 : 1 }}>
            {genQuestions.isPending ? "Generating…" : "✨ Generate"}
          </button>
        </div>
      </div>

      {/* Exam list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {exams?.map((exam) => {
          const days = daysUntil(exam.date);
          const badge = urgencyBadge(days);
          const colors = SUBJECT_COLORS[exam.subject];
          return (
            <div key={exam.id} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 16px", display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 46, height: 46, borderRadius: 8, background: colors?.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: colors?.text, lineHeight: 1 }}>{new Date(exam.date).getDate()}</div>
                <div style={{ fontSize: 10, color: colors?.text }}>{new Date(exam.date).toLocaleString("default", { month: "short" })}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{exam.title}</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{exam.subject} · {exam.duration} min{exam.room ? ` · ${exam.room}` : ""}</div>
              </div>
              <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 999, background: badge.bg, color: badge.text, flexShrink: 0 }}>{badge.label}</span>
              <button onClick={() => { setPracticeExamId(exam.id); genPlan.mutate({ examId: exam.id }); }} disabled={genPlan.isPending} style={{ fontSize: 12, padding: "5px 10px", border: "1px solid #e5e7eb", borderRadius: 7, background: "transparent", cursor: "pointer", color: "#374151", flexShrink: 0 }}>
                {genPlan.isPending && practiceExamId === exam.id ? "…" : "Study plan"}
              </button>
              <button onClick={() => deleteExam.mutate({ id: exam.id })} style={{ fontSize: 12, padding: "5px 10px", border: "1px solid #fee2e2", borderRadius: 7, background: "#fef2f2", color: "#991b1b", cursor: "pointer", flexShrink: 0 }}>✕</button>
            </div>
          );
        })}
        {exams?.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
            <p>No exams added yet. Add your first exam above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
