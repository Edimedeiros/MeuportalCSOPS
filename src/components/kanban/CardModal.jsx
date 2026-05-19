import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import TextInput from "../ui/TextInput.jsx";
import { tagColors } from "../../data/mockData.js";

function Field({ label, children }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-4">
      <p className="mb-1 text-xs text-stone-400">{label}</p>
      {children}
    </div>
  );
}

export default function CardModal({ card, tags = [], setTags, phases = [], onClose, onSave, canEdit }) {
  const [draft, setDraft] = useState(null);
  const [newTag, setNewTag] = useState("");
  const [newColor, setNewColor] = useState(tagColors[0]?.value || "");

  useEffect(() => {
    if (card) setDraft({ ...card });
  }, [card]);

  if (!card || !draft) return null;

  const currentTag = tags.find((t) => t.name === draft.tag);

  function addTag() {
    if (!newTag.trim()) return;
    const exists = tags.find((t) => t.name === newTag.trim());
    if (!exists) {
      setTags([...tags, { name: newTag.trim(), color: newColor }]);
    }
    setDraft({ ...draft, tag: newTag.trim() });
    setNewTag("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/30 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <Badge className={currentTag?.color || tagColors[0]?.value || ""}>
            {draft.tag || ""}
          </Badge>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-stone-100"
          >
            <X className="h-5 w-5 text-stone-500" />
          </button>
        </div>

        <input
          value={draft.title || ""}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          disabled={!canEdit}
          className="mb-4 w-full rounded-2xl border border-transparent bg-stone-50 px-4 py-3 text-2xl font-semibold tracking-tight text-stone-950 outline-none focus:border-stone-200"
        />

        <textarea
          value={draft.description || ""}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          disabled={!canEdit}
          rows={4}
          className="mb-5 w-full resize-none rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm leading-6 text-stone-700 outline-none focus:ring-4 focus:ring-stone-100"
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Fase">
            <select
              value={draft.phase || ""}
              onChange={(e) => setDraft({ ...draft, phase: e.target.value })}
              disabled={!canEdit}
              className="w-full bg-transparent text-sm font-medium text-stone-700 outline-none"
            >
              {phases.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Prioridade">
            <select
              value={draft.priority || "Normal"}
              onChange={(e) => setDraft({ ...draft, priority: e.target.value })}
              disabled={!canEdit}
              className="w-full bg-transparent text-sm font-medium text-stone-700 outline-none"
            >
              <option>Normal</option>
              <option>Prioridade</option>
              <option>Urgente</option>
            </select>
          </Field>
          <Field label="Prazo">
            <input
              type="date"
              value={draft.dueDate || ""}
              onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
              disabled={!canEdit}
              className="w-full bg-transparent text-sm font-medium text-stone-700 outline-none"
            />
          </Field>
          <Field label="Solicitante">
            <input
              value={draft.requester || ""}
              onChange={(e) => setDraft({ ...draft, requester: e.target.value })}
              disabled={!canEdit}
              className="w-full bg-transparent text-sm font-medium text-stone-700 outline-none"
            />
          </Field>
          <Field label="E-mail">
            <input
              value={draft.requesterEmail || ""}
              onChange={(e) =>
                setDraft({ ...draft, requesterEmail: e.target.value })
              }
              disabled={!canEdit}
              className="w-full bg-transparent text-sm font-medium text-stone-700 outline-none"
            />
          </Field>
          <Field label="Setor">
            <input
              value={draft.department || ""}
              onChange={(e) =>
                setDraft({ ...draft, department: e.target.value })
              }
              disabled={!canEdit}
              className="w-full bg-transparent text-sm font-medium text-stone-700 outline-none"
            />
          </Field>
        </div>

        <div className="mt-5 rounded-3xl bg-stone-50 p-4">
          <h4 className="mb-3 font-semibold text-stone-900">Criar nova tag</h4>
          <div className="grid gap-3 md:grid-cols-[1fr_160px_120px]">
            <TextInput
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Nome da tag"
            />
            <select
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="h-12 rounded-2xl border border-stone-200 bg-white px-3 text-sm outline-none"
            >
              {tagColors.map((c) => (
                <option key={c.label} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <Button
              onClick={addTag}
              disabled={!canEdit}
              className="rounded-2xl bg-stone-950 text-white hover:bg-stone-800"
            >
              Criar tag
            </Button>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="rounded-2xl border-stone-200"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => onSave(draft)}
            disabled={!canEdit}
            className="rounded-2xl bg-stone-950 text-white hover:bg-stone-800 disabled:opacity-40"
          >
            Salvar alterações
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
