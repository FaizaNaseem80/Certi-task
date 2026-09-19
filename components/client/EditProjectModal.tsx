"use client";

import { useState } from "react";
import { Btn, Field, Modal, Notice, inputStyle, selectStyle, textareaStyle } from "@/components/dashboard/ui";
import { api } from "@/components/dashboard/useDashboardData";
import { PROJECT_CATEGORIES, PROJECT_CATEGORY_LABEL, TEAM_CAP_MAX, TEAM_CAP_MIN, type ProjectCategory } from "@/lib/enums";
import type { ProjectDto } from "@/lib/types";

/** Edit any field of a project the client owns (FR-C6), including extending the deadline. */
export function EditProjectModal({ project, onClose, onSaved }: { project: ProjectDto; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: project.title,
    category: project.category as ProjectCategory,
    description: project.description,
    requiredSkills: project.requiredSkills.join(", "),
    deliverables: project.deliverables,
    deadline: project.deadline.slice(0, 10),
    teamCap: project.teamCap,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasApplicants = (project._count?.applications ?? 0) > 0;
  const [minDate] = useState(() => new Date(Date.now() + 86_400_000).toISOString().slice(0, 10));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const r = await api(`/api/projects/${project.id}`, "PATCH", form);
    setBusy(false);
    if (!r.ok) { setError(r.error ?? "Could not save"); return; }
    onSaved(); onClose();
  }

  return (
    <Modal title="Edit project" subtitle={hasApplicants ? "People have already applied. Changing the scope now is fine, but keep it fair to them." : project.title} onClose={onClose} maxWidth={640}>
      <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Title" required><input id="edit-title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle()} required maxLength={200} /></Field>
        <div className="mobile-dashboard-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Category" required>
            <select id="edit-category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as ProjectCategory })} style={selectStyle()}>
              {PROJECT_CATEGORIES.map(c => <option key={c} value={c}>{PROJECT_CATEGORY_LABEL[c]}</option>)}
            </select>
          </Field>
          <Field label="Team size" required hint={hasApplicants ? "Can only be raised once people have applied." : undefined}>
            <input id="edit-teamcap" type="number" min={hasApplicants ? project.teamCap : TEAM_CAP_MIN} max={TEAM_CAP_MAX} value={form.teamCap} onChange={e => setForm({ ...form, teamCap: Math.max(TEAM_CAP_MIN, Math.min(TEAM_CAP_MAX, parseInt(e.target.value) || TEAM_CAP_MIN)) })} style={inputStyle()} required />
          </Field>
        </div>
        <Field label="Description" required><textarea id="edit-description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} style={textareaStyle()} required /></Field>
        <Field label="Required skills" required hint="Comma separated. Printed on the certificate."><input id="edit-skills" value={form.requiredSkills} onChange={e => setForm({ ...form, requiredSkills: e.target.value })} style={inputStyle()} required /></Field>
        <Field label="Deliverables" required><textarea id="edit-deliverables" value={form.deliverables} onChange={e => setForm({ ...form, deliverables: e.target.value })} rows={3} style={textareaStyle()} required /></Field>
        <Field label="Deadline" required hint={form.deadline > project.deadline.slice(0, 10) ? "Extending the deadline. Selected teams get more time." : form.deadline < project.deadline.slice(0, 10) ? "Bringing the deadline forward — make sure selected teams know." : undefined}>
          <input id="edit-deadline" type="date" min={minDate} value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} style={{ ...inputStyle(), maxWidth: 240 }} required />
        </Field>
        {error && <Notice kind="error">{error}</Notice>}
        <div style={{ display: "flex", gap: 10 }}>
          <Btn type="button" variant="ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</Btn>
          <Btn type="submit" style={{ flex: 2 }} disabled={busy}>{busy ? "Saving…" : "Save changes"}</Btn>
        </div>
      </form>
    </Modal>
  );
}
