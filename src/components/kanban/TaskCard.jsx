import React from "react";
import { motion } from "framer-motion";
import { CalendarDays, MoveRight } from "lucide-react";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import { isLate, formatDate } from "../../utils/dates.js";
import { tagColors } from "../../data/mockData.js";

export default function TaskCard({ card, tags = [], onClick, onMove, phases = [], canEdit }) {
  if (!card) return null;

  const tag = tags.find((item) => item.name === card.tag);
  const late = isLate(card);
  const currentPhaseIndex = phases.indexOf(card.phase);
  const nextPhase = currentPhaseIndex >= 0 ? phases[currentPhaseIndex + 1] : null;

  const cardTooltip = [
    "Solicitante: " + (card.requester || "Não informado"),
    "Setor: " + (card.department || "Não informado"),
    "Prazo de conclusão: " + formatDate(card.dueDate),
  ].join("\n");

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      title={cardTooltip}
      className="w-full rounded-3xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
    >
      <button onClick={onClick} className="w-full text-left">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge className={tag?.color || tagColors[0]?.value || ""}>
              {card.tag || ""}
            </Badge>
            {card.phase === "Concluído" && (
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                Concluído
              </Badge>
            )}
          </div>
          {late ? (
            <Badge className="border-red-200 bg-red-50 text-red-700">
              Atrasado
            </Badge>
          ) : (
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
              Em dia
            </Badge>
          )}
        </div>
        <h4 className="text-sm font-semibold leading-5 text-stone-900">
          {card.title || "Sem título"}
        </h4>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-stone-500">
          {card.description || ""}
        </p>
        <div className="mt-4 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 font-semibold text-stone-600">
              {card.owner || "?"}
            </div>
            <span>{card.priority || ""}</span>
          </div>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(card.dueDate)}
          </span>
        </div>
      </button>
      {canEdit && nextPhase && (
        <Button
          onClick={() => onMove(card.id, nextPhase)}
          variant="ghost"
          className="mt-3 h-8 rounded-xl px-2 text-xs text-stone-500 hover:bg-stone-50"
        >
          Mover para {nextPhase}
          <MoveRight className="ml-1 h-3 w-3" />
        </Button>
      )}
    </motion.div>
  );
}
