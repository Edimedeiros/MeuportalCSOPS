import React, { useState } from "react";
import { UserPlus } from "lucide-react";
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
  createPhase: "Criar fases",
  formSettings: "Editar formulário",
  flowEdit: "Editar fluxogramas",
};

export default function PeopleView({ users = [], setUsers, canEdit, onLog }) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("view");

  function addMember() {
    if (!email.trim() || !canEdit) return;
    const newUser = {
      id: Date.now(),
      name: email.split("@")[0],
      email,
      role: "member",
      permission,
      avatar: avatarFromEmail(email),
      photo: "",
      cardScope: "all",
      menuAccess: {
        work: true,
        dash: true,
        form: false,
        flow: false,
        people: false,
        logs: false,
        settings: false,
      },
      editMenus: {
        work: false,
        dash: false,
        form: false,
        flow: false,
        people: false,
        logs: false,
        settings: false,
      },
      editDetails: {
        createCard: false,
        moveCard: false,
        editCard: false,
        createPhase: false,
        formSettings: false,
        flowEdit: false,
      },
    };
    setUsers([...users, newUser]);
    onLog?.("Pessoa criada", "Pessoas", "Convite criado para " + email);
    setEmail("");
  }

  function updateUser(id, changes) {
    const target = users.find((u) => u.id === id);
    setUsers(users.map((u) => (u.id === id ? { ...u, ...changes } : u)));
    onLog?.(
      "Pessoa editada",
      "Pessoas",
      "Permissões alteradas para " + (target?.email || "usuário")
    );
  }

  function updateNested(id, field, key, value) {
    const target = users.find((u) => u.id === id);
    setUsers(
      users.map((u) =>
        u.id === id
          ? { ...u, [field]: { ...(u[field] || {}), [key]: value } }
          : u
      )
    );
    onLog?.(
      "Permissão editada",
      "Pessoas",
      (target?.email || "usuário") + " | " + field + "." + key + " = " + value
    );
  }

  return (
    <section className="flex-1 overflow-y-auto p-4 md:p-6">
      <Card>
        <CardContent className="p-5">
          {canEdit && (
            <div className="mb-5 grid gap-3 md:grid-cols-[1fr_160px_140px]">
              <TextInput
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@empresa.com"
              />
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                className="h-12 rounded-2xl border border-stone-200 bg-white px-3 text-sm outline-none"
              >
                <option value="view">Somente ver</option>
                <option value="edit">Editar</option>
              </select>
              <Button
                onClick={addMember}
                className="rounded-2xl bg-stone-950 text-white hover:bg-stone-800"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Convidar
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm ring-1 ring-black/5">
                <div className="mb-4 flex items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-stone-200 text-xs font-semibold text-stone-700">
                      {user.photo ? (
                        <img
                          src={user.photo}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        user.avatar || "?"
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-800">
                        {user.name}
                      </p>
                      <p className="text-xs text-stone-500">{user.email}</p>
                    </div>
                  </div>

                  {user.role === "owner" ? (
                    <Badge className="border-stone-300 bg-white text-stone-700">
                      Dono
                    </Badge>
                  ) : canEdit ? (
                    <select
                      value={user.permission || "view"}
                      onChange={(e) =>
                        updateUser(user.id, { permission: e.target.value })
                      }
                      className="h-10 rounded-2xl border border-stone-200 bg-white px-3 text-sm outline-none"
                    >
                      <option value="view">Somente ver</option>
                      <option value="edit">Editar</option>
                    </select>
                  ) : (
                    <Badge className="border-stone-200 bg-white text-stone-600">
                      {user.permission === "edit" ? "Editor" : "Visualizador"}
                    </Badge>
                  )}
                </div>

                {user.role !== "owner" && (
                  <div className="grid gap-4 xl:grid-cols-3">
                    <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
                      <p className="mb-3 text-sm font-semibold text-stone-800">
                        Quais cards pode ver?
                      </p>
                      <select
                        value={user.cardScope || "all"}
                        onChange={(e) =>
                          updateUser(user.id, { cardScope: e.target.value })
                        }
                        disabled={!canEdit}
                        className="h-10 w-full rounded-2xl border border-stone-200 bg-white px-3 text-sm outline-none"
                      >
                        <option value="all">Todos os cards</option>
                        <option value="own">
                          Somente cards que ele abriu ou onde é solicitante
                        </option>
                      </select>
                    </div>

                    <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
                      <p className="mb-3 text-sm font-semibold text-stone-800">
                        Menus que pode acessar
                      </p>
                      <div className="grid gap-2">
                        {Object.entries(menuLabels).map(([key, label]) => (
                          <label
                            key={key}
                            className="flex items-center gap-2 text-sm text-stone-600"
                          >
                            <input
                              type="checkbox"
                              checked={!!(user.menuAccess || {})[key]}
                              onChange={(e) =>
                                updateNested(
                                  user.id,
                                  "menuAccess",
                                  key,
                                  e.target.checked
                                )
                              }
                              disabled={!canEdit}
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
                      <p className="mb-3 text-sm font-semibold text-stone-800">
                        O que pode editar?
                      </p>
                      {user.permission === "edit" ? (
                        <div className="grid gap-2">
                          {Object.entries(detailLabels).map(([key, label]) => (
                            <label
                              key={key}
                              className="flex items-center gap-2 text-sm text-stone-600"
                            >
                              <input
                                type="checkbox"
                                checked={!!(user.editDetails || {})[key]}
                                onChange={(e) =>
                                  updateNested(
                                    user.id,
                                    "editDetails",
                                    key,
                                    e.target.checked
                                  )
                                }
                                disabled={!canEdit}
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-stone-500">
                          Visualizador não edita nada.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
