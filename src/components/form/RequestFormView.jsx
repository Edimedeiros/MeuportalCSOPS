import React, { useState } from "react";
import { Copy, Pencil, X } from "lucide-react";
import { Card, CardContent } from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import TextInput from "../ui/TextInput.jsx";
import { Label } from "../ui/Tooltip.jsx";

export default function RequestFormView({
  board,
  tags = [],
  serviceTypes = [],
  setServiceTypes,
  departments = [],
  setDepartments,
  onSubmitRequest,
  onLog,
  notify,
  requestText,
  requestConfirm,
}) {
  const phases = board?.phases || ["A fazer"];

  const [tab, setTab] = useState("form");
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
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [newServiceType, setNewServiceType] = useState("");

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
    if (required.some((v) => !String(v || "").trim())) {
      return "Preencha todos os campos obrigatórios.";
    }
    if (!form.requesterEmail.includes("@")) {
      return "Informe um e-mail válido.";
    }
    return "";
  }

  function submit() {
    const msg = validate();
    if (msg) { setError(msg); return; }
    onSubmitRequest(form);
    setSubmitted(true);
    setError("");
    setForm({ ...form, title: "", description: "", requester: "", requesterEmail: "", dueDate: "" });
  }

  function addDepartment() {
    const v = newDepartment.trim();
    if (!v || departments.includes(v)) return;
    setDepartments([...departments, v]);
    onLog?.("Setor criado", "Formulário", v);
    notify?.("Setor criado.", "success");
    setNewDepartment("");
  }

  function addServiceType() {
    const v = newServiceType.trim();
    if (!v || serviceTypes.includes(v)) return;
    setServiceTypes([...serviceTypes, v]);
    onLog?.("Tipo de pedido criado", "Formulário", v);
    notify?.("Tipo de pedido criado.", "success");
    setNewServiceType("");
  }

  function removeDepartment(name) {
    requestConfirm?.({
      title: "Excluir setor?",
      message: "Essa ação remove o setor da lista de opções do formulário.",
      confirmLabel: "Excluir setor",
      tone: "danger",
      onConfirm: () => {
        setDepartments(departments.filter((d) => d !== name));
        onLog?.("Setor excluído", "Formulário", name);
        notify?.("Setor excluído.", "success");
      },
    });
  }

  function removeServiceType(name) {
    requestConfirm?.({
      title: "Excluir tipo de pedido?",
      message: "Essa ação remove o tipo de pedido da lista de opções do formulário.",
      confirmLabel: "Excluir tipo",
      tone: "danger",
      onConfirm: () => {
        setServiceTypes(serviceTypes.filter((s) => s !== name));
        onLog?.("Tipo de pedido excluído", "Formulário", name);
        notify?.("Tipo de pedido excluído.", "success");
      },
    });
  }

  function editDepartment(oldName) {
    requestText?.({
      title: "Editar setor",
      label: "Nome do setor",
      initialValue: oldName,
      confirmLabel: "Salvar setor",
      onConfirm: (next) => {
        if (!next || !next.trim()) return;
        setDepartments(departments.map((d) => (d === oldName ? next.trim() : d)));
        onLog?.("Setor editado", "Formulário", oldName + " → " + next.trim());
        notify?.("Setor atualizado.", "success");
      },
    });
  }

  function editServiceType(oldName) {
    requestText?.({
      title: "Editar tipo de pedido",
      label: "Nome do tipo de pedido",
      initialValue: oldName,
      confirmLabel: "Salvar tipo",
      onConfirm: (next) => {
        if (!next || !next.trim()) return;
        setServiceTypes(serviceTypes.map((s) => (s === oldName ? next.trim() : s)));
        onLog?.("Tipo de pedido editado", "Formulário", oldName + " → " + next.trim());
        notify?.("Tipo de pedido atualizado.", "success");
      },
    });
  }

  return (
    <section className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-end gap-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-1">
          <button
            onClick={() => setTab("form")}
            className={`rounded-xl px-4 py-2 text-sm ${tab === "form" ? "bg-stone-950 text-white" : "text-stone-500"}`}
          >
            Formulário
          </button>
          <button
            onClick={() => setTab("settings")}
            className={`rounded-xl px-4 py-2 text-sm ${tab === "settings" ? "bg-stone-950 text-white" : "text-stone-500"}`}
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
                Todos os campos são obrigatórios. O pedido enviado vira um card no Kanban.
              </p>
              <div className="space-y-4">
                <div>
                  <Label help="Dê um nome curto e claro para a solicitação.">
                    Nome do pedido
                  </Label>
                  <TextInput
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Ex: Criar indicador de clientes atrasados"
                  />
                </div>
                <div>
                  <Label help="Explique o contexto, objetivo e resultado esperado.">
                    Descrição do pedido
                  </Label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Explique o que precisa"
                    className="h-28 w-full resize-none rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-stone-100"
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label>Quem está pedindo</Label>
                    <TextInput
                      value={form.requester}
                      onChange={(e) => setForm({ ...form, requester: e.target.value })}
                      placeholder="Nome do solicitante"
                    />
                  </div>
                  <div>
                    <Label>E-mail do solicitante</Label>
                    <TextInput
                      type="email"
                      value={form.requesterEmail}
                      onChange={(e) => setForm({ ...form, requesterEmail: e.target.value })}
                      placeholder="email@empresa.com"
                    />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label>Setor</Label>
                    <select
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-3 text-sm outline-none"
                    >
                      {departments.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Tipo de pedido</Label>
                    <select
                      value={form.tag}
                      onChange={(e) => setForm({ ...form, tag: e.target.value })}
                      className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-3 text-sm outline-none"
                    >
                      {serviceTypes.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <Label>Prioridade</Label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
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
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Fase inicial</Label>
                    <select
                      value={form.phase}
                      onChange={(e) => setForm({ ...form, phase: e.target.value })}
                      className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-3 text-sm outline-none"
                    >
                      {phases.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                {error && (
                  <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
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
              <h4 className="mb-3 font-semibold text-stone-900">Link de compartilhamento</h4>
              <div className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-600 break-all">
                https://meuportal.com/pedir-servico/cs-ops
              </div>
              <Button variant="outline" className="mt-3 rounded-2xl border-stone-200 bg-white">
                <Copy className="mr-2 h-4 w-4" />
                Copiar link
              </Button>
              <div className="mt-6 rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
                <strong className="text-stone-900">Resposta automática:</strong> quando você
                concluir um pedido feito pelo formulário, o sistema simula o envio de um e-mail ao
                solicitante com a confirmação de conclusão.
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h4 className="mb-4 font-semibold text-stone-900">Setores disponíveis</h4>
              <div className="mb-4 grid gap-2 md:grid-cols-[1fr_120px]">
                <TextInput
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="Novo setor"
                />
                <Button onClick={addDepartment} className="rounded-2xl bg-stone-950 text-white">
                  Adicionar
                </Button>
              </div>
              <div className="space-y-2">
                {departments.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl bg-stone-50 p-3 text-sm"
                  >
                    <span>{item}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => editDepartment(item)} className="text-stone-400 hover:text-stone-800">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => removeDepartment(item)} className="text-stone-400 hover:text-red-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h4 className="mb-4 font-semibold text-stone-900">Tipos de pedido disponíveis</h4>
              <div className="mb-4 grid gap-2 md:grid-cols-[1fr_120px]">
                <TextInput
                  value={newServiceType}
                  onChange={(e) => setNewServiceType(e.target.value)}
                  placeholder="Novo tipo de pedido"
                />
                <Button onClick={addServiceType} className="rounded-2xl bg-stone-950 text-white">
                  Adicionar
                </Button>
              </div>
              <div className="space-y-2">
                {serviceTypes.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl bg-stone-50 p-3 text-sm"
                  >
                    <span>{item}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => editServiceType(item)} className="text-stone-400 hover:text-stone-800">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => removeServiceType(item)} className="text-stone-400 hover:text-red-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}
