import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
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
  MoveRight,
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
  {
    id: "1",
    position: { x: 40, y: 80 },
    data: { label: "Pedido recebido" },
    style: nodeStyle(),
  },
  {
    id: "2",
    position: { x: 280, y: 80 },
    data: { label: "Analisar prioridade" },
    style: nodeStyle(),
  },
  {
    id: "3",
    position: { x: 520, y: 80 },
    data: { label: "Executar trabalho" },
    style: nodeStyle(),
  },
  {
    id: "4",
    position: { x: 520, y: 220 },
    data: { label: "Validar entrega" },
    style: nodeStyle(),
  },
  {
    id: "5",
    position: { x: 280, y: 220 },
    data: { label: "Concluir" },
    style: nodeStyle(true),
  },
];

const starterEdges = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
  { id: "e3-4", source: "3", target: "4" },
  { id: "e4-5", source: "4", target: "5" },
];

function cloneStarterNodes() {
  return starterNodes.map((node) => ({
    ...node,
    position: { ...node.position },
    data: { ...node.data },
    style: { ...node.style },
  }));
}

function cloneStarterEdges() {
  return starterEdges.map((edge) => ({ ...edge }));
}

function getNextNodeId(nodes = []) {
  const numbers = nodes
    .map((node) => Number(String(node.id).replace(/\D/g, "")))
    .filter((number) => Number.isFinite(number));

  return String((numbers.length ? Math.max(...numbers) : 0) + 1);
}

