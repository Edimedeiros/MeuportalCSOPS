import React, { useEffect, useState } from "react";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import TextInput from "../ui/TextInput.jsx";
import { Label } from "../ui/Tooltip.jsx";

export default function RequestFormView({
  board,
  tags = [],
  serviceTypes = [],
  departments = [],
  onSubmitRequest,
  onCreateDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
  onCreateServiceType,
  onUpdateServiceType,
  onDeleteServiceType,
  notify,
  requestText,
  requestConfirm,
}) {
  const phases = board?.phases?.length ? board.phases : ["A fazer"];

  const [tab, setTab] = useState("form");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [newServiceType, setNewServiceType] = useState("");
  const [savingDepartment, setSavingDepartment] = useState(false);
  const [savingServiceType, setSavingServiceType] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    requester: "",
    requesterEmail: "",
    department: departments[0] || "",
    tag: serviceTypes[0] || "",
    priority: "Normal",
    dueDate: "",
    phase: phases[0] || "A fazer",
  });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      department:
        current.department && departments.includes(current.department)
          ? current.department
          : departments[0] || "",
      tag:
        current.tag && serviceTypes.includes(current.tag)
          ? current.tag
          : serviceTypes[0] || "",
      phase:
        current.phase && phases.includes(current.phase)
          ? current.phase
          : phases[0] || "A fazer",
    }));
  }, [departments, serviceTypes, phases.join("|")]);

  function validate() {
    const required = [
      form.title,
      form.description,
      form.requester,
      form.requesterEmail,
      form.department,
      form.tag,
      form.priority,
      form.dueDate,
      form.phase,
    ];

    if (required.some((value) => !String(value || "").trim())) {
      return "Preencha todos os campos obrigatórios.";
    }

    if (!form.requesterEmail.includes("@")) {
      return "Informe um e-mail válido.";
    }

    return "";
  }

  async function submit() {
    const msg = validate();

    if (msg) {
      setError(msg);
      return;
    }

    await onSubmitRequest(form);

    setSubmitted(true);
    setError("");

    setForm((current) => ({
      ...current,
      title: "",
      description: "",
      requester: "",
      requesterEmail: "",
      dueDate: "",
    }));
  }

  async function addDepartment() {
    const value = newDepartment.trim();

    if (!value) return;

    if (departments.includes(value)) {
      notify?.("Esse setor já existe.", "error");
      return;
    }

    setSavingDepartment(true);

    try {
      await onCreateDepartment?.(value);
      setNewDepartment("");
    } finally {
      setSavingDepartment(false);
    }
  }

  async function addServiceType() {
    const value = newServiceType.trim();

    if (!value) return;

    if (serviceTypes.includes(value)) {
      notify?.("Esse tipo de pedido já existe.", "error");
      return;
    }

    setSavingServiceType(true);

    try {
      await onCreateServiceType?.(value);
      setNewServiceType("");
    } finally {
      setSavingServiceType(false);
    }
  }

  function removeDepartment(name) {
    requestConfirm?.({
      title: "Excluir setor?",
      message:
        "Essa ação remove o setor da lista do formulário. Essa exclusão é irreversível.",
      confirmLabel: "Excluir setor",
      tone: "danger",
      onConfirm: async () => {
        await onDeleteDepartment?.(name);
      },
    });
  }

  function removeServiceType(name) {
    requestConfirm?.({
      title: "Excluir tipo de pedido?",
      message:
        "Essa ação remove o tipo de pedido da lista do formulário. Essa exclusão é irreversível.",
      confirmLabel: "Excluir tipo",
      tone: "danger",
      onConfirm: async () => {
        await onDeleteServiceType?.(name);
      },
    });
  }

  function editDepartment(oldName) {
    requestText?.({
      title: "Editar setor",
      label: "Nome do setor",
      initialValue: oldName,
      confirmLabel: "Salvar setor",
      onConfirm: async (next) => {
        const nextName = String(next || "").trim();

        if (!nextName || nextName === oldName) return;

        if (departments.includes(nextName)) {
          notify?.("Já existe um setor com esse nome.", "error");
          return;
        }

        await onUpdateDepartment?.(oldName, nextName);
      },
    });
  }

  function editServiceType(oldName) {
    requestText?.({
      title: "Editar tipo de pedido",
      label: "Nome do tipo de pedido",
      initialValue: oldName,
      confirmLabel: "Salvar tipo",
      onConfirm: async (next) => {
        const nextName = String(next || "").trim();

        if (!nextName || nextName === oldName) return;

        if (serviceTypes.includes(nextName)) {
          notify?.("Já existe um tipo de pedido com esse nome.", "error");
          return;
        }

        await onUpdateServiceType?.(oldName, nextName);
      },
    });
  }

  function copyShareLink() {
    const link = `${window.location.origin}/pedir-servico/cs-ops`;

    navigator.clipboard
      ?.writeText(link)
      .then(() => notify?.("Link copiado.", "success"))
      .catch(() => notify?.("Não foi possível copiar o link.", "error"));
  }

  return (
    <section className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-end gap-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-1">
          <button
            onClick={() => setTab("form")}
            className={`rounded-xl px-4 py-2 text-sm ${
              tab === "form" ? "bg-stone-950 text-white" : "text-stone-500"
            }`}
          >
            Formulário
          </button>
          <button
            onClick={() => setTab("settings")}
            className={`rounded-xl px-4 py-2 text-sm ${
              tab === "settings" ? "bg-stone-950 text-white" : "text-stone-500"
            }`}
          >
            Configurações
          </button>
        </div>
      </div>

      {tab === "form" ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
          <Card>
            <CardContent className="p-6">
              <p className="mb-5 text-sm text-stone-500">
                Todos os campos são obrigatórios. O pedido enviado vira um card
                no Kanban.
              </p>

              <div className="space-y-4">
                <div>
                  <Label help="Dê um nome curto e claro para a solicitação.">
                    Nome do pedido
                  </Label>
                  <TextInput
                    value={form.title}
                    onChange={(event) =>
                      setForm({ ...form, title: event.target.value })
                    }
                    placeholder="Ex: Criar indicador de clientes atrasados"
                  />
                </div>

                <div>
                  <Label help="Explique o contexto, objetivo e resultado esperado.">
                    Descrição do pedido
                  </Label>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                    placeholder="Explique o que precisa"
                    className="h-28 w-full resize-none rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-stone-100"
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label>Quem está pedindo</Label>
                    <TextInput
                      value={form.requester}
                      onChange={(event) =>
                        setForm({ ...form, requester: event.target.value })
                      }
                      placeholder="Nome do solicitante"
                    />
                  </div>

                  <div>
                    <Label>E-mail do solicitante</Label>
                    <TextInput
                      type="email"
                      value={form.requesterEmail}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          requesterEmail: event.target.value,
                        })
                      }
                      placeholder="email@empresa.com"
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label>Setor</Label>
                    <select
                      value={form.department}
                      onChange={(event) =>
                        setForm({ ...form, department: event.target.value })
                      }
                      className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-3 text-sm outline-none"
                    >
                      {departments.length ? (
                        departments.map((department) => (
                          <option key={department}>{department}</option>
                        ))
                      ) : (
                        <option value="">Nenhum setor cadastrado</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <Label>Tipo de pedido</Label>
                    <select
                      value={form.tag}
                      onChange={(event) =>
                        setForm({ ...form, tag: event.target.value })
                      }
                      className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-3 text-sm outline-none"
                    >
                      {serviceTypes.length ? (
                        serviceTypes.map((type) => (
                          <option key={type}>{type}</option>
                        ))
                      ) : (
                        <option value="">Nenhum tipo cadastrado</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <Label>Prioridade</Label>
                    <select
                      value={form.priority}
                      onChange={(event) =>
                        setForm({ ...form, priority: event.target.value })
                      }
                      className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-3 text-sm outline-none"
                    >
                      <option>Normal</option>
                      <option>Prioridade</option>
                      <option>Urgente</option>
                    </select>
                  </div>

                  <div>
                    <Label>Prazo desejado</Label>
                    <TextInput
                      type="date"
                      value={form.dueDate}
                      onChange={(event) =>
                        setForm({ ...form, dueDate: event.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label>Fase inicial</Label>
                    <select
                      value={form.phase}
                      onChange={(event) =>
                        setForm({ ...form, phase: event.target.value })
                      }
                      className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-3 text-sm outline-none"
                    >
                      {phases.map((phase) => (
                        <option key={phase}>{phase}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <Button
                  onClick={submit}
                  className="h-12 w-full rounded-2xl bg-stone-950 text-white hover:bg-stone-800"
                >
                  Enviar pedido para o quadro
                </Button>

                {submitted && (
                  <p className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">
                    Pedido enviado e criado no Kanban.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h4 className="mb-3 font-semibold text-stone-900">
                Link de compartilhamento
              </h4>

              <div className="break-all rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
                {`${window.location.origin}/pedir-servico/cs-ops`}
              </div>

              <Button
                onClick={copyShareLink}
                variant="outline"
                className="mt-3 rounded-2xl border-stone-200 bg-white"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar link
              </Button>

              <div className="mt-6 rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
                <strong className="text-stone-900">
                  Resposta automática:
                </strong>{" "}
                quando você concluir um pedido feito pelo formulário, o sistema
                simula o envio de um e-mail ao solicitante com a confirmação de
                conclusão.
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h4 className="mb-4 font-semibold text-stone-900">
                Setores disponíveis
              </h4>

              <div className="mb-4 grid gap-2 md:grid-cols-[1fr_120px]">
                <TextInput
                  value={newDepartment}
                  onChange={(event) => setNewDepartment(event.target.value)}
                  placeholder="Novo setor"
                />

                <Button
                  onClick={addDepartment}
                  disabled={savingDepartment}
                  className="rounded-2xl bg-stone-950 text-white disabled:opacity-50"
                >
                  {savingDepartment ? "Salvando..." : "Adicionar"}
                </Button>
              </div>

              <div className="space-y-2">
                {departments.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 p-3 text-sm"
                  >
                    <span className="font-medium text-stone-700">{item}</span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => editDepartment(item)}
                        className="rounded-xl p-2 text-stone-400 hover:bg-white hover:text-stone-800"
                        title="Editar setor"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => removeDepartment(item)}
                        className="rounded-xl p-2 text-stone-400 hover:bg-white hover:text-red-600"
                        title="Excluir setor"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {!departments.length && (
                  <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-4 text-sm text-stone-500">
                    Nenhum setor cadastrado ainda.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h4 className="mb-4 font-semibold text-stone-900">
                Tipos de pedido disponíveis
              </h4>

              <div className="mb-4 grid gap-2 md:grid-cols-[1fr_120px]">
                <TextInput
                  value={newServiceType}
                  onChange={(event) => setNewServiceType(event.target.value)}
                  placeholder="Novo tipo de pedido"
                />

                <Button
                  onClick={addServiceType}
                  disabled={savingServiceType}
                  className="rounded-2xl bg-stone-950 text-white disabled:opacity-50"
                >
                  {savingServiceType ? "Salvando..." : "Adicionar"}
                </Button>
              </div>

              <div className="space-y-2">
                {serviceTypes.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 p-3 text-sm"
                  >
                    <span className="font-medium text-stone-700">{item}</span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => editServiceType(item)}
                        className="rounded-xl p-2 text-stone-400 hover:bg-white hover:text-stone-800"
                        title="Editar tipo de pedido"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => removeServiceType(item)}
                        className="rounded-xl p-2 text-stone-400 hover:bg-white hover:text-red-600"
                        title="Excluir tipo de pedido"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {!serviceTypes.length && (
                  <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-4 text-sm text-stone-500">
                    Nenhum tipo de pedido cadastrado ainda.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}
