// src/app/(app)/notes/page.tsx
"use client";

import { useState } from "react";
import { api } from "@/lib/trpc";

const SUBJECTS = ["Physics", "Maths", "Chemistry", "CS", "English"];
const SUBJECT_COLORS: Record<string, { bg: string; text: string }> = {
  Physics:   { bg: "#E6F1FB", text: "#185FA5" },
  Maths:     { bg: "#EAF3DE", text: "#3B6D11" },
  Chemistry: { bg: "#FAEEDA", text: "#854F0B" },
  CS:        { bg: "#EEEDFE", text: "#534AB7" },
  English:   { bg: "#FAECE7", text: "#993C1D" },
};

type View = "list" | "create" | "generate" | "view";

export default function NotesPage() {
  const [view, setView] = useState<View>("list");
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", subject: "Physics", chapter: "" });
  const [genForm, setGenForm] = useState({ topic: "", subject: "Physics", chapter: "", depth: "detailed" as "brief" | "detailed" | "comprehensive" });

  const { data: notes, refetch } = api.notes.getAll.useQuery({ subject: selectedSubject, search: search || undefined });
  const { data: note } = api.notes.getById.useQuery({ id: selectedNote! }, { enabled: !!selectedNote });
  const create = api.notes.create.useMutation({ onSuccess: () => { refetch(); setView("list"); setForm({ title: "", content: "", subject: "Physics", chapter: "" }); } });
  const summarise = api.notes.summarise.useMutation({ onSuccess: () => refetch() });
  const deleteNote = api.notes.delete.useMutation({ onSuccess: () => { refetch(); setSelectedNote(null); setView("list"); } });
  const generate = api.notes.generateFromTopic.useMutation({ onSuccess: () => { refetch(); setView("list"); } });

  if (view === "view" && note) {
    return (
      <div style={{ padding: 20, flex: 1, maxWidth: 800 }}>
        <button onClick={() => { setView("list"); setSelectedNote(null); }} style={{ fontSize: 13, color: "#185FA5", background: "none", border: "none", cursor: "pointer", marginBottom: 16, padding: 0 }}>← Back</button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: SUBJECT_COLORS[note.subject]?.bg, color: SUBJECT_COLORS[note.subject]?.text }}>{note.subject}</span>
            <h1 style={{ fontSize: 20, fontWeight: 600, margin: "8px 0 4px", color: "#111" }}>{note.title}</h1>
            {note.chapter && <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Chapter: {note.chapter}</p>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => summarise.mutate({ id: note.id })} disabled={summarise.isPending} style={{ fontSize: 12, padding: "6px 12px", border: "1px solid #e5e7eb", borderRadius: 7, background: "white", cursor: "pointer" }}>
              {summarise.isPending ? "Summarising…" : "✨ Summarise"}
            </button>
            <button onClick={() => deleteNote.mutate({ id: note.id })} style={{ fontSize: 12, padding: "6px 12px", border: "1px solid #fee2e2", borderRadius: 7, background: "#fef2f2", color: "#991b1b", cursor: "pointer" }}>Delete</button>
          </div>
        </div>
        {note.summary && (
          <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: 14, marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#0369a1", margin: "0 0 6px" }}>✨ AI Summary</p>
            <pre style={{ fontSize: 13, color: "#0c4a6e", whiteSpace: "pre-wrap", margin: 0, fontFamily: "inherit", lineHeight: 1.6 }}>{note.summary}</pre>
          </div>
        )}
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
          <pre style={{ fontSize: 14, whiteSpace: "pre-wrap", margin: 0, fontFamily: "inherit", lineHeight: 1.7, color: "#374151" }}>{note.content}</pre>
        </div>
      </div>
    );
  }

  if (view === "create") {
    return (
      <div style={{ padding: 20, flex: 1, maxWidth: 700 }}>
        <button onClick={() => setView("list")} style={{ fontSize: 13, color: "#185FA5", background: "none", border: "none", cursor: "pointer", marginBottom: 16, padding: 0 }}>← Back</button>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 16px" }}>New note</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={{ padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <select value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} style={{ flex: 1, padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14 }}>
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <input placeholder="Chapter (optional)" value={form.chapter} onChange={(e) => setForm((f) => ({ ...f, chapter: e.target.value }))} style={{ flex: 1, padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14 }} />
          </div>
          <textarea placeholder="Write your notes here…" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={14} style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, fontFamily: "inherit", resize: "vertical" }} />
          <button onClick={() => create.mutate(form)} disabled={create.isPending || !form.title || !form.content} style={{ padding: "10px", background: "#185FA5", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 500, opacity: !form.title || !form.content ? 0.5 : 1 }}>
            {create.isPending ? "Saving…" : "Save note"}
          </button>
        </div>
      </div>
    );
  }

  if (view === "generate") {
    return (
      <div style={{ padding: 20, flex: 1, maxWidth: 600 }}>
        <button onClick={() => setView("list")} style={{ fontSize: 13, color: "#185FA5", background: "none", border: "none", cursor: "pointer", marginBottom: 16, padding: 0 }}>← Back</button>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 4px" }}>Generate notes with AI</h2>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>Enter a topic and StudyBot will write structured notes for you.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input placeholder="Topic (e.g. Newton's Laws of Motion)" value={genForm.topic} onChange={(e) => setGenForm((f) => ({ ...f, topic: e.target.value }))} style={{ padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <select value={genForm.subject} onChange={(e) => setGenForm((f) => ({ ...f, subject: e.target.value }))} style={{ flex: 1, padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14 }}>
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <input placeholder="Chapter (optional)" value={genForm.chapter} onChange={(e) => setGenForm((f) => ({ ...f, chapter: e.target.value }))} style={{ flex: 1, padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14 }} />
          </div>
          <div>
            <p style={{ fontSize: 13, color: "#374151", marginBottom: 6 }}>Depth:</p>
            <div style={{ display: "flex", gap: 8 }}>
              {(["brief", "detailed", "comprehensive"] as const).map((d) => (
                <button key={d} onClick={() => setGenForm((f) => ({ ...f, depth: d }))} style={{
                  padding: "6px 14px", borderRadius: 999, fontSize: 12, cursor: "pointer", border: "1px solid",
                  borderColor: genForm.depth === d ? "#185FA5" : "#e5e7eb",
                  background: genForm.depth === d ? "#E6F1FB" : "transparent",
                  color: genForm.depth === d ? "#185FA5" : "#6b7280",
                }}>{d.charAt(0).toUpperCase() + d.slice(1)}</button>
              ))}
            </div>
          </div>
          <button onClick={() => generate.mutate(genForm)} disabled={generate.isPending || !genForm.topic} style={{ padding: "10px", background: "#185FA5", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 500, opacity: !genForm.topic ? 0.5 : 1 }}>
            {generate.isPending ? "Generating…" : "✨ Generate notes"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: "#111" }}>Notes</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "2px 0 0" }}>Your study notes, AI-organised</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setView("generate")} style={{ fontSize: 13, padding: "7px 12px", background: "#f0f9ff", color: "#185FA5", border: "1px solid #bae6fd", borderRadius: 8, cursor: "pointer" }}>✨ AI Generate</button>
          <button onClick={() => setView("create")} style={{ fontSize: 13, padding: "7px 12px", background: "#185FA5", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 500 }}>+ New note</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <input placeholder="Search notes…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: "7px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, width: 200 }} />
        {["All", ...SUBJECTS].map((s) => (
          <button key={s} onClick={() => setSelectedSubject(s === "All" ? undefined : s)} style={{
            fontSize: 12, padding: "5px 10px", borderRadius: 999, cursor: "pointer", border: "1px solid",
            borderColor: (selectedSubject === s || (s === "All" && !selectedSubject)) ? "#185FA5" : "#e5e7eb",
            background: (selectedSubject === s || (s === "All" && !selectedSubject)) ? "#E6F1FB" : "transparent",
            color: (selectedSubject === s || (s === "All" && !selectedSubject)) ? "#185FA5" : "#6b7280",
          }}>{s}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {notes?.map((n) => (
          <div key={n.id} onClick={() => { setSelectedNote(n.id); setView("view"); }} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: 14, cursor: "pointer" }}>
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: SUBJECT_COLORS[n.subject]?.bg, color: SUBJECT_COLORS[n.subject]?.text }}>{n.subject}</span>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111", margin: "8px 0 4px" }}>{n.title}</div>
            <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" } as React.CSSProperties}>{n.content}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 10 }}>{new Date(n.updatedAt).toLocaleDateString()}</div>
          </div>
        ))}
        {notes?.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📝</div>
            <p>No notes yet. Create one or generate with AI.</p>
          </div>
        )}
      </div>
    </div>
  );
}
