import React, { useMemo, useState } from "react";
import { Plus, SlidersHorizontal } from "lucide-react";
import TaskCard from "./TaskCard.jsx";
import Button from "../ui/Button.jsx";
import TextInput from "../ui/TextInput.jsx";

function uniqueOptions(cards, field) {
  return Array.from(
    new Set(cards.map((card) => card?.[field]).filter(Boolean))
  ).sort();
}

export default function WorkView({
  board,
  cards = [],
  tags = [],
  canEdit,
  onAddCard,
  onOpenCard,
  onMoveCard,
  onAddPhase,
  newPhase,
  setNewPhase,
}) {
  const phases = board?.phases || [];
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [finishedFrom, setFinishedFrom] = useState("");
  const [finishedTo, setFinishedTo] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [requesterFilter, setRequesterFilter] = useState("all");

  const departments = useMemo(() => uniqueOptions(cards, "department"), [cards]);
  const requesters = useMemo(() => uniqueOptions(cards, "requester"), [cards]);
  const tagsInCards = useMemo(() => uniqueOptions(cards, "tag"), [cards]);
  const priorities = useMemo(() => uniqueOptions(cards, "priority"), [cards]);

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (!card) return false;
      const phaseOk = phaseFilter === "all" || card.phase === phaseFilter;
      const priorityOk = priorityFilter === "all" || card.priority === priorityFilter;
      const departmentOk = departmentFilter === "all" || card.department === departmentFilter;
      const tagOk = tagFilter === "all" || card.tag === tagFilter;
      const requesterOk = requesterFilter === "all" || card.requester === requesterFilter;
      const finishedDate = card.finishedAt || "";
      const finishedFromOk = !finishedFrom || finishedDate >= finishedFrom;
      const finishedToOk = !finishedTo || finishedDate <= finishedTo;
      const finishedOk = (!finishedFrom && !finishedTo) || (!!finishedDate && finishedFromOk && finishedToOk);
      return phaseOk && priorityOk && departmentOk && tagOk && requesterOk && finishedOk;
    });
  }, [cards, phaseFilter, priorityFilter, departmentFilter, tagFilter, requesterFilter, finishedFrom, finishedTo]);

  const visiblePhases = phaseFilter === "all" ? phases : phases.filter((phase) => phase === phaseFilter);

  function clearFilters() {
    setPhaseFilter("all");
    setFinishedFrom("");
    setFinishedTo("");
    setPriorityFilter("all");
    setDepartmentFilter("all");
    setTagFilter("all");
    setRequesterFilter("all");
  }

  return (
    <section className="flex-1 overflow-x-auto p-4 md:p-6">
      <div className="mb-4 rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-800">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros dos trabalhos
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
          <select value={phaseFilter} onChange={(e) => setPhaseFilter(e.target.value)} className="h-11 rounded-2xl border border-stone-200 bg-white px-3 text-sm outline-none">
            <option value="all">Todas as fases</option>
            {phases.map((phase) => <option key={phase}>{phase}</option>)}
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="h-11 rounded-2xl border border-stone-200 bg-white px-3 text-sm outline-none">
            <option value="all">Todas as prioridades</option>
            {priorities.map((priority) => <option key={priority}>{priority}</option>)}
          </select>
          <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="h-11 rounded-2xl border border-stone-200 bg-white px-3 text-sm outline-none">
            <option value="all">Todos os setores</option>
            {departments.map((department) => <option key={department}>{department}</option>)}
          </select>
          <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="h-11 rounded-2xl border border-stone-200 bg-white px-3 text-sm outline-none">
            <option value="all">Todos os tipos</option>
            {tagsInCards.map((tag) => <option key={tag}>{tag}</option>)}
          </select>
          <select value={requesterFilter} onChange={(e) => setRequesterFilter(e.target.value)} className="h-11 rounded-2xl border border-stone-200 bg-white px-3 text-sm outline-none">
            <option value="all">Todos os solicitantes</option>
            {requesters.map((requester) => <option key={requester}>{requester}</option>)}
          </select>
          <div className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-3 text-xs text-stone-500">
            <span>Conclusão de</span>
            <input type="date" value={finishedFrom} onChange={(e) => setFinishedFrom(e.target.value)} className="min-w-0 flex-1 bg-transparent outline-none" />
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-3 text-xs text-stone-500">
            <span>até</span>
            <input type="date" value={finishedTo} onChange={(e) => setFinishedTo(e.target.value)} className="min-w-0 flex-1 bg-transparent outline-none" />
          </div>
        </div>
        <button onClick={clearFilters} className="mt-3 text-xs font-medium text-stone-500 hover:text-stone-900">Limpar filtros</button>
      </div>

      {canEdit && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <TextInput
            value={newPhase}
            onChange={(e) => setNewPhase(e.target.value)}
            placeholder="Criar nova fase do quadro"
            className="h-10 w-64 py-2"
          />
          <Button
            onClick={onAddPhase}
            className="rounded-2xl bg-stone-950 text-white hover:bg-stone-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Criar fase
          </Button>
        </div>
      )}

      <div className="flex h-full min-h-[560px] gap-4">
        {visiblePhases.map((phase) => {
          const phaseCards = filteredCards.filter((c) => c && c.phase === phase);
          return (
            <div
              key={phase}
              className="flex h-full w-[310px] shrink-0 flex-col rounded-[1.75rem] border border-stone-200 bg-[#F2EEE7] p-3"
            >
              <div className="mb-3 flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-stone-800">{phase}</h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs text-stone-500">
                    {phaseCards.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3 overflow-y-auto pr-1">
                {phaseCards.map((card) => (
                  <TaskCard
                    key={card.id}
                    card={card}
                    tags={tags}
                    phases={phases}
                    canEdit={canEdit}
                    onClick={() => onOpenCard(card)}
                    onMove={onMoveCard}
                  />
                ))}
              </div>

              {canEdit && (
                <Button
                  onClick={() => onAddCard(phase)}
                  variant="ghost"
                  className="mt-3 rounded-2xl text-stone-500 hover:bg-white hover:text-stone-900"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Novo trabalho
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
