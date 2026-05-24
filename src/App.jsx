import React, { useEffect, useState, useMemo } from "react";
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

import { canSeeCard } from "./utils/permissions.js";
import { nowFormatted } from "./utils/dates.js";
import { supabase, isSupabaseConfigured } from "./lib/supabase.js";

import {
  fetchPortalData,
  createWorkspace as dbCreateWorkspace,
  updateWorkspaceName,
  deleteWorkspaceById,
  createPhase as dbCreatePhase,
  createCard as dbCreateCard,
  updateCard as dbUpdateCard,
  moveCardToPhase,
  createRequestFromForm,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  createRequestType,
  updateRequestType,
  deleteRequestType,
    inviteWorkspaceMember,
  updateWorkspaceMember,
  updateWorkspaceMemberNestedPermission,
  removeWorkspaceMember,
  fetchFlowData,
  createFlowFolder,
  updateFlowFolder,
  deleteFlowFolder,
  createFlowchart,
  updateFlowchartName,
  moveFlowchartToFolder,
  saveFlowchartData,
  deleteFlowchart,
} from "./services/portalData.js";

// ─── Login Screen ────────────────────────────────────────────────────────────

function LoginScreen({
  onLogin,
  onSignUp,
  onGoogleLogin,
  authLoading,
  authError,
  authMessage,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const isSignup = mode === "signup";

  function handleSubmit(event) {
    event.preventDefault();

    if (isSignup) {
      onSignUp({ email, password, fullName });
      return;
    }

    onLogin({ email, password });
  }

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
                  {isSignup ? "Criar conta" : "Entrar no portal"}
                </h2>

                <p className="mt-2 text-sm text-stone-500">
                  {isSignup
                    ? "Crie seu acesso com e-mail e senha."
                    : "Acesse com e-mail e senha ou com sua conta Gmail."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignup && (
                  <TextInput
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Seu nome"
                    required
                  />
                )}

                <TextInput
                  icon={Mail}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Seu e-mail"
                  required
                />

                <div className="relative">
                  <TextInput
                    icon={Lock}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Sua senha"
                    required
                    minLength={6}
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

                {authError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {authError}
                  </div>
                )}

                {authMessage && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                    {authMessage}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={authLoading}
                  className="h-12 w-full rounded-2xl bg-stone-950 text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {authLoading
                    ? "Aguarde..."
                    : isSignup
                    ? "Criar minha conta"
                    : "Acessar meu portal"}
                </Button>

                <Button
                  type="button"
                  onClick={onGoogleLogin}
                  disabled={authLoading}
                  variant="outline"
                  className="h-12 w-full rounded-2xl border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Entrar com Gmail
                </Button>

                <button
                  type="button"
                  onClick={() => setMode(isSignup ? "login" : "signup")}
                  className="w-full rounded-2xl px-4 py-3 text-sm font-medium text-stone-600 hover:bg-stone-50"
                >
                  {isSignup ? "Já tenho conta" : "Criar conta"}
                </button>
              </form>

              {!isSupabaseConfigured && (
                <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-700">
                  Configure as variáveis VITE_SUPABASE_URL e
                  VITE_SUPABASE_ANON_KEY para ativar o login real.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Feedback profissional ──────────────────────────────────────────────────

function Toasts({ items = [], onClose }) {
  return (
    <div className="fixed right-5 top-5 z-[80] space-y-3">
      {items.map((toast) => (
        <div
          key={toast.id}
          className={`w-80 rounded-2xl border bg-white p-4 text-sm shadow-2xl transition ${
            toast.type === "error"
              ? "border-red-200 text-red-700"
              : "border-stone-200 text-stone-700"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <p>{toast.message}</p>
            <button
              onClick={() => onClose(toast.id)}
              className="text-stone-400 hover:text-stone-700"
            >
              ×
            </button>
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
        <h3 className="text-lg font-semibold text-stone-950">
          {dialog.title}
        </h3>

        {dialog.message && (
          <p className="mt-2 text-sm leading-6 text-stone-500">
            {dialog.message}
          </p>
        )}

        {isInput && (
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-stone-700">
              {dialog.label}
            </label>
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm outline-none focus:ring-4 focus:ring-stone-100"
            />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
          >
            Cancelar
          </button>

          <button
            onClick={() => onSubmit(isInput ? value : true)}
            className={`rounded-2xl px-4 py-2 text-sm font-medium text-white ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-stone-950 hover:bg-stone-800"
            }`}
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
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authActionLoading, setAuthActionLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  const [workspaces, setWorkspaces] = useState([]);
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);

  const [activeMenu, setActiveMenu] = useState("work");
  const [search, setSearch] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [profileName, setProfileName] = useState("Usuário");
  const [theme, setTheme] = useState("light");
  const [newPhase, setNewPhase] = useState("");
  const [logs, setLogs] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);

  const allMenuAccess = {
    work: true,
    dash: true,
    form: true,
    flow: true,
    people: true,
    logs: true,
    settings: true,
  };

  async function loadPortalData({ silent = false } = {}) {
    if (!supabase) return;

    try {
      setDataError("");
      if (!silent) setDataLoading(true);

      const data = await fetchPortalData();

      setWorkspaces(data.workspaces || []);
      setUsers(data.users || []);
      setDepartments(data.departments || []);
      setServiceTypes(data.serviceTypes || []);
      setTags(data.tags || []);
      setLogs(data.logs || []);

      const nextName =
        data.profile?.full_name ||
        data.user?.user_metadata?.full_name ||
        data.user?.user_metadata?.name ||
        data.user?.email ||
        "Usuário";

      setProfileName(nextName);
      setProfilePhoto(data.profile?.avatar_url || "");

      setActiveWorkspaceId((current) => {
        const exists = (data.workspaces || []).some(
          (workspace) => workspace.id === current
        );

        if (exists) return current;

        return data.workspaces?.[0]?.id || null;
      });
    } catch (error) {
      console.error(error);
      setDataError(
        error?.message ||
          "Não foi possível carregar os dados do portal no Supabase."
      );
    } finally {
      if (!silent) setDataLoading(false);
    }
  }

  function handleAsyncError(error, fallback = "Não foi possível concluir a ação.") {
    console.error(error);
    notify(error?.message || fallback, "error");
  }

  useEffect(() => {
    let active = true;

    async function loadSession() {
      if (!supabase) {
        setAuthLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();

      if (!active) return;

      const user = data?.session?.user || null;
      setAuthUser(user);

      if (user) {
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email ||
          "Usuário";

        setProfileName(name);
      }

      setAuthLoading(false);
    }

    loadSession();

    if (!supabase) {
      return () => {
        active = false;
      };
    }

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const user = session?.user || null;

        setAuthUser(user);

        if (user) {
          const name =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email ||
            "Usuário";

          setProfileName(name);
        } else {
          setWorkspaces([]);
          setUsers([]);
          setTags([]);
          setDepartments([]);
          setServiceTypes([]);
          setLogs([]);
          setActiveWorkspaceId(null);
        }
      }
    );

    return () => {
      active = false;
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (authUser) {
      loadPortalData();
    }
  }, [authUser?.id]);

  async function handleLogin({ email, password }) {
    setAuthError("");
    setAuthMessage("");

    if (!supabase) {
      setAuthError("Supabase ainda não está configurado neste ambiente.");
      return;
    }

    setAuthActionLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setAuthActionLoading(false);

    if (error) {
      setAuthError(error.message);
    }
  }

  async function handleSignUp({ email, password, fullName }) {
    setAuthError("");
    setAuthMessage("");

    if (!supabase) {
      setAuthError("Supabase ainda não está configurado neste ambiente.");
      return;
    }

    setAuthActionLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email,
        },
        emailRedirectTo: window.location.origin,
      },
    });

    setAuthActionLoading(false);

    if (error) {
      setAuthError(error.message);
      return;
    }

    if (data?.session) {
      setAuthMessage("Conta criada com sucesso.");
      setAuthUser(data.session.user);
    } else {
      setAuthMessage(
        "Conta criada. Verifique seu e-mail para confirmar o acesso, se a confirmação estiver ativada."
      );
    }
  }

  async function handleGoogleLogin() {
    setAuthError("");
    setAuthMessage("");

    if (!supabase) {
      setAuthError("Supabase ainda não está configurado neste ambiente.");
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      setAuthError(error.message);
    }
  }

  async function handleLogout() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setAuthUser(null);
  }

  const workspace =
    workspaces.find((item) => item.id === activeWorkspaceId) || workspaces[0];

  const board = workspace?.board || {
    title: "Meus Trabalhos",
    description: "Todas as tarefas em um só lugar",
    phases: [],
    phaseRecords: [],
    cards: [],
  };

  const cards = board?.cards || [];

  const currentUser = useMemo(() => {
    const byEmail = users.find((user) => user.email === authUser?.email);
    const owner = users.find((user) => user.role === "owner");

    return (
      byEmail ||
      owner ||
      users[0] || {
        id: authUser?.id || "current-user",
        name: profileName || authUser?.email || "Usuário",
        email: authUser?.email || "",
        role: "owner",
        permission: "edit",
        avatar: "US",
        cardScope: "all",
        menuAccess: allMenuAccess,
      }
    );
  }, [users, authUser?.email, authUser?.id, profileName]);

  const canEdit =
    currentUser?.role === "owner" ||
    currentUser?.role === "editor" ||
    currentUser?.permission === "edit";

  const visibleMenu =
    canEdit || currentUser?.menuAccess?.[activeMenu] ? activeMenu : "work";

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

    Promise.resolve(current?.onConfirm?.(value)).catch((error) =>
      handleAsyncError(error)
    );
  }

  function getPhaseRecordByName(phaseName) {
    return (board.phaseRecords || []).find((phase) => phase.name === phaseName);
  }

  async function addCard(phase) {
    if (!canEdit || !workspace) return;

    try {
      const phaseRecord = getPhaseRecordByName(phase);

      await dbCreateCard({
        workspaceId: workspace.id,
        phaseId: phaseRecord?.id || null,
        userName: currentUser?.name || profileName,
        card: {
          title: "Novo trabalho",
          phase,
          tag: serviceTypes[0] || "Processos",
          owner: "EO",
          requester: "Interno",
          requesterEmail: "",
          department: departments[0] || "CS OPS",
          dueDate: "",
          priority: "Normal",
          description: "Descreva o trabalho, objetivo e próximos passos.",
          comments: 0,
          originalForm: null,
        },
      });

      notify("Card criado.");
      await loadPortalData({ silent: true });
    } catch (error) {
      handleAsyncError(error, "Não foi possível criar o card.");
    }
  }

  function sendAutoReply(card) {
    if (!card?.requesterEmail) return;

    notify(
      "Resposta automática simulada para " +
        card.requesterEmail +
        ": solicitação finalizada.",
      "success"
    );
  }

  async function saveCard(updatedCard) {
    if (!updatedCard || !workspace) return;

    try {
      const previous = cards.find((card) => card.id === updatedCard.id);

      await dbUpdateCard({
        workspaceId: workspace.id,
        cardId: updatedCard.id,
        card: updatedCard,
        oldCard: previous || null,
        phases: board.phaseRecords || [],
        userName: currentUser?.name || profileName,
      });

      if (
        previous?.phase !== "Concluído" &&
        updatedCard.phase === "Concluído" &&
        updatedCard.requesterEmail
      ) {
        sendAutoReply(updatedCard);
      }

      setSelectedCard(null);
      notify("Card atualizado.");
      await loadPortalData({ silent: true });
    } catch (error) {
      handleAsyncError(error, "Não foi possível salvar o card.");
    }
  }

  async function moveCard(cardId, nextPhase) {
    if (!canEdit || !workspace) return;

    try {
      const previous = cards.find((card) => card.id === cardId);
      const phaseRecord = getPhaseRecordByName(nextPhase);

      if (!phaseRecord) {
        notify("Fase não encontrada.", "error");
        return;
      }

      await moveCardToPhase({
        workspaceId: workspace.id,
        cardId,
        phaseId: phaseRecord.id,
        phaseName: nextPhase,
        oldCard: previous || null,
        userName: currentUser?.name || profileName,
      });

      if (
        previous?.phase !== "Concluído" &&
        nextPhase === "Concluído" &&
        previous?.requesterEmail
      ) {
        sendAutoReply(previous);
      }

      notify("Card movido.");
      await loadPortalData({ silent: true });
    } catch (error) {
      handleAsyncError(error, "Não foi possível mover o card.");
    }
  }

  async function addPhase() {
    if (!workspace) return;

    const name = newPhase.trim();

    if (!name || board.phases.includes(name)) return;

    try {
      await dbCreatePhase({
        workspaceId: workspace.id,
        name,
        position: board.phases.length,
        userName: currentUser?.name || profileName,
      });

      setNewPhase("");
      notify("Fase criada.");
      await loadPortalData({ silent: true });
    } catch (error) {
      handleAsyncError(error, "Não foi possível criar a fase.");
    }
  }

  async function submitRequest(form) {
    if (!workspace) return;

    try {
      const phaseRecord =
        getPhaseRecordByName(form.phase) || (board.phaseRecords || [])[0];

      await createRequestFromForm({
        workspaceId: workspace.id,
        phaseId: phaseRecord?.id || null,
        form,
        userName: form.requester || currentUser?.name || profileName,
      });

      notify("Pedido enviado e criado no Kanban.");
      await loadPortalData({ silent: true });
    } catch (error) {
      handleAsyncError(error, "Não foi possível enviar o pedido.");
    }
  }

  

  async function handleCreateDepartment(name) {    if (!workspace) return;    try {      await createDepartment({ workspaceId: workspace.id, name, userName: currentUser?.name || profileName });      notify("Setor criado.");      await loadPortalData({ silent: true });    } catch (error) {      handleAsyncError(error, "Não foi possível criar o setor.");    }  }  async function handleUpdateDepartment(oldName, nextName) {    if (!workspace) return;    try {      await updateDepartment({ workspaceId: workspace.id, departmentName: oldName, nextName, userName: currentUser?.name || profileName });      notify("Setor atualizado.");      await loadPortalData({ silent: true });    } catch (error) {      handleAsyncError(error, "Não foi possível editar o setor.");    }  }  async function handleDeleteDepartment(name) {    if (!workspace) return;    try {      await deleteDepartment({ workspaceId: workspace.id, departmentName: name, userName: currentUser?.name || profileName });      notify("Setor excluído.");      await loadPortalData({ silent: true });    } catch (error) {      handleAsyncError(error, "Não foi possível excluir o setor.");    }  }  async function handleCreateServiceType(name) {    if (!workspace) return;    try {      await createRequestType({ workspaceId: workspace.id, name, color: "border-stone-200 bg-stone-50 text-stone-700", userName: currentUser?.name || profileName });      notify("Tipo de pedido criado.");      await loadPortalData({ silent: true });    } catch (error) {      handleAsyncError(error, "Não foi possível criar o tipo de pedido.");    }  }  async function handleUpdateServiceType(oldName, nextName) {    if (!workspace) return;    try {      await updateRequestType({ workspaceId: workspace.id, requestTypeName: oldName, nextName, userName: currentUser?.name || profileName });      notify("Tipo de pedido atualizado.");      await loadPortalData({ silent: true });    } catch (error) {      handleAsyncError(error, "Não foi possível editar o tipo de pedido.");    }  }  async function handleDeleteServiceType(name) {    if (!workspace) return;    try {      await deleteRequestType({ workspaceId: workspace.id, requestTypeName: name, userName: currentUser?.name || profileName });      notify("Tipo de pedido excluído.");      await loadPortalData({ silent: true });    } catch (error) {      handleAsyncError(error, "Não foi possível excluir o tipo de pedido.");    }  }  async function addWorkspace() {
    try {
      const created = await dbCreateWorkspace({
        name: "Novo espaço de trabalho",
        description: "Espaço separado para administrar trabalhos próprios.",
        userName: currentUser?.name || profileName,
      });

      notify("Espaço criado.");
      await loadPortalData({ silent: true });
      setActiveWorkspaceId(created.id);
    } catch (error) {
      handleAsyncError(error, "Não foi possível criar o espaço.");
    }
  }

  function editWorkspace(workspaceId) {
    const target = workspaces.find((item) => item.id === workspaceId);

    if (!target) return;

    requestText({
      title: "Editar espaço de trabalho",
      label: "Nome do espaço",
      initialValue: target.title,
      confirmLabel: "Salvar espaço",
      onConfirm: async (nextTitle) => {
        if (!nextTitle || !nextTitle.trim()) return;

        await updateWorkspaceName({
          workspaceId,
          name: nextTitle.trim(),
          oldWorkspace: target,
          userName: currentUser?.name || profileName,
        });

        notify("Espaço atualizado.");
        await loadPortalData({ silent: true });
      },
    });
  }

  function deleteWorkspace(workspaceId) {
    const target = workspaces.find((item) => item.id === workspaceId);

    if (!target) return;

    if (workspaces.length <= 1) {
      notify("Você precisa manter pelo menos um espaço de trabalho.", "error");
      return;
    }

    requestConfirm({
      title: "Excluir espaço de trabalho?",
      message:
        "Essa exclusão é irreversível. Todos os dados deste espaço serão removidos.",
      confirmLabel: "Excluir espaço",
      tone: "danger",
      onConfirm: async () => {
        await deleteWorkspaceById({
          workspaceId,
          oldWorkspace: target,
          userName: currentUser?.name || profileName,
        });

        notify("Espaço excluído.");
        await loadPortalData({ silent: true });
      },
    });
  }

    async function handleInvitePerson({ email, permission }) {
    if (!workspace) return;
    try {
      await inviteWorkspaceMember({
        workspaceId: workspace.id,
        email,
        permission,
        userName: currentUser?.name || profileName,
      });
      notify("Pessoa adicionada ao espaço.");
      await loadPortalData({ silent: true });
    } catch (error) {
      handleAsyncError(error, "Não foi possível adicionar a pessoa.");
    }
  }

  async function handleUpdatePerson(userId, changes) {
    if (!workspace) return;
    const target = users.find((user) => user.id === userId);
    try {
      await updateWorkspaceMember({
        workspaceId: workspace.id,
        memberId: target.memberId,
        changes,
        oldMember: target,
        userName: currentUser?.name || profileName,
      });
      notify("Permissões atualizadas.");
      await loadPortalData({ silent: true });
    } catch (error) {
      handleAsyncError(error, "Não foi possivel atualizar a pessoa.");
    }
  }

  async function handleUpdatePersonNested(userId, field, key, value) {
    if (!workspace) return;
    const target = users.find((user) => user.id === userId);
    if (!target?.memberId) {
      notify("Não foi possivel encontrar o vinculo dessa pessoa.", "error");
      return;
    }
    try {
      await updateWorkspaceMemberNestedPermission({
        workspaceId: workspace.id,
        memberId: target.memberId,
        field,
        key,
        value,
        oldMember: target,
        userName: currentUser?.name || profileName,
      });
      notify("Permissão atualizada.");
      await loadPortalData({ silent: true });
    } catch (error) {
      handleAsyncError(error, "Não foi possivel atualizar a permissão.");
    }
  }

  async function handleRemovePerson(userId) {
    if (!workspace) return;
    const target = users.find((user) => user.id === userId);
    if (!target?.memberId) {
      notify("Não foi possível encontrar essa pessoa.", "error");
      return;
    }
    try {
      await removeWorkspaceMember({
        workspaceId: workspace.id,
        memberId: target.memberId,
        oldMember: target,
        userName: currentUser?.name || profileName,
      });
      notify("Pessoa removida.");
      await loadPortalData({ silent: true });
    } catch (error) {
      handleAsyncError(error, "Não foi possível remover a pessoa.");
    }
  }

  // ─── Estados de Fluxograma ────────────────────────────────────────────────
  const [flowFolders, setFlowFolders] = useState([]);
  const [flowcharts, setFlowcharts] = useState([]);
  const [flowLoading, setFlowLoading] = useState(false);

  async function loadFlowData() {
    if (!supabase || !workspace?.id) return;
    try {
      setFlowLoading(true);
      const data = await fetchFlowData({ workspaceId: workspace.id });
      setFlowFolders(data.folders || []);
      setFlowcharts(data.flowcharts || []);
    } catch (error) {
      console.error("Erro ao carregar fluxogramas:", error);
    } finally {
      setFlowLoading(false);
    }
  }

  useEffect(() => {
    if (workspace?.id) loadFlowData();
  }, [workspace?.id]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1EA] text-stone-700">
        Carregando portal...
      </div>
    );
  }

  if (!authUser) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onSignUp={handleSignUp}
        onGoogleLogin={handleGoogleLogin}
        authLoading={authActionLoading}
        authError={authError}
        authMessage={authMessage}
      />
    );
  }

  if (dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1EA] text-stone-700">
        Preparando seu espaço de trabalho...
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1EA] p-6 text-stone-900">
        <div className="w-full max-w-lg rounded-[2rem] border border-red-100 bg-white p-8 shadow-xl">
          <h1 className="text-2xl font-semibold">
            Não foi possível carregar o portal
          </h1>

          <p className="mt-3 text-sm leading-6 text-stone-600">{dataError}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={() => loadPortalData()}
              className="rounded-2xl bg-stone-950 text-white hover:bg-stone-800"
            >
              Tentar novamente
            </Button>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="rounded-2xl border-stone-200"
            >
              Sair
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
        onLogout={handleLogout}
        profilePhoto={profilePhoto}
        profileName={profileName}
        canEdit={canEdit}
        currentUser={currentUser}
        onEditWorkspace={editWorkspace}
        onDeleteWorkspace={deleteWorkspace}
      />

      <main className="app-main flex min-w-0 flex-1 flex-col overflow-hidden bg-[#FAF8F5]">
        <TopBar activeMenu={visibleMenu} search={search} setSearch={setSearch} />

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
            onSubmitRequest={submitRequest}             onCreateDepartment={handleCreateDepartment}             onUpdateDepartment={handleUpdateDepartment}             onDeleteDepartment={handleDeleteDepartment}             onCreateServiceType={handleCreateServiceType}             onUpdateServiceType={handleUpdateServiceType}             onDeleteServiceType={handleDeleteServiceType}
            onLog={addLog}
            notify={notify}
            requestText={requestText}
            requestConfirm={requestConfirm}
          />
        )}

        {visibleMenu === "flow" && (
<FlowView
              workspaceId={workspace?.id || null}
              onLog={addLog}
              canEdit={canEdit}
              notify={notify}
              requestText={requestText}
              requestConfirm={requestConfirm}
              onCreateFolder={async (name) => {
                const folder = await createFlowFolder({ workspaceId: workspace.id, name, userName: currentUser?.name || profileName });
                              await loadFlowData();
                    return folder;
              }}
              onUpdateFolder={async (folderId, name, oldFolder) => {
                const folder = await updateFlowFolder({ workspaceId: workspace.id, folderId, name, oldFolder, userName: currentUser?.name || profileName });
              await loadFlowData();
                    return folder;
              }}
              onDeleteFolder={async (folderId, oldFolder) => {
                await deleteFlowFolder({ workspaceId: workspace.id, folderId, oldFolder, userName: currentUser?.name || profileName });
              await loadFlowData();
              }}
              onCreateFlowchart={async (folderId, name) => {
                const flow = await createFlowchart({ workspaceId: workspace.id, folderId, name, userName: currentUser?.name || profileName });
              await loadFlowData();
                return flow;
              }}
              onUpdateFlowchartName={async (flowchartId, name, oldFlowchart) => {
                const flow = await updateFlowchartName({ workspaceId: workspace.id, flowchartId, name, oldFlowchart, userName: currentUser?.name || profileName });
              await loadFlowData();
                    return flow;
              }}
              onMoveFlowchart={async (flowchartId, folderId, oldFlowchart) => {
                const flow = await moveFlowchartToFolder({ workspaceId: workspace.id, flowchartId, folderId, oldFlowchart, userName: currentUser?.name || profileName });
              await loadFlowData();
                    return flow;
              }}
              onSaveFlowchartData={async (flowchartId, nodes, edges, oldFlowchart) => {
                const flow = await saveFlowchartData({ workspaceId: workspace.id, flowchartId, nodes, edges, oldFlowchart, userName: currentUser?.name || profileName });
              await loadFlowData();
                    return flow;
              }}
              onDeleteFlowchart={async (flowchartId, oldFlowchart) => {
                await deleteFlowchart({ workspaceId: workspace.id, flowchartId, oldFlowchart, userName: currentUser?.name || profileName });
              await loadFlowData();
              }}
              onFetchFlowData={async () => {
                if (!workspace?.id) return { folders: [], flowcharts: [] };
                return await fetchFlowData({ workspaceId: workspace.id });
              }}
              folders={flowFolders}
              flowcharts={flowcharts}
              loading={flowLoading}
            />
                )}

        {visibleMenu === "people" && (
          <PeopleView
            users={users}
            setUsers={setUsers}
            canEdit={canEdit}
            onLog={addLog}
            notify={notify}
            requestText={requestText}
                        requestConfirm={requestConfirm}
            onInvitePerson={handleInvitePerson}
            onUpdatePerson={handleUpdatePerson}
            onUpdatePersonNested={handleUpdatePersonNested}
            onRemovePerson={handleRemovePerson}
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

      <ActionDialog
        dialog={dialog}
        onCancel={() => setDialog(null)}
        onSubmit={submitDialog}
      />

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
