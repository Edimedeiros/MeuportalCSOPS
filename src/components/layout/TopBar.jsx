import React from "react";
import { Search } from "lucide-react";

const pageInfo = {
  work: {
    title: "Meus Trabalhos",
    subtitle: "Todas as tarefas em um só lugar",
  },
  dash: {
    title: "Dashboards",
    subtitle: "Resultado do seu trabalho, prazos, volume e origem das demandas.",
  },
  form: {
    title: "Formulário de pedido",
    subtitle: "Crie o formulário que outras pessoas vão usar para abrir solicitações.",
  },
  flow: {
    title: "Fluxogramas",
    subtitle: "Crie pastas, salve fluxos e organize seus processos.",
  },
  people: {
    title: "Pessoas",
    subtitle: "Defina quem pode ver, editar e quais cards cada pessoa pode acessar.",
  },
  logs: {
    title: "Logs",
    subtitle: "Histórico de criação, edição, exclusão e mudanças importantes do sistema.",
  },
  settings: {
    title: "Configurações",
    subtitle: "Controle sua foto, segurança e aparência do portal.",
  },
};

export default function TopBar({ activeMenu = "work", search, setSearch }) {
  const info = pageInfo[activeMenu] || pageInfo.work;
  return (
    <header className="topbar border-b border-stone-200 bg-white/80 px-4 py-5 backdrop-blur md:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="page-title text-2xl font-semibold tracking-tight text-stone-950 md:text-3xl">
            {info.title}
          </h2>
          <p className="page-subtitle mt-1 text-sm text-stone-500">
            {info.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar trabalhos..."
              className="h-10 w-full rounded-2xl border border-stone-200 bg-white pl-10 pr-4 text-sm outline-none focus:ring-4 focus:ring-stone-100"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
