// src/app/(app)/timetable/page.tsx
"use client";

import { useState } from "react";
import { api } from "@/lib/trpc";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
const SUBJECTS = ["Physics", "Maths", "Chemistry", "CS", "English"];
const SUBJECT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Physics:   { bg: "#E6F1FB", border: "#B5D4F4", text: "#185FA5" },
  Maths:     { bg: "#EAF3DE", border: "#C0DD97", text: "#3B6D11" },
  Chemistry: { bg: "#FAEEDA", border: "#FAC775", text: "#854F0B" },
  CS:        { bg: "#EEEDFE", border: "#CECBF6", text: "#534AB7" },
  English:   { bg: "#FAECE7", border: "#F5C4B3", text: "#993C1D" },
};

export default function TimetablePage() {
  const [showGenerator, setShowGenerator] = useState(false);
  const [genSubjects, setGenSubjects] = useState<string[]>(["Physics", "Maths"]);
  const [hoursPerSubject, setHoursPerSubject] = useState<Record<string, number>>({ Physics: 4, Maths: 4 });

  const { data: slots, refetch } = api.timetable.get.useQuery();
  const generate = api.timetable.generate.useMutation({ onSuccess: () => { refetch(); setShowGenerator(false); } });
  const deleteSlot = api.timetable.deleteSlot.useMutation({ onSuccess: () => refetch() });

  const getSlot = (day: string, time: string) =>
    slots?.find((s) => s.day === day && s.startTime === time);

  const toggleSubject = (s: string) => {
    setGenSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
    setHoursPerSubject((prev) => {
      const next = { ...prev };
      if (prev[s]) delete next[s]; else next[s] = 3;
      return next;
    });
  };

  const handleGenerate = () => {
    const available = DAYS.flatMap((day) =>
      TIME_SLOTS.slice(0, -1).map((startTime, i) => ({ day, startTime, endTime: TIME_SLOTS[i + 1]! }))
    );
    generate.mutate({ subjects: genSubjects, hoursPerSubject, availableSlots: available });
  };

  return (
    <div style={{ padding: "20px", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: "#111" }}>Timetable</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "2px 0 0" }}>Your weekly class and study schedule</p>
        </div>
        <button onClick={() => setShowGenerator(!showGenerator)} style={{
          fontSize: 13, padding: "8px 14px", background: "#185FA5", color: "white",
          border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 500,
        }}>
          {showGenerator ? "Close" : "✨ Generate with AI"}
        </button>
      </div>

      {/* Generator Panel */}
      {showGenerator && (
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px" }}>AI Timetable Generator</h3>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 12px" }}>Select subjects and set weekly hours:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {SUBJECTS.map((s) => (
              <button key={s} onClick={() => toggleSubject(s)} style={{
                padding: "5px 12px", borderRadius: 999, fontSize: 12, cursor: "pointer", border: "1px solid",
                borderColor: genSubjects.includes(s) ? SUBJECT_COLORS[s]!.text : "#e5e7eb",
                background: genSubjects.includes(s) ? SUBJECT_COLORS[s]!.bg : "transparent",
                color: genSubjects.includes(s) ? SUBJECT_COLORS[s]!.text : "#6b7280",
              }}>{s}</button>
            ))}
          </div>
          {genSubjects.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8, marginBottom: 14 }}>
              {genSubjects.map((s) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: "#374151", minWidth: 70 }}>{s}</span>
                  <input type="number" min={1} max={10} value={hoursPerSubject[s] ?? 3}
                    onChange={(e) => setHoursPerSubject((p) => ({ ...p, [s]: Number(e.target.value) }))}
                    style={{ width: 52, padding: "4px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13 }}
                  />
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>hrs/wk</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={handleGenerate} disabled={generate.isPending || genSubjects.length === 0} style={{
            padding: "8px 16px", background: "#185FA5", color: "white", border: "none",
            borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500,
            opacity: generate.isPending || genSubjects.length === 0 ? 0.6 : 1,
          }}>
            {generate.isPending ? "Generating…" : "Generate timetable"}
          </button>
        </div>
      )}

      {/* Timetable Grid */}
      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "64px repeat(5, 1fr)", borderBottom: "1px solid #f3f4f6" }}>
          <div />
          {DAYS.map((d) => (
            <div key={d} style={{ padding: "10px 8px", textAlign: "center", fontSize: 12, fontWeight: 600, color: "#374151", borderLeft: "1px solid #f3f4f6" }}>{d}</div>
          ))}
        </div>
        {TIME_SLOTS.slice(0, -1).map((time) => (
          <div key={time} style={{ display: "grid", gridTemplateColumns: "64px repeat(5, 1fr)", borderBottom: "1px solid #f9fafb", minHeight: 56 }}>
            <div style={{ fontSize: 11, color: "#9ca3af", padding: "8px 8px 0", textAlign: "right" }}>{time}</div>
            {DAYS.map((day) => {
              const slot = getSlot(day, time);
              const colors = slot ? SUBJECT_COLORS[slot.subject] : null;
              return (
                <div key={day} style={{ borderLeft: "1px solid #f3f4f6", padding: 4 }}>
                  {slot && colors ? (
                    <div style={{
                      background: colors.bg, border: `1px solid ${colors.border}`,
                      borderRadius: 6, padding: "5px 8px", height: "100%", position: "relative",
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: colors.text }}>{slot.subject}</div>
                      {slot.room && <div style={{ fontSize: 10, color: colors.text, opacity: 0.7, marginTop: 1 }}>{slot.room}</div>}
                      <button onClick={() => deleteSlot.mutate({ id: slot.id })} style={{
                        position: "absolute", top: 3, right: 4, background: "none", border: "none",
                        fontSize: 10, cursor: "pointer", color: colors.text, opacity: 0.5, padding: 0,
                      }}>✕</button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
