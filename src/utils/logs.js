import { nowFormatted } from "./dates.js";

export function createLogEntry(action, menu, detail, userName) {
  return {
    id: Date.now() + Math.random(),
    date: nowFormatted(),
    action,
    menu,
    user: userName || "Sistema",
    detail,
  };
}
