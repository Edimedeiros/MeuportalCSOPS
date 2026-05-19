import React from "react";
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Workflow,
  Users,
  ClipboardList,
  Settings,
  Plus,
  LogOut,
  Pencil,
  Trash2,
} from "lucide-react";
import Badge from "../ui/Badge.jsx";

const menuIcons = {
  work: LayoutDashboard,
  dash: BarChart3,
  form: FileText,
  flow: Workflow,
  people: Users,
  logs: ClipboardList,
  settings: Settings,
};

const menuLabels = {
  work: "Meus trabalhos",
  dash: "Dashboards",
  form: "Formulário de pedido",
  flow: "Fluxogramas",
  people: "Pessoas",
  logs: "Logs",
  settings: "Configurações",
};

const allMenuIds = ["work", "dash", "form", "flow", "people", "logs", "settings"];

export default function Sidebar({
  activeMenu,
  setActiveMenu,
  workspaces = [],
  activeWorkspaceId,
  setActiveWorkspaceId,
  onAddWorkspace,
  onLogout,
  profilePhoto,
  profileName,
  canEdit,
  currentUser,
  onEditWorkspace,
  onDeleteWorkspace,
}) {
  const allowedMenuIds = canEdit
    ? allMenuIds
    : allMenuIds.filter((id) => currentUser?.menuAccess?.[id]);

  return (
    <aside className="hidden w-72 shrink-0 border-r border-stone-200 bg-[#F7F4EF] p-5 lg:block overflow-y-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-stone-950 text-sm font-semibold text-white">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="Foto do perfil"
              className="h-full w-full object-cover"
            />
          ) : (
            "EO"
          )}
        </div>
        <div>
          <h1 className="truncate font-semibold tracking-tight text-stone-950">
            {profileName || "Usuário"}
          </h1>
          <p className="text-xs text-stone-500">Espaço de Trabalho</p>
          <Badge
            className={`role-badge mt-2 ${canEdit ? "role-badge-editor" : "role-badge-viewer"}`}
          >
            {canEdit ? "Usuário Editor" : "Usuário Visualizador"}
          </Badge>
        </div>
      </div>

      <nav className="space-y-1">
        {allowedMenuIds.map((id) => {
          const Icon = menuIcons[id];
          const label = menuLabels[id];
          return (
            <button
              key={id}
              onClick={() => setActiveMenu(id)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                activeMenu === id
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:bg-white hover:text-stone-800"
              }`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {label}
            </button>
          );
        })}
      </nav>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between px-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
            Espaços
          </p>
          {canEdit && (
            <button onClick={onAddWorkspace}>
              <Plus className="h-4 w-4 text-stone-400 hover:text-stone-700" />
            </button>
          )}
        </div>
        <div className="space-y-1">
          {workspaces.map((workspace) => {
            const active = activeWorkspaceId === workspace.id;
            return (
              <div
                key={workspace.id}
                className={`group rounded-2xl px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-stone-950 text-white"
                    : "text-stone-600 hover:bg-white hover:text-stone-900"
                }`}
              >
                <button
                  onClick={() => setActiveWorkspaceId(workspace.id)}
                  className="w-full text-left"
                >
                  <span className="block truncate font-medium">{workspace.title}</span>
                  <span className="block truncate text-xs opacity-70">{workspace.owner}</span>
                </button>
                {canEdit && (
                  <div className="mt-2 flex items-center gap-2 opacity-80">
                    <button
                      onClick={() => onEditWorkspace?.(workspace.id)}
                      className={`rounded-lg p-1 transition ${active ? "hover:bg-white/10" : "hover:bg-stone-100"}`}
                      title="Editar espaço"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteWorkspace?.(workspace.id)}
                      className={`rounded-lg p-1 transition ${active ? "hover:bg-white/10" : "hover:bg-red-50 hover:text-red-600"}`}
                      title="Excluir espaço"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onLogout}
        className="mt-8 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-stone-500 hover:bg-white hover:text-stone-800"
      >
        <LogOut className="h-4 w-4" />
        Sair
      </button>
    </aside>
  );
}
