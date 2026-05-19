import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  LayoutDashboard,
  ShieldCheck,
  ClipboardList,
  FileText,
  BarChart3,
} from "lucide-react";

import Sidebar from "./components/layout/Sidebar.jsx";
import TopBar from "./components/layout/TopBar.jsx";
import WorkView from "./components/kanban/WorkView.jsx";
import CardModal from "./components/kanban/CardModal.jsx";
import DashboardView from "./components/dashboard/DashboardView.jsx";
import RequestFormView from "./components/form/RequestFormView.jsx";
import FlowView from "./components/flow/FlowView.jsx";
import PeopleView from "./components/people/PeopleView.jsx";
import LogsView from "./components/logs/LogsView.jsx";
import SettingsView from "./components/settings/SettingsView.jsx";

import Button from "./components/ui/Button.jsx";
import { Card, CardContent } from "./components/ui/Card.jsx";
import TextInput from "./components/ui/TextInput.jsx";

import {
  startWorkspaces,
  startUsers,
  startTags,
  startDepartments,
  startServiceTypes,
  initialLogs,
} from "./data/mockData.js";
import { canSeeCard } from "./utils/permissions.js";
import { nowFormatted } from "./utils/dates.js";

// ─── Login Screen ────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F1EA] p-4 text-stone-900">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/70 px-4 py-2 text-sm text-stone-600 shadow-sm backdrop-blur">
            <ShieldCheck className="h-4 w-4" />
            Sistema privado para gestão de trabalhos
          </div>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-stone-950 md:text-6xl">
            Organize seus trabalhos em uma área limpa, colaborativa e segura.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-stone-600 md:text-lg">
            Controle pedidos, prioridades, prazos, indicadores, fluxogramas e
            entregas em um só lugar.
          </p>
          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
            {[
              [ClipboardList, "Quadros simples"],
              [FileText, "Pedidos por formulário"],
              [BarChart3, "Resultados visuais"],
            ].map(([Icon, label]) => (
              <div
                key={label}
                className="rounded-3xl border border-stone-200 bg-white/70 p-4 shadow-sm"
              >
                <Icon className="mb-3 h-5 w-5 text-stone-700" />
                <p className="text-sm font-medium text-stone-700">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          <Card className="overflow-hidden rounded-[2rem] border-stone-200 bg-white/85 shadow-2xl shadow-stone-300/40 backdrop-blur">
            <CardContent className="p-8">
              <div className="mb-7">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-lg shadow-stone-300">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
                  Entrar no portal
                </h2>
                <p className="mt-2 text-sm text-stone-500">
                  Acesse com e-mail e senha ou com sua conta Gmail.
                </p>
              </div>

              <div className="space-y-4">
                <TextInput
                  icon={Mail}
                  type="email"
                  defaultValue="edimarley.oliveira@acessorias.com"
                  placeholder="Seu e-mail"
                />
                <div className="relative">
                  <TextInput
                    icon={Lock}
                    type={showPassword ? "text" : "password"}
                    defaultValue="123456"
                    placeholder="Sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <Button
                  onClick={onLogin}
                  className="h-12 w-full rounded-2xl bg-stone-950 text-white hover:bg-stone-800"
                >
                  Acessar meu portal
                </Button>

                <Button
                  onClick={onLogin}
                  variant="outline"
                  className="h-12 w-full rounded-2xl border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Entrar com Gmail
                </Button>

                <button
                  onClick={onLogin}
                  className="w-full rounded-2xl px-4 py-3 text-sm font-medium text-stone-600 hover:bg-stone-50"
                >
                  Criar conta
                </button>
              </div>

              <div className="mt-6 rounded-2xl bg-stone-50 p-4 text-sm text-stone-500">
                <strong className="text-stone-700">Protótipo:</strong> em
                produção, login Gmail e criação de conta seriam conectados ao
                provedor de autenticação.
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}


// ─── Feedback profissional: substitui alert/prompt/confirm nativos ─────────

function Toasts({ items = [], onClose }) {
  return (
    <div className="fixed right-5 top-5 z-[80] space-y-3">
      {items.map((toast) => (
        <div
          key={toast.id}
          className={`w-80 rounded-2xl border bg-white p-4 text-sm shadow-2xl transition ${
            toast.type === "error" ? "border-red-200 text-red-700" : "border-stone-200 text-stone-700"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <p>{toast.message}</p>
            <button onClick={() => onClose(toast.id)} className="text-stone-400 hover:text-stone-700">×</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ActionDialog({ dialog, onCancel, onSubmit }) {
  const [value, setValue] = React.useState(dialog?.initialValue || "");

  React.useEffect(() => {
    setValue(dialog?.initialValue || "");
  }, [dialog]);

  if (!dialog) return null;

  const isInput = dialog.type === "input";
  const danger = dialog.tone === "danger";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-950/25 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-stone-950">{dialog.title}</h3>
        {dialog.message && <p className="mt-2 text-sm leading-6 text-stone-500">{dialog.message}</p>}
        {isInput && (
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-stone-700">{dialog.label}</label>
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm outline-none focus:ring-4 focus:ring-stone-100"
            />
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50">Cancelar</button>
          <button
            onClick={() => onSubmit(isInput ? value : true)}
            className={`rounded-2xl px-4 py-2 text-sm font-medium text-white ${danger ? "bg-red-600 hover:bg-red-700" : "bg-stone-950 hover:bg-stone-800"}`}
          >
            {dialog.confirmLabel || "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── App Shell ───────────────────────────────────────────────────────────────

function AppShell() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [workspaces, setWorkspaces] = useState(startWorkspaces);
  const [users, setUsers] = useState(startUsers);
  const [tags, setTags] = useState(startTags);
  const [departments, setDepartments] = useState(startDepartments);
  const [serviceTypes, setServiceTypes] = useState(startServiceTypes);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(1);
  const [activeMenu, setActiveMenu] = useState("work");
  const [search, setSearch] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [profileName, setProfileName] = useState("Edimarley Oliveira");
  const [theme, setTheme] = useState("light");
  const [newPhase, setNewPhase] = useState("");
  const [logs, setLogs] = useState(initialLogs);
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);

  // Determine current user based on active workspace
  const currentUser =
    activeWorkspaceId === 2 ? users[1] : users[0];

  const canEdit =
    currentUser?.role === "owner" || currentUser?.permission === "edit";

  // Guard menu access for non-owners
  const visibleMenu =
    canEdit || currentUser?.menuAccess?.[activeMenu]
      ? activeMenu
      : "work";

  const workspace =
    workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const board = workspace?.board || { title: "", description: "", phases: [], cards: [] };
  const cards = board?.cards || [];

  const visibleCards = useMemo(() => {
    const scoped = cards.filter((card) =>
      card ? canSeeCard(card, currentUser, canEdit) : false
    );
    if (!search.trim()) return scoped;
    const term = search.toLowerCase();
    return scoped.filter((card) =>
      [
        card.title,
        card.description,
        card.tag,
        card.priority,
        card.requester,
        card.department,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [cards, search, currentUser, canEdit]);

  function addLog(action, menu, detail) {
    setLogs((prev) => [
      {
        id: Date.now() + Math.random(),
        date: nowFormatted(),
        action,
        menu,
        user: currentUser?.name || profileName,
        detail,
      },
      ...prev,
    ]);
  }

  function notify(message, type = "success") {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3800);
  }

  function closeToast(id) {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }

  function requestText(options) {
    setDialog({ ...options, type: "input" });
  }

  function requestConfirm(options) {
    setDialog({ ...options, type: "confirm" });
  }

  function submitDialog(value) {
    const current = dialog;
    setDialog(null);
    current?.onConfirm?.(value);
  }

  function updateBoard(nextBoard) {
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === activeWorkspaceId ? { ...w, board: nextBoard } : w
      )
    );
  }

  function addCard(phase) {
    if (!canEdit) return;
    addLog("Card criado", "Meus trabalhos", "Novo card criado na fase " + phase);
    const card = {
      id: Date.now(),
      title: "Novo trabalho",
      phase,
      tag: serviceTypes[0] || "Processos",
      owner: "EO",
      requester: "Interno",
      requesterEmail: "",
      department: "CS OPS",
      dueDate: "",
      startedAt: new Date().toISOString().slice(0, 10),
      finishedAt: "",
      priority: "Normal",
      description: "Descreva o trabalho, objetivo e próximos passos.",
      comments: 0,
      originalForm: null,
    };
    updateBoard({ ...board, cards: [card, ...cards] });
  }

  function sendAutoReply(card) {
    if (!card?.requesterEmail) return;
    notify("Resposta automática simulada para " + card.requesterEmail + ": solicitação finalizada.", "success");
  }

  function saveCard(updatedCard) {
    if (!updatedCard) return;
    addLog("Card editado", "Meus trabalhos", "Card atualizado: " + updatedCard.title);
    const previous = cards.find((c) => c.id === updatedCard.id);
    const finishedAt =
      updatedCard.phase === "Concluído" && !updatedCard.finishedAt
        ? new Date().toISOString().slice(0, 10)
        : updatedCard.finishedAt;
    const finalCard = { ...updatedCard, finishedAt };
    updateBoard({
      ...board,
      cards: cards.map((c) => (c.id === updatedCard.id ? finalCard : c)),
    });
    if (
      previous?.phase !== "Concluído" &&
      finalCard.phase === "Concluído" &&
      finalCard.requesterEmail
    ) {
      sendAutoReply(finalCard);
    }
    setSelectedCard(null);
  }

  function moveCard(cardId, nextPhase) {
    if (!canEdit) return;
    const previous = cards.find((c) => c.id === cardId);
    addLog(
      "Card movido",
      "Meus trabalhos",
      (previous?.title || "Card") + " movido para " + nextPhase
    );
    const nextCards = cards.map((c) =>
      c.id === cardId
        ? {
            ...c,
            phase: nextPhase,
            finishedAt:
              nextPhase === "Concluído"
                ? new Date().toISOString().slice(0, 10)
                : c.finishedAt,
          }
        : c
    );
    const finalCard = nextCards.find((c) => c.id === cardId);
    updateBoard({ ...board, cards: nextCards });
    if (
      previous?.phase !== "Concluído" &&
      nextPhase === "Concluído" &&
      finalCard?.requesterEmail
    ) {
      sendAutoReply(finalCard);
    }
  }

  function addPhase() {
    if (!newPhase.trim() || board.phases.includes(newPhase.trim())) return;
    addLog("Fase criada", "Meus trabalhos", "Nova fase: " + newPhase.trim());
    updateBoard({ ...board, phases: [...board.phases, newPhase.trim()] });
    setNewPhase("");
  }

  function submitRequest(form) {
    addLog(
      "Pedido criado",
      "Formulário",
      "Solicitação aberta por " + (form.requester || "?") + ": " + form.title
    );
    const card = {
      id: Date.now(),
      title: form.title,
      phase: form.phase || board.phases[0] || "A fazer",
      tag: form.tag || serviceTypes[0] || "Processos",
      owner: "EO",
      requester: form.requester || "Não informado",
      requesterEmail: form.requesterEmail || "",
      department: form.department || "Não informado",
      dueDate: form.dueDate,
      startedAt: new Date().toISOString().slice(0, 10),
      finishedAt: "",
      priority: form.priority || "Normal",
      description: form.description,
      comments: 0,
      originalForm: { ...form },
    };
    updateBoard({ ...board, cards: [card, ...cards] });
  }

  function addWorkspace() {
    const id = Date.now();
    addLog("Espaço criado", "Espaços", "Novo espaço de trabalho criado");
    setWorkspaces([
      ...workspaces,
      {
        id,
        title: "Novo espaço de trabalho",
        owner: profileName || "Novo usuário",
        description: "Espaço separado para administrar trabalhos próprios.",
        board: {
          title: "Meus Trabalhos",
          description: "Todas as tarefas em um só lugar",
          phases: ["A fazer", "Em andamento", "Em validação", "Concluído"],
          cards: [],
        },
      },
    ]);
    setActiveWorkspaceId(id);
  }

  function editWorkspace(workspaceId) {
    const target = workspaces.find((w) => w.id === workspaceId);
    if (!target) return;
    requestText({
      title: "Editar espaço de trabalho",
      label: "Nome do espaço",
      initialValue: target.title,
      confirmLabel: "Salvar espaço",
      onConfirm: (nextTitle) => {
        if (!nextTitle || !nextTitle.trim()) return;
        setWorkspaces((prev) =>
          prev.map((w) =>
            w.id === workspaceId ? { ...w, title: nextTitle.trim() } : w
          )
        );
        addLog("Espaço editado", "Espaços", target.title + " -> " + nextTitle.trim());
        notify("Espaço atualizado.", "success");
      },
    });
  }

  function deleteWorkspace(workspaceId) {
    const target = workspaces.find((w) => w.id === workspaceId);
    if (!target) return;
    if (workspaces.length <= 1) {
      notify("Você precisa manter pelo menos um espaço de trabalho.", "error");
      return;
    }
    requestConfirm({
      title: "Excluir espaço de trabalho?",
      message: "Essa exclusão é irreversível. Todos os dados visuais deste espaço serão removidos do protótipo.",
      confirmLabel: "Excluir espaço",
      tone: "danger",
      onConfirm: () => {
        setWorkspaces((prev) => prev.filter((w) => w.id !== workspaceId));
        if (activeWorkspaceId === workspaceId) {
          const fallback = workspaces.find((w) => w.id !== workspaceId);
          setActiveWorkspaceId(fallback?.id || 1);
        }
        addLog("Espaço excluído", "Espaços", target.title);
        notify("Espaço excluído.", "success");
      },
    });
  }

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;

  return (
    <div
      className={
        (theme === "dark"
          ? "theme-dark bg-stone-950"
          : theme === "plaky"
          ? "theme-plaky bg-[#08111f]"
          : "theme-light bg-[#FAF8F5]") +
        " flex h-screen overflow-hidden text-stone-900"
      }
    >
      <Sidebar
        activeMenu={visibleMenu}
        setActiveMenu={setActiveMenu}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        setActiveWorkspaceId={setActiveWorkspaceId}
        onAddWorkspace={addWorkspace}
        onLogout={() => setLoggedIn(false)}
        profilePhoto={profilePhoto}
        profileName={profileName}
        canEdit={canEdit}
        currentUser={currentUser}
        onEditWorkspace={editWorkspace}
        onDeleteWorkspace={deleteWorkspace}
      />

      <main className="flex min-w-0 flex-1 flex-col bg-[#FAF8F5] overflow-hidden app-main">
        <TopBar
          activeMenu={visibleMenu}
          search={search}
          setSearch={setSearch}
        />

        {visibleMenu === "work" && (
          <WorkView
            board={board}
            cards={visibleCards}
            tags={tags}
            canEdit={canEdit}
            onAddCard={addCard}
            onOpenCard={setSelectedCard}
            onMoveCard={moveCard}
            onAddPhase={addPhase}
            newPhase={newPhase}
            setNewPhase={setNewPhase}
          />
        )}
        {visibleMenu === "dash" && (
          <DashboardView board={board} cards={visibleCards} />
        )}
        {visibleMenu === "form" && (
          <RequestFormView
            board={board}
            tags={tags}
            serviceTypes={serviceTypes}
            setServiceTypes={setServiceTypes}
            departments={departments}
            setDepartments={setDepartments}
            onSubmitRequest={submitRequest}
            onLog={addLog}
            notify={notify}
            requestText={requestText}
            requestConfirm={requestConfirm}
          />
        )}
        {visibleMenu === "flow" && <FlowView onLog={addLog} canEdit={canEdit} notify={notify} requestText={requestText} requestConfirm={requestConfirm} />}
        {visibleMenu === "people" && (
          <PeopleView
            users={users}
            setUsers={setUsers}
            canEdit={canEdit}
            onLog={addLog}
            notify={notify}
            requestText={requestText}
          />
        )}
        {visibleMenu === "logs" && <LogsView logs={logs} />}
        {visibleMenu === "settings" && (
          <SettingsView
            profilePhoto={profilePhoto}
            setProfilePhoto={setProfilePhoto}
            theme={theme}
            setTheme={setTheme}
            profileName={profileName}
            setProfileName={setProfileName}
            onLog={addLog}
            notify={notify}
            requestText={requestText}
          />
        )}
      </main>

      <Toasts items={toasts} onClose={closeToast} />
      <ActionDialog dialog={dialog} onCancel={() => setDialog(null)} onSubmit={submitDialog} />

      <CardModal
        card={selectedCard}
        tags={tags}
        setTags={setTags}
        phases={board.phases}
        canEdit={canEdit}
        onClose={() => setSelectedCard(null)}
        onSave={saveCard}
      />
    </div>
  );
}

export default function App() {
  return <AppShell />;
}
