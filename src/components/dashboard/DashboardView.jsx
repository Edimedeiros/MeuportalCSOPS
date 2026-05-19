import React, { useState } from "react";
import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  CalendarDays,
  UserCircle,
} from "lucide-react";
import { Card, CardContent } from "../ui/Card.jsx";
import MetricCard from "./MetricCard.jsx";
import ListRanking from "./ListRanking.jsx";
import DepartmentPie from "./DepartmentPie.jsx";
import { isLate, daysBetween } from "../../utils/dates.js";
import { pieColors } from "../../data/mockData.js";

function VerticalPhaseChart({ data }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="flex h-64 items-end gap-4 overflow-x-auto rounded-3xl bg-stone-50 px-4 pb-4 pt-6">
      {data.map((item, index) => {
        const height = Math.max(10, (item.value / max) * 100);
        const color = pieColors[index % pieColors.length];
        return (
          <div key={item.label} className="flex min-w-[86px] flex-1 flex-col items-center gap-2">
            <div className="text-sm font-semibold text-stone-900">{item.value}</div>
            <div className="flex h-40 w-11 items-end rounded-full bg-white p-1 shadow-inner">
              <div
                className="w-full rounded-full transition-all"
                style={{ height: height + "%", backgroundColor: color }}
                title={`${item.label}: ${item.value}`}
              />
            </div>
            <div className="max-w-[90px] text-center text-xs font-medium text-stone-600">
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardView({ board, cards = [] }) {
  const [filter, setFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const phases = board?.phases || [];

  const filtered = cards.filter((card) => {
    if (!card) return false;
    const statusOk =
      filter === "all" ||
      (filter === "late" ? isLate(card) : !isLate(card));
    const baseDate = card.startedAt || card.dueDate || "";
    const fromOk = !dateFrom || baseDate >= dateFrom;
    const toOk = !dateTo || baseDate <= dateTo;
    return statusOk && fromOk && toOk;
  });

  const byPhase = phases.map((phase) => ({
    label: phase,
    value: filtered.filter((c) => c.phase === phase).length,
  }));

  const done = filtered.filter((c) => c.phase === "Concluído");
  const avgDone = done.length
    ? Math.round(
        done.reduce((sum, c) => sum + daysBetween(c.startedAt, c.finishedAt), 0) /
          done.length
      )
    : 0;

  const inProgress = filtered.filter(
    (c) => !["A fazer", "Concluído"].includes(c.phase)
  ).length;
  const late = filtered.filter(isLate).length;
  const completed = filtered.filter((c) => c.phase === "Concluído").length;

  const requesterData = Object.entries(
    filtered.reduce((acc, c) => {
      const key = c.requester || "Não informado";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const departmentData = Object.entries(
    filtered.reduce((acc, c) => {
      const key = c.department || "Não informado";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  return (
    <section className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-end gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-500">
            <span>De</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="outline-none"
            />
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-500">
            <span>Até</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="outline-none"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-10 rounded-2xl border border-stone-200 bg-white px-3 text-sm outline-none"
          >
            <option value="all">Todos</option>
            <option value="onTime">Em dia</option>
            <option value="late">Atrasados</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={ClipboardList} label="Total de trabalhos" value={filtered.length} hint="Tudo que está no quadro" />
        <MetricCard icon={Clock3} label="Em andamento" value={inProgress} hint="Sendo feito ou validado" />
        <MetricCard icon={CheckCircle2} label="Concluídos" value={completed} hint="Entregas finalizadas" />
        <MetricCard icon={AlertTriangle} label="Atrasados" value={late} hint="Prazo vencido" negative={late > 0} />
        <MetricCard icon={CalendarDays} label="Tempo médio" value={avgDone + " dias"} hint="Média de conclusão" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-3xl border-stone-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <h4 className="mb-4 font-semibold text-stone-900">Trabalhos por fase</h4>
            <VerticalPhaseChart data={byPhase} />
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-stone-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <h4 className="mb-4 font-semibold text-stone-900">Leitura rápida</h4>
            <div className="space-y-3 text-sm text-stone-600">
              <p><strong className="text-stone-900">Maior volume:</strong> {requesterData[0]?.[0] || "Sem dados"}</p>
              <p><strong className="text-stone-900">Setor que mais pede:</strong> {departmentData[0]?.[0] || "Sem dados"}</p>
              <p><strong className="text-stone-900">Atenção:</strong> acompanhe atrasados e trabalhos parados em validação.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <ListRanking title="Quem mais envia demandas" icon={UserCircle} data={requesterData} />
        <DepartmentPie data={departmentData} />
      </div>
    </section>
  );
}
