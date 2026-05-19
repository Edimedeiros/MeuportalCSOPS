import React, { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  FolderPlus,
  Plus,
  Save,
  Share2,
  Pencil,
  Folder,
  GitBranch,
  Trash2,
  Check,
  X,
} from "lucide-react";
import Button from "../ui/Button.jsx";
import TextInput from "../ui/TextInput.jsx";

function nodeStyle(accent = false) {
  return {
    background: accent ? "#ecfdf5" : "#fff",
    border: accent ? "1px solid #6ee7b7" : "1px solid #e7e5e4",
    borderRadius: 16,
    padding: "12px 20px",
    fontSize: 13,
    fontWeight: 600,
    color: accent ? "#065f46" : "#1c1917",
  };
}

const starterNodes = [
  { id: "1", position: { x: 40, y: 80 }, data: { label: "Pedido recebido" }, style: nodeStyle() },
  { id: "2", position: { x: 280, y: 80 }, data: { label: "Analisar prioridade" }, style: nodeStyle() },
  { id: "3", position: { x: 520, y: 80 }, data: { label: "Executar trabalho" }, style: nodeStyle() },
  { id: "4", position: { x: 520, y: 220 }, data: { label: "Validar entrega" }, style: nodeStyle() },
  { id: "5", position: { x: 280, y: 220 }, data: { label: "Concluir" }, style: nodeStyle(true) },
];

const starterEdges = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
  { id: "e3-4", source: "3", target: "4" },
  { id: "e4-5", source: "4", target: "5" },
];

function cloneStarterNodes() {
  return starterNodes.map((node) => ({ ...node, position: { ...node.position }, data: { ...node.data }, style: { ...node.style } }));
}

function cloneStarterEdges() {
  return starterEdges.map((edge) => ({ ...edge }));
}

let nodeIdCounter = 10;

