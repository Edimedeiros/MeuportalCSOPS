import React, { useState } from "react";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { Card, CardContent } from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import TextInput from "../ui/TextInput.jsx";
import Badge from "../ui/Badge.jsx";
import { avatarFromEmail } from "../../utils/permissions.js";

const menuLabels = {
  work: "Meus trabalhos",
  dash: "Dashboards",
  form: "Formulário",
  flow: "Fluxogramas",
  people: "Pessoas",
  logs: "Logs",
  settings: "Configurações",
};

const detailLabels = {
  createCard: "Criar trabalhos",
  moveCard: "Mover trabalhos",
  editCard: "Editar cards",
  deleteCard: "Excluir cards",
  createPhase: "Criar fases",
  editPhase: "Editar fases",
  deletePhase: "Excluir fases",
  formSettings: "Editar formulário",
  flowEdit: "Editar fluxogramas",
  peopleEdit: "Editar pessoas",
};

function getPermissionLabel(user) {
  if (user.role === "owner") return "Dono";
  if (user.permission === "edit" || user.role === "editor") return "Editor";
  return "Visualizador";
}

export default function PeopleView({
  users = [],
  canEdit,
  onInvitePerson,
  onUpdatePerson,
  onUpdatePersonNested,
  onRemovePerson,
  notify,
  requestConfirm,
}) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("view");
  const [saving, setSaving] = useState(false);

  async function addMember() {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      notify?.("Informe um e-mail válido.", "error");
      return;
    }
    if (!canEdit) return;
    setSaving(true);
    try {
      await onInvitePerson?.({ email: cleanEmail, permission });
      setEmail("");
      setPermission("view");
    } finally {
      setSaving(false);
    }
  }

  async function updateUser(id, changes) {
    if (!canEdit) return;
    await onUpdatePerson?.(id, changes);
  }

  async function updateNested(id, field, key, value) {
    if (!canEdit) return;
    await onUpdatePersonNested?.(id, field, key, value);
  }

  function removeUser(user) {
    if (!canEdit || user.role === "owner") return;
    requestConfirm?.({
      title: "Remover pessoa?",
      message: "Essa pessoa perderá acesso a este espaço de trabalho. Essa ação pode ser revertida adicionando a pessoa novamente.",
      confirmLabel: "Remover pessoa",
      tone: "danger",
      onConfirm: async () => {
        await onRemovePerson?.(user.id);
      },
    });
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="p-5">
        {canEdit && (
          <div className="mb-6 rounded-[1.75rem] border border-stone-200 bg-stone-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-stone-600" />
              <h3 className="text-sm font-semibold text-stone-900">Adicionar pessoa</h3>
              <p className="text-xs text-stone-500">Convide uma pessoa para visualizar ou editar este espaço.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_160px_140px]">
              <TextInput value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@empresa.com" />
              <select value={permission} onChange={(event) => setPermission(event.target.value)} className="h-12 rounded-2xl border border-stone-200 bg-white px-3 text-sm outline-none">
                <option value="view">Somente ver</option>
                <option value="edit">Editar</option>
              </select>
              <Button onClick={addMember} disabled={saving} className="rounded-2xl bg-stone-950 text-white hover:bg-stone-800 disabled:opacity-50">
                {saving ? "Salvando..." : "Convidar"}
              </Button>
            </div>
          </div>
        )}
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-stone-200 text-xs font-semibold text-stone-700">
                    {user.photo ? <img src={user.photo} alt={user.name} className="h-full w-full object-cover" /> : (user.avatar || avatarFromEmail(user.email) || "?")}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-stone-800">{user.name || user.email}</div>
                    <div className="text-xs text-stone-500">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user.role === "owner" ? (
                    <Badge className="border-stone-300 bg-white text-stone-700">Dono</Badge>
                  ) : canEdit ? (
                    <>
                      <select value={user.permission || "view"} onChange={(event) => updateUser(user.id, { permission: event.target.value })} className="h-10 rounded-2xl border border-stone-200 bg-white px-3 text-sm outline-none">
                        <option value="view">Somente ver</option>
                        <option value="edit">Editar</option>
                      </select>
                      <button onClick={() => removeUser(user)} className="rounded-xl p-2 text-stone-400 hover:bg-red-50 hover:text-red-600" title="Remover pessoa">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <Badge className="border-stone-200 bg-white text-stone-600">{getPermissionLabel(user)}</Badge>
                  )}
                </div>
              </div>
              {user.role !== "owner" && (
                <div className="grid gap-4 xl:grid-cols-3">
                  <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
                    <div className="mb-3 text-sm font-semibold text-stone-800">Quais cards pode ver?</div>
                    <select value={user.cardScope || "all"} onChange={(event) => updateUser(user.id, { cardScope: event.target.value })} disabled={!canEdit} className="h-10 w-full rounded-2xl border border-stone-200 bg-white px-3 text-sm outline-none disabled:opacity-60">
                      <option value="all">Todos os cards</option>
                      <option value="own">Somente cards que ele abriu ou onde é solicitante</option>
                    </select>
                  </div>
                  <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
                    <div className="mb-3 text-sm font-semibold text-stone-800">Menus que pode acessar</div>
                    <div className="grid gap-2">
                      {Object.entries(menuLabels).map(([key, label]) => (
                        <label key={key} className="flex items-center gap-2 text-sm text-stone-600">
                          <input type="checkbox" checked={!!(user.menuAccess || {})[key]} onChange={(event) => updateNested(user.id, "menuAccess", key, event.target.checked)} disabled={!canEdit} />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
                    <div className="mb-3 text-sm font-semibold text-stone-800">O que pode editar?</div>
                    {user.permission === "edit" || user.role === "editor" ? (
                      <div className="grid gap-2">
                        {Object.entries(detailLabels).map(([key, label]) => (
                          <label key={key} className="flex items-center gap-2 text-sm text-stone-600">
                            <input type="checkbox" checked={!!(user.editDetails || {})[key]} onChange={(event) => updateNested(user.id, "editDetails", key, event.target.checked)} disabled={!canEdit} />
                            {label}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-stone-500">Visualizador não edita nada.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {!users.length && (
            <div className="rounded-[1.75rem] border border-dashed border-stone-200 bg-stone-50 p-6 text-center text-sm text-stone-500">
              Nenhuma pessoa adicionada ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