export default function FlowView({
  workspaceId,
  folders = [],
  flowcharts = [],
  loading = false,
  canEdit = true,
  notify,
  requestText,
  requestConfirm,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onCreateFlowchart,
  onUpdateFlowchartName,
  onMoveFlowchartToFolder,
  onSaveFlowchartData,
  onDeleteFlowchart,
}) {
  const [activeFolderId, setActiveFolderId] = useState("");
  const [activeFlowId, setActiveFlowId] = useState("");
  const [flowName, setFlowName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [folderDraftName, setFolderDraftName] = useState("");

  const activeFlow = useMemo(
    () => flowcharts.find((flow) => flow.id === activeFlowId) || null,
    [flowcharts, activeFlowId]
  );

  const activeFolder = useMemo(
    () => folders.find((folder) => folder.id === activeFolderId) || null,
    [folders, activeFolderId]
  );

  const filteredFlows = useMemo(
    () => flowcharts.filter((flow) => flow.folderId === activeFolderId),
    [flowcharts, activeFolderId]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!activeFolderId && folders.length) {
      setActiveFolderId(folders[0].id);
    }

    if (activeFolderId && !folders.some((folder) => folder.id === activeFolderId)) {
      setActiveFolderId(folders[0]?.id || "");
    }
  }, [folders, activeFolderId]);

  useEffect(() => {
    if (!activeFlowId && flowcharts.length) {
      const firstFromFolder =
        flowcharts.find((flow) => flow.folderId === activeFolderId) ||
        flowcharts[0];

      if (firstFromFolder) {
        loadFlow(firstFromFolder);
      }
    }

    if (activeFlowId && !flowcharts.some((flow) => flow.id === activeFlowId)) {
      const fallback =
        flowcharts.find((flow) => flow.folderId === activeFolderId) ||
        flowcharts[0];

      if (fallback) {
        loadFlow(fallback);
      } else {
        setActiveFlowId("");
        setFlowName("");
        setNodes([]);
        setEdges([]);
      }
    }
  }, [flowcharts, activeFlowId, activeFolderId]);

  useEffect(() => {
    if (activeFlow) {
      setFlowName(activeFlow.name || "Fluxograma");
      setNodes(
        activeFlow.nodes?.length ? activeFlow.nodes : cloneStarterNodes()
      );
      setEdges(Array.isArray(activeFlow.edges) ? activeFlow.edges : []);
    }
  }, [activeFlow?.id]);

  const onConnect = useCallback(
    (params) => setEdges((currentEdges) => addEdge(params, currentEdges)),
    [setEdges]
  );

  function loadFlow(flow) {
    if (!flow) return;

    setActiveFlowId(flow.id);
    setActiveFolderId(flow.folderId || activeFolderId);
    setFlowName(flow.name || "Fluxograma");
    setNodes(flow.nodes?.length ? flow.nodes : cloneStarterNodes());
    setEdges(Array.isArray(flow.edges) ? flow.edges : []);
  }

  async function createFolder() {
    const name = newFolderName.trim();

    if (!canEdit || !name) return;

    const created = await onCreateFolder?.(name);

    setNewFolderName("");

    if (created?.id) {
      setActiveFolderId(created.id);
    }
  }

  function renameFolder(folder) {
    if (!canEdit || !folder) return;

    setEditingFolderId(folder.id);
    setFolderDraftName(folder.name);
  }

  async function saveFolderName(folder) {
    if (!canEdit || !folder) return;

    const name = folderDraftName.trim();

    if (!name) return;

    await onUpdateFolder?.(folder.id, name);

    setEditingFolderId(null);
    setFolderDraftName("");
  }

  function cancelFolderEdit() {
    setEditingFolderId(null);
    setFolderDraftName("");
  }

  function deleteFolder(folder) {
    if (!canEdit || !folder) return;

    requestConfirm?.({
      title: "Excluir pasta?",
      message:
        "Essa ação é irreversível. A pasta e os fluxogramas salvos nela serão removidos.",
      confirmLabel: "Excluir pasta",
      tone: "danger",
      onConfirm: async () => {
        await onDeleteFolder?.(folder.id);
      },
    });
  }

  async function createFlow() {
  if (!canEdit) return;

  const folderId = activeFolderId;

  if (!folderId) {
    notify?.("Crie ou selecione uma pasta antes de criar um fluxograma.", "error");
    return;
  }

  const created = await onCreateFlowchart?.({
    folderId,
    name: "Novo fluxograma",
  });

  if (created) {
    loadFlow(created);
  }
}

  function renameFlow(flow = activeFlow) {
    if (!canEdit || !flow) return;

    requestText?.({
      title: "Editar nome do fluxograma",
      label: "Nome do fluxograma",
      initialValue: flow.name || flowName,
      confirmLabel: "Salvar nome",
      onConfirm: async (next) => {
        const name = String(next || "").trim();

        if (!name) return;

        await onUpdateFlowchartName?.(flow.id, name);

        if (flow.id === activeFlowId) {
          setFlowName(name);
        }
      },
    });
  }

  function deleteFlow(flow) {
    if (!canEdit || !flow) return;

    requestConfirm?.({
      title: "Excluir fluxograma?",
      message:
        "Essa ação é irreversível. O fluxograma e suas conexões serão removidos.",
      confirmLabel: "Excluir fluxograma",
      tone: "danger",
      onConfirm: async () => {
        await onDeleteFlowchart?.(flow.id);
      },
    });
  }

  async function saveFlow() {
    if (!canEdit || !activeFlowId) return;

    if (flowName.trim() && flowName.trim() !== activeFlow?.name) {
      await onUpdateFlowchartName?.(activeFlowId, flowName.trim());
    }

    await onSaveFlowchartData?.(activeFlowId, nodes, edges);
  }

  async function moveFlow(flow, nextFolderId) {
    if (!canEdit || !flow || !nextFolderId || flow.folderId === nextFolderId) {
      return;
    }

    await onMoveFlowchartToFolder?.(flow.id, nextFolderId);

    if (flow.id === activeFlowId) {
      setActiveFolderId(nextFolderId);
    }
  }

  function shareFlow() {
    const link = `${window.location.origin}/fluxos/${activeFlowId || "novo"}`;

    navigator.clipboard
      ?.writeText(link)
      .then(() => notify?.("Link de compartilhamento copiado.", "success"))
      .catch(() => notify?.("Não foi possível copiar o link.", "error"));
  }

  function addNode() {
    if (!canEdit || !activeFlowId) return;

    const id = getNextNodeId(nodes);

    const newNode = {
      id,
      position: {
        x: 100 + Math.random() * 300,
        y: 100 + Math.random() * 200,
      },
      data: { label: "Novo bloco " + id },
      style: nodeStyle(),
    };

    setNodes((currentNodes) => [...currentNodes, newNode]);
    notify?.("Bloco adicionado. Clique em Salvar para gravar.", "success");
  }

  function updateSelectedFlowName(event) {
    setFlowName(event.target.value);
  }

  if (!workspaceId) {
    return (
      <section className="flex flex-1 items-center justify-center p-6">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-stone-900">
            Nenhum espaço selecionado
          </h3>
          <p className="mt-2 text-sm text-stone-500">
            Selecione um espaço de trabalho para usar os fluxogramas.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col overflow-hidden p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-stone-900">Fluxogramas</h3>
          <p className="text-sm text-stone-500">
            Crie, organize e salve seus fluxos por pasta.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <Button
              onClick={createFlow}
              className="rounded-2xl bg-stone-950 text-white hover:bg-stone-800"
            >
              <GitBranch className="mr-2 h-4 w-4" />
              Novo fluxograma
            </Button>
          )}

          {canEdit && (
            <Button
              onClick={addNode}
              disabled={!activeFlowId}
              className="rounded-2xl bg-stone-950 text-white hover:bg-stone-800 disabled:opacity-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo bloco
            </Button>
          )}

          {canEdit && (
            <Button
              onClick={saveFlow}
              disabled={!activeFlowId}
              variant="outline"
              className="rounded-2xl border-stone-200"
            >
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </Button>
          )}

          {canEdit && (
            <Button
              onClick={() => renameFlow(activeFlow)}
              disabled={!activeFlowId}
              variant="outline"
              className="rounded-2xl border-stone-200"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar nome
            </Button>
          )}

          <Button
            onClick={shareFlow}
            disabled={!activeFlowId}
            variant="outline"
            className="rounded-2xl border-stone-200"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Compartilhar
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[320px_1fr]">
        <aside className="flow-sidebar overflow-y-auto rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm">
          <h4 className="mb-3 font-semibold text-stone-900">Pastas</h4>

          {canEdit && (
            <div className="mb-4 grid gap-2">
              <TextInput
                value={newFolderName}
                onChange={(event) => setNewFolderName(event.target.value)}
                placeholder="Nome da nova pasta"
              />

              <Button
                onClick={createFolder}
                className="rounded-2xl bg-stone-950 text-white hover:bg-stone-800"
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                Criar pasta
              </Button>
            </div>
          )}

          {loading ? (
            <p className="rounded-2xl bg-stone-50 p-3 text-sm text-stone-500">
              Carregando fluxogramas...
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className={`flow-list-item rounded-2xl border p-3 ${
                      activeFolderId === folder.id
                        ? "flow-list-item-active"
                        : "bg-stone-50 text-stone-700"
                    }`}
                  >
                    {editingFolderId === folder.id ? (
                      <div className="space-y-2">
                        <input
                          value={folderDraftName}
                          onChange={(event) =>
                            setFolderDraftName(event.target.value)
                          }
                          className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none"
                          autoFocus
                        />

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveFolderName(folder)}
                            className="icon-action"
                            title="Salvar pasta"
                          >
                            <Check className="h-4 w-4" />
                          </button>

                          <button
                            onClick={cancelFolderEdit}
                            className="icon-action"
                            title="Cancelar edição"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setActiveFolderId(folder.id)}
                          className="flex w-full items-center gap-2 text-left text-sm font-medium"
                        >
                          <Folder className="h-4 w-4" />
                          <span className="truncate">{folder.name}</span>
                        </button>

                        {canEdit && (
                          <div className="mt-2 flex items-center gap-2 text-xs opacity-90">
                            <button
                              onClick={() => renameFolder(folder)}
                              className="icon-action"
                              title="Editar pasta"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => deleteFolder(folder)}
                              className="icon-action icon-action-danger"
                              title="Excluir pasta"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}

                {!folders.length && (
                  <p className="rounded-2xl bg-stone-50 p-3 text-sm text-stone-500">
                    Nenhuma pasta criada ainda.
                  </p>
                )}
              </div>

              <h4 className="mb-3 mt-6 font-semibold text-stone-900">
                Fluxogramas da pasta
              </h4>

              <div className="space-y-2">
                {filteredFlows.length ? (
                  filteredFlows.map((flow) => (
                    <div
                      key={flow.id}
                      className={`flow-list-item rounded-2xl border p-3 text-sm ${
                        activeFlowId === flow.id
                          ? "flow-list-item-active"
                          : "bg-stone-50 text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      <button
                        onClick={() => loadFlow(flow)}
                        className="w-full text-left font-medium"
                      >
                        {flow.name}
                      </button>

                      {canEdit && (
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs opacity-90">
                          <button
                            onClick={() => renameFlow(flow)}
                            className="icon-action"
                            title="Editar fluxograma"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => deleteFlow(flow)}
                            className="icon-action icon-action-danger"
                            title="Excluir fluxograma"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                          {folders.length > 1 && (
                            <select
                              value={flow.folderId || ""}
                              onChange={(event) =>
                                moveFlow(flow, event.target.value)
                              }
                              className="h-8 rounded-xl border border-stone-200 bg-white px-2 text-xs outline-none"
                              title="Mover para pasta"
                            >
                              {folders.map((folder) => (
                                <option key={folder.id} value={folder.id}>
                                  {folder.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl bg-stone-50 p-3 text-sm text-stone-500">
                    Nenhum fluxograma nesta pasta.
                  </p>
                )}
              </div>
            </>
          )}
        </aside>

        <div className="flow-canvas-card flex min-h-0 flex-col overflow-hidden rounded-[2rem] border border-stone-200 bg-[#F7F4EF] shadow-sm">
          <div className="flow-canvas-header flex items-center justify-between border-b border-stone-200 bg-white px-5 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                Fluxograma atual
              </p>

              <input
                value={flowName}
                onChange={updateSelectedFlowName}
                disabled={!canEdit || !activeFlowId}
                placeholder="Nenhum fluxograma selecionado"
                className="mt-1 block w-full min-w-[280px] bg-transparent text-lg font-semibold text-stone-900 outline-none disabled:opacity-60"
              />
            </div>

            {activeFlow && (
              <div className="hidden items-center gap-2 rounded-2xl bg-stone-50 px-3 py-2 text-xs text-stone-500 md:flex">
                <MoveRight className="h-4 w-4" />
                {activeFolder?.name || "Sem pasta"}
              </div>
            )}
          </div>

          <div className="flow-canvas min-h-[560px] flex-1">
            {activeFlowId ? (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                proOptions={{ hideAttribution: true }}
              >
                <Background color="#c7c1b7" gap={22} />
                <Controls />
                <MiniMap pannable zoomable />
              </ReactFlow>
            ) : (
              <div className="flex h-full min-h-[560px] items-center justify-center p-6">
                <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white/70 p-8 text-center">
                  <h3 className="text-lg font-semibold text-stone-900">
                    Nenhum fluxograma selecionado
                  </h3>
                  <p className="mt-2 text-sm text-stone-500">
                    Crie uma pasta e um fluxograma para começar.
                  </p>

                  {canEdit && (
                    <Button
                      onClick={createFlow}
                      className="mt-5 rounded-2xl bg-stone-950 text-white hover:bg-stone-800"
                    >
                      <GitBranch className="mr-2 h-4 w-4" />
                      Criar primeiro fluxograma
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