export default function FlowView({
  onLog,
  canEdit = true,
  notify,
  requestText,
  requestConfirm,
}) {
  const [folders, setFolders] = useState([
    { id: "geral", name: "Fluxos gerais" },
    { id: "cs", name: "Rotinas de CS" },
  ]);
  const [flows, setFlows] = useState([
    { id: "fluxo-1", folderId: "geral", name: "Fluxo de pedidos", nodes: cloneStarterNodes(), edges: cloneStarterEdges() },
  ]);
  const [activeFolderId, setActiveFolderId] = useState("geral");
  const [activeFlowId, setActiveFlowId] = useState("fluxo-1");
  const [flowName, setFlowName] = useState("Fluxo de pedidos");
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [folderDraftName, setFolderDraftName] = useState("");

  const activeFlow = flows.find((flow) => flow.id === activeFlowId) || flows[0];
  const [nodes, setNodes, onNodesChange] = useNodesState(activeFlow?.nodes || cloneStarterNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(activeFlow?.edges || cloneStarterEdges());

  const filteredFlows = useMemo(
    () => flows.filter((flow) => flow.folderId === activeFolderId),
    [flows, activeFolderId]
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  function persistActiveFlow(extra = {}) {
    setFlows((prev) =>
      prev.map((flow) =>
        flow.id === activeFlowId ? { ...flow, name: flowName || flow.name, nodes, edges, ...extra } : flow
      )
    );
  }

  function loadFlow(flow) {
    if (!flow) return;
    setActiveFlowId(flow.id);
    setFlowName(flow.name);
    setNodes(flow.nodes?.length ? flow.nodes : cloneStarterNodes());
    setEdges(flow.edges || []);
  }

  function createFlow() {
    if (!canEdit) return;
    const id = "fluxo-" + Date.now();
    const name = "Novo fluxograma";
    const newFlow = { id, folderId: activeFolderId, name, nodes: cloneStarterNodes(), edges: cloneStarterEdges() };
    setFlows((prev) => [newFlow, ...prev]);
    setActiveFlowId(id);
    setFlowName(name);
    setNodes(newFlow.nodes);
    setEdges(newFlow.edges);
    onLog?.("Fluxograma criado", "Fluxogramas", name);
    notify?.("Novo fluxograma criado com estrutura inicial.", "success");
  }

  function saveFlow() {
    if (!canEdit) return;
    persistActiveFlow();
    onLog?.("Fluxograma salvo", "Fluxogramas", flowName || "Fluxograma");
    notify?.("Fluxograma salvo com sucesso.", "success");
  }

  function renameFlow(flow = activeFlow) {
    if (!canEdit || !flow) return;
    requestText?.({
      title: "Editar nome do fluxograma",
      label: "Nome do fluxograma",
      initialValue: flow.name || flowName,
      confirmLabel: "Salvar nome",
      onConfirm: (next) => {
        const name = next.trim();
        if (!name) return;
        setFlows((prev) => prev.map((item) => item.id === flow.id ? { ...item, name } : item));
        if (flow.id === activeFlowId) setFlowName(name);
        onLog?.("Fluxograma editado", "Fluxogramas", "Nome alterado para " + name);
        notify?.("Nome do fluxograma atualizado.", "success");
      },
    });
  }

  function deleteFlow(flow) {
    if (!canEdit || !flow) return;
    requestConfirm?.({
      title: "Excluir fluxograma?",
      message: "Essa ação é irreversível. O fluxograma e suas conexões serão removidos.",
      confirmLabel: "Excluir fluxograma",
      tone: "danger",
      onConfirm: () => {
        const remaining = flows.filter((item) => item.id !== flow.id);
        setFlows(remaining);
        onLog?.("Fluxograma excluído", "Fluxogramas", flow.name);
        notify?.("Fluxograma excluído.", "success");
        if (flow.id === activeFlowId) {
          const fallback = remaining.find((item) => item.folderId === activeFolderId) || remaining[0];
          if (fallback) loadFlow(fallback);
          else {
            setActiveFlowId("");
            setFlowName("Nenhum fluxograma selecionado");
            setNodes([]);
            setEdges([]);
          }
        }
      },
    });
  }

  function shareFlow() {
    const link = "https://meuportal.com/fluxos/" + (activeFlowId || "novo");
    navigator.clipboard?.writeText(link).catch(() => null);
    notify?.("Link de compartilhamento copiado: " + link, "success");
    onLog?.("Fluxograma compartilhado", "Fluxogramas", flowName || activeFlowId);
  }

  function addFolder() {
    if (!canEdit || !newFolderName.trim()) return;
    const folder = { id: "pasta-" + Date.now(), name: newFolderName.trim() };
    setFolders((prev) => [...prev, folder]);
    setActiveFolderId(folder.id);
    setNewFolderName("");
    onLog?.("Pasta criada", "Fluxogramas", folder.name);
    notify?.("Pasta criada.", "success");
  }

  function renameFolder(folder) {
    if (!canEdit || !folder) return;
    setEditingFolderId(folder.id);
    setFolderDraftName(folder.name);
  }

  function saveFolderName(folder) {
    if (!canEdit || !folder) return;
    const name = folderDraftName.trim();
    if (!name) return;
    setFolders((prev) => prev.map((item) => item.id === folder.id ? { ...item, name } : item));
    setEditingFolderId(null);
    setFolderDraftName("");
    onLog?.("Pasta editada", "Fluxogramas", folder.name + " -> " + name);
    notify?.("Pasta atualizada.", "success");
  }

  function cancelFolderEdit() {
    setEditingFolderId(null);
    setFolderDraftName("");
  }

  function deleteFolder(folder) {
    if (!canEdit || !folder) return;
    requestConfirm?.({
      title: "Excluir pasta?",
      message: "Essa ação é irreversível. A pasta e os fluxogramas salvos nela serão removidos.",
      confirmLabel: "Excluir pasta",
      tone: "danger",
      onConfirm: () => {
        const nextFolders = folders.filter((item) => item.id !== folder.id);
        const nextFlows = flows.filter((flow) => flow.folderId !== folder.id);
        setFolders(nextFolders);
        setFlows(nextFlows);
        onLog?.("Pasta excluída", "Fluxogramas", folder.name);
        notify?.("Pasta excluída.", "success");
        if (activeFolderId === folder.id) {
          const fallbackFolder = nextFolders[0];
          setActiveFolderId(fallbackFolder?.id || "");
          const fallbackFlow = nextFlows.find((flow) => flow.folderId === fallbackFolder?.id);
          if (fallbackFlow) loadFlow(fallbackFlow);
          else {
            setActiveFlowId("");
            setFlowName("Nenhum fluxograma selecionado");
            setNodes([]);
            setEdges([]);
          }
        }
      },
    });
  }

  function addNode() {
    if (!canEdit) return;
    nodeIdCounter++;
    const newNode = {
      id: String(nodeIdCounter),
      position: { x: 100 + Math.random() * 300, y: 100 + Math.random() * 200 },
      data: { label: "Novo bloco " + nodeIdCounter },
      style: nodeStyle(),
    };
    setNodes((nds) => [...nds, newNode]);
    onLog?.("Bloco criado", "Fluxogramas", newNode.data.label);
    notify?.("Bloco adicionado ao fluxograma.", "success");
  }

  return (
    <section className="flex flex-1 flex-col overflow-hidden p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
        <div className="flex flex-wrap gap-2">
          {canEdit && <Button onClick={createFlow} className="rounded-2xl bg-stone-950 text-white hover:bg-stone-800"><GitBranch className="mr-2 h-4 w-4" />Novo fluxograma</Button>}
          {canEdit && <Button onClick={addNode} className="rounded-2xl bg-stone-950 text-white hover:bg-stone-800"><Plus className="mr-2 h-4 w-4" />Novo bloco</Button>}
          {canEdit && <Button onClick={saveFlow} variant="outline" className="rounded-2xl border-stone-200"><Save className="mr-2 h-4 w-4" />Salvar</Button>}
          {canEdit && <Button onClick={() => renameFlow(activeFlow)} variant="outline" className="rounded-2xl border-stone-200"><Pencil className="mr-2 h-4 w-4" />Editar nome</Button>}
          <Button onClick={shareFlow} variant="outline" className="rounded-2xl border-stone-200"><Share2 className="mr-2 h-4 w-4" />Compartilhar</Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[300px_1fr]">
        <aside className="flow-sidebar overflow-y-auto rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm">
          <h4 className="mb-3 font-semibold text-stone-900">Pastas</h4>
          {canEdit && <div className="mb-4 grid gap-2"><TextInput value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Nome da nova pasta" /><Button onClick={addFolder} className="rounded-2xl bg-stone-950 text-white hover:bg-stone-800"><FolderPlus className="mr-2 h-4 w-4" />Criar pasta</Button></div>}
          <div className="space-y-2">
            {folders.map((folder) => (
              <div key={folder.id} className={`flow-list-item rounded-2xl border p-3 ${activeFolderId === folder.id ? "flow-list-item-active" : "bg-stone-50 text-stone-700"}`}>
                {editingFolderId === folder.id ? (
                  <div className="space-y-2">
                    <input
                      value={folderDraftName}
                      onChange={(e) => setFolderDraftName(e.target.value)}
                      className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <button onClick={() => saveFolderName(folder)} className="icon-action" title="Salvar pasta"><Check className="h-4 w-4" /></button>
                      <button onClick={cancelFolderEdit} className="icon-action" title="Cancelar edição"><X className="h-4 w-4" /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button onClick={() => setActiveFolderId(folder.id)} className="flex w-full items-center gap-2 text-left text-sm font-medium"><Folder className="h-4 w-4" />{folder.name}</button>
                    {canEdit && <div className="mt-2 flex items-center gap-2 text-xs opacity-90"><button onClick={() => renameFolder(folder)} className="icon-action" title="Editar pasta"><Pencil className="h-4 w-4" /></button><button onClick={() => deleteFolder(folder)} className="icon-action icon-action-danger" title="Excluir pasta"><Trash2 className="h-4 w-4" /></button></div>}
                  </>
                )}
              </div>
            ))}
          </div>

          <h4 className="mb-3 mt-6 font-semibold text-stone-900">Fluxogramas da pasta</h4>
          <div className="space-y-2">
            {filteredFlows.length ? filteredFlows.map((flow) => (
              <div key={flow.id} className={`flow-list-item rounded-2xl border p-3 text-sm ${activeFlowId === flow.id ? "flow-list-item-active" : "bg-stone-50 text-stone-700 hover:bg-stone-100"}`}>
                <button onClick={() => loadFlow(flow)} className="w-full text-left font-medium">{flow.name}</button>
                {canEdit && <div className="mt-2 flex items-center gap-2 text-xs opacity-90"><button onClick={() => renameFlow(flow)} className="icon-action" title="Editar fluxograma"><Pencil className="h-4 w-4" /></button><button onClick={() => deleteFlow(flow)} className="icon-action icon-action-danger" title="Excluir fluxograma"><Trash2 className="h-4 w-4" /></button></div>}
              </div>
            )) : <p className="rounded-2xl bg-stone-50 p-3 text-sm text-stone-500">Nenhum fluxograma nesta pasta.</p>}
          </div>
        </aside>

        <div className="flow-canvas-card flex min-h-0 flex-col overflow-hidden rounded-[2rem] border border-stone-200 bg-[#F7F4EF] shadow-sm">
          <div className="flow-canvas-header flex items-center justify-between border-b border-stone-200 bg-white px-5 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Fluxograma atual</p>
              <input value={flowName} onChange={(e) => setFlowName(e.target.value)} disabled={!canEdit} className="mt-1 block w-full min-w-[280px] bg-transparent text-lg font-semibold text-stone-900 outline-none" />
            </div>
          </div>
          <div className="flow-canvas min-h-[560px] flex-1">
            <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView proOptions={{ hideAttribution: true }}>
              <Background color="#c7c1b7" gap={22} />
            </ReactFlow>
          </div>
        </div>
      </div>
    </section>
  );
}
