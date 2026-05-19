import { today } from "../data/mockData.js";

export function daysBetween(start, end) {
  if (!start || !end) return 0;
  return Math.max(1, Math.ceil((new Date(end) - new Date(start)) / 86400000));
}

export function isLate(card) {
  if (!card || !card.dueDate || card.phase === "Concluído") return false;
  return new Date(card.dueDate + "T23:59:00") < today;
}

export function formatDate(date) {
  if (!date) return "Sem prazo";
  const parts = date.split("-");
  return parts.length === 3
    ? parts[2] + "/" + parts[1] + "/" + parts[0]
    : date;
}

export function nowFormatted() {
  const now = new Date();
  return (
    now.toLocaleDateString("pt-BR") +
    " " +
    now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );
}
