import { supabase } from "../lib/supabase.js";

const DEFAULT_PHASES = ["A fazer", "Em andamento", "Em validação", "Concluído"];

const DEFAULT_DEPARTMENTS = [
  "Customer Success",
  "Operações",
  "Grandes Contas",
  "Adoção",
  "CS OPS",
];

const DEFAULT_REQUEST_TYPES = [
  { name: "Processos", color: "border-sky-200 bg-sky-50 text-sky-700" },
  { name: "Dados", color: "border-blue-200 bg-blue-50 text-blue-700" },
  { name: "Playbook", color: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { name: "Churn", color: "border-amber-200 bg-amber-50 text-amber-700" },
  { name: "Melhoria", color: "border-red-200 bg-red-50 text-red-700" },
];

const DEFAULT_MENU_ACCESS = {
  work: true,
  dash: true,
  form: false,
  flow: false,
  people: false,
  logs: false,
  settings: false,
};

const DEFAULT_EDIT_PERMISSIONS = {
  createCard: false,
  moveCard: false,
  editCard: false,
  deleteCard: false,
  createPhase: false,
  editPhase: false,
  deletePhase: false,
  formSettings: false,
  flowEdit: false,
  peopleEdit: false,
};

const OWNER_MENU_ACCESS = {
  work: true,
  dash: true,
  form: true,
  flow: true,
  people: true,
  logs: true,
  settings: true,
};

const OWNER_EDIT_PERMISSIONS = {
  createCard: true,
  moveCard: true,
  editCard: true,
  deleteCard: true,
  createPhase: true,
  editPhase: true,
  deletePhase: true,
  formSettings: true,
  flowEdit: true,
  peopleEdit: true,
};

function getInitials(nameOrEmail = "") {
  const clean = String(nameOrEmail || "").trim();

  if (!clean) return "US";

  const name = clean.includes("@") ? clean.split("@")[0] : clean;
  const parts = name
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

function toDateOnly(value) {
  if (!value) return "";

  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function safeJson(value, fallback) {
  if (!value) return fallback;

  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeRole(role) {
  if (role === "owner") return "owner";
  if (role === "editor") return "editor";
  return "viewer";
}

function normalizePermission(role) {
  return role === "editor" || role === "owner" ? "edit" : "view";
}

function buildMemberUser(member, profile) {
  const role = normalizeRole(member.role);
  const email = profile?.email || member.invited_email || "";
  const name =
    profile?.full_name ||
    member.invited_email ||
    email ||
    "Usuário convidado";

  return {
    id: member.user_id || member.id,
    memberId: member.id,
    name,
    email,
    role,
    permission: normalizePermission(role),
    avatar: getInitials(name || email),
    photo: profile?.avatar_url || "",
    cardScope: member.card_scope || "all",
    menuAccess:
      role === "owner"
        ? OWNER_MENU_ACCESS
        : safeJson(member.menu_access, DEFAULT_MENU_ACCESS),
    editDetails:
      role === "owner"
        ? OWNER_EDIT_PERMISSIONS
        : safeJson(member.edit_permissions, DEFAULT_EDIT_PERMISSIONS),
  };
}

function mapCardFromDatabase(card, phasesById, departmentsById, requestTypesById) {
  const requestType = requestTypesById.get(card.request_type_id);
  const department = departmentsById.get(card.department_id);
  const phase = phasesById.get(card.phase_id);

  return {
    id: card.id,
    title: card.title,
    phase: phase?.name || "A fazer",
    phaseId: card.phase_id,
    tag: requestType?.name || "Processos",
    requestTypeId: card.request_type_id,
    owner: "EO",
    requester: card.requester_name || "Não informado",
    requesterEmail: card.requester_email || "",
    department: department?.name || "Não informado",
    departmentId: card.department_id,
    dueDate: card.due_date || "",
    startedAt: toDateOnly(card.created_at),
    finishedAt: toDateOnly(card.completed_at),
    priority: card.priority || "Normal",
    description: card.description || "",
    comments: 0,
    originalForm: card.original_form || null,
    status: card.status || "open",
    position: card.position || 0,
    createdAt: card.created_at,
    updatedAt: card.updated_at,
  };
}

function buildWorkspaceFromDatabase({
  workspace,
  phases,
  cards,
  departments,
  requestTypes,
  ownerName,
}) {
  const phasesById = new Map(phases.map((phase) => [phase.id, phase]));
  const departmentsById = new Map(departments.map((department) => [department.id, department]));
  const requestTypesById = new Map(requestTypes.map((type) => [type.id, type]));

  return {
    id: workspace.id,
    title: workspace.name,
    owner: ownerName || "Usuário",
    description: workspace.description || "Espaço de trabalho",
    board: {
      title: "Meus Trabalhos",
      description: "Todas as tarefas em um só lugar",
      phases: phases
        .slice()
        .sort((a, b) => (a.position || 0) - (b.position || 0))
        .map((phase) => phase.name),
      phaseRecords: phases,
      cards: cards
        .slice()
        .sort((a, b) => (a.position || 0) - (b.position || 0))
        .map((card) =>
          mapCardFromDatabase(card, phasesById, departmentsById, requestTypesById)
        ),
    },
  };
}

async function getCurrentSessionUser() {
  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;

  const user = data?.user;

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  return user;
}

export async function ensureUserProfile(user) {
  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "Usuário";

  const { data: existingProfile, error: selectError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) throw selectError;

  if (existingProfile) {
    return existingProfile;
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      full_name: fullName,
      email: user.email,
      avatar_url: user.user_metadata?.avatar_url || null,
    })
    .select("*")
    .single();

  if (error) throw error;

  return data;
}

async function createDefaultPhases(workspaceId, userId) {
  const payload = DEFAULT_PHASES.map((name, index) => ({
    workspace_id: workspaceId,
    name,
    position: index,
    created_by: userId,
  }));

  const { data, error } = await supabase
    .from("kanban_phases")
    .insert(payload)
    .select("*");

  if (error) throw error;

  return data || [];
}

async function createDefaultDepartments(workspaceId) {
  const payload = DEFAULT_DEPARTMENTS.map((name) => ({
    workspace_id: workspaceId,
    name,
  }));

  const { data, error } = await supabase
    .from("form_departments")
    .insert(payload)
    .select("*");

  if (error) throw error;

  return data || [];
}

async function createDefaultRequestTypes(workspaceId) {
  const payload = DEFAULT_REQUEST_TYPES.map((item) => ({
    workspace_id: workspaceId,
    name: item.name,
    color: item.color,
  }));

  const { data, error } = await supabase
    .from("request_types")
    .insert(payload)
    .select("*");

  if (error) throw error;

  return data || [];
}

async function createOwnerMember(workspaceId, userId) {
  const { data, error } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: workspaceId,
      user_id: userId,
      role: "owner",
      card_scope: "all",
      menu_access: OWNER_MENU_ACCESS,
      edit_permissions: OWNER_EDIT_PERMISSIONS,
    })
    .select("*")
    .single();

  if (error) throw error;

  return data;
}

export async function createAuditLog({
  workspaceId,
  action,
  menu,
  entityType,
  entityId,
  oldValue = null,
  newValue = null,
  detail = "",
  userName = "",
}) {
  const user = await getCurrentSessionUser();

  const { data, error } = await supabase
    .from("audit_logs")
    .insert({
      workspace_id: workspaceId,
      user_id: user.id,
      user_name: userName || user.email,
      action,
      menu,
      entity_type: entityType,
      entity_id: entityId || null,
      old_value: oldValue,
      new_value: newValue,
      detail,
    })
    .select("*")
    .single();

  if (error) throw error;

  return data;
}

export async function ensureInitialWorkspace() {
  const user = await getCurrentSessionUser();
  const profile = await ensureUserProfile(user);

  const { data: existingWorkspaces, error: workspacesError } = await supabase
    .from("workspaces")
    .select("*")
    .order("created_at", { ascending: true });

  if (workspacesError) throw workspacesError;

  if (existingWorkspaces?.length) {
    return {
      user,
      profile,
      workspace: existingWorkspaces[0],
      created: false,
    };
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .insert({
      owner_id: user.id,
      name: "Meu espaço de trabalho",
      description: "Espaço de trabalho",
    })
    .select("*")
    .single();

  if (workspaceError) throw workspaceError;

  await createOwnerMember(workspace.id, user.id);
  await createDefaultPhases(workspace.id, user.id);
  await createDefaultDepartments(workspace.id);
  await createDefaultRequestTypes(workspace.id);

  await createAuditLog({
    workspaceId: workspace.id,
    action: "Workspace criado",
    menu: "Sistema",
    entityType: "workspace",
    entityId: workspace.id,
    newValue: workspace,
    detail: "Workspace inicial criado automaticamente.",
    userName: profile.full_name || user.email,
  });

  return {
    user,
    profile,
    workspace,
    created: true,
  };
}

export async function fetchPortalData() {
  const user = await getCurrentSessionUser();
  const profile = await ensureUserProfile(user);

  await ensureInitialWorkspace();

  const { data: workspaces, error: workspacesError } = await supabase
    .from("workspaces")
    .select("*")
    .order("created_at", { ascending: true });

  if (workspacesError) throw workspacesError;

  const workspaceIds = (workspaces || []).map((workspace) => workspace.id);

  if (!workspaceIds.length) {
    return {
      user,
      profile,
      workspaces: [],
      users: [],
      departments: [],
      serviceTypes: [],
      tags: [],
      logs: [],
    };
  }

  const [
    membersResult,
    phasesResult,
    departmentsResult,
    requestTypesResult,
    cardsResult,
    logsResult,
  ] = await Promise.all([
    supabase.from("workspace_members").select("*").in("workspace_id", workspaceIds),
    supabase
      .from("kanban_phases")
      .select("*")
      .in("workspace_id", workspaceIds)
      .order("position", { ascending: true }),
    supabase
      .from("form_departments")
      .select("*")
      .in("workspace_id", workspaceIds)
      .order("name", { ascending: true }),
    supabase
      .from("request_types")
      .select("*")
      .in("workspace_id", workspaceIds)
      .order("name", { ascending: true }),
    supabase
      .from("cards")
      .select("*")
      .in("workspace_id", workspaceIds)
      .order("position", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase
      .from("audit_logs")
      .select("*")
      .in("workspace_id", workspaceIds)
      .order("created_at", { ascending: false })
      .limit(300),
  ]);

  if (membersResult.error) throw membersResult.error;
  if (phasesResult.error) throw phasesResult.error;
  if (departmentsResult.error) throw departmentsResult.error;
  if (requestTypesResult.error) throw requestTypesResult.error;
  if (cardsResult.error) throw cardsResult.error;
  if (logsResult.error) throw logsResult.error;

  const profileIds = [
    ...new Set(
      (membersResult.data || [])
        .map((member) => member.user_id)
        .filter(Boolean)
    ),
  ];

  let profiles = [];

  if (profileIds.length) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .in("id", profileIds);

    if (error) throw error;

    profiles = data || [];
  }

  const profilesById = new Map(profiles.map((item) => [item.id, item]));

  const allDepartments = departmentsResult.data || [];
  const allRequestTypes = requestTypesResult.data || [];
  const allPhases = phasesResult.data || [];
  const allCards = cardsResult.data || [];

  const mappedWorkspaces = (workspaces || []).map((workspace) =>
    buildWorkspaceFromDatabase({
      workspace,
      ownerName: profile.full_name || user.email,
      phases: allPhases.filter((phase) => phase.workspace_id === workspace.id),
      departments: allDepartments.filter(
        (department) => department.workspace_id === workspace.id
      ),
      requestTypes: allRequestTypes.filter(
        (type) => type.workspace_id === workspace.id
      ),
      cards: allCards.filter((card) => card.workspace_id === workspace.id),
    })
  );

  const mappedUsers = (membersResult.data || []).map((member) =>
    buildMemberUser(member, profilesById.get(member.user_id))
  );

  const mappedLogs = (logsResult.data || []).map((log) => ({
    id: log.id,
    date: new Date(log.created_at).toLocaleString("pt-BR"),
    action: log.action,
    menu: log.menu || "",
    user: log.user_name || "",
    detail: log.detail || "",
    entityType: log.entity_type || "",
    entityId: log.entity_id || "",
  }));

  return {
    user,
    profile,
    workspaces: mappedWorkspaces,
    users: mappedUsers,
    departments: allDepartments.map((department) => department.name),
    serviceTypes: allRequestTypes.map((type) => type.name),
    tags: allRequestTypes.map((type) => ({
      id: type.id,
      name: type.name,
      color: type.color || "border-stone-200 bg-stone-50 text-stone-700",
    })),
    logs: mappedLogs,
  };
}

export async function createWorkspace({ name, description, userName }) {
  const user = await getCurrentSessionUser();

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .insert({
      owner_id: user.id,
      name,
      description: description || "Espaço de trabalho",
    })
    .select("*")
    .single();

  if (error) throw error;

  await createOwnerMember(workspace.id, user.id);
  await createDefaultPhases(workspace.id, user.id);
  await createDefaultDepartments(workspace.id);
  await createDefaultRequestTypes(workspace.id);

  await createAuditLog({
    workspaceId: workspace.id,
    action: "Workspace criado",
    menu: "Espaços",
    entityType: "workspace",
    entityId: workspace.id,
    newValue: workspace,
    detail: `Workspace criado: ${workspace.name}`,
    userName,
  });

  return workspace;
}

export async function updateWorkspaceName({ workspaceId, name, oldWorkspace, userName }) {
  const { data, error } = await supabase
    .from("workspaces")
    .update({ name })
    .eq("id", workspaceId)
    .select("*")
    .single();

  if (error) throw error;

  await createAuditLog({
    workspaceId,
    action: "Workspace editado",
    menu: "Espaços",
    entityType: "workspace",
    entityId: workspaceId,
    oldValue: oldWorkspace || null,
    newValue: data,
    detail: `Workspace renomeado para: ${name}`,
    userName,
  });

  return data;
}

export async function deleteWorkspaceById({ workspaceId, oldWorkspace, userName }) {
  await createAuditLog({
    workspaceId,
    action: "Workspace excluído",
    menu: "Espaços",
    entityType: "workspace",
    entityId: workspaceId,
    oldValue: oldWorkspace || null,
    detail: `Workspace excluído: ${oldWorkspace?.title || oldWorkspace?.name || workspaceId}`,
    userName,
  });

  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId);

  if (error) throw error;

  return true;
}

export async function createPhase({ workspaceId, name, position, userName }) {
  const user = await getCurrentSessionUser();

  const { data, error } = await supabase
    .from("kanban_phases")
    .insert({
      workspace_id: workspaceId,
      name,
      position: position || 0,
      created_by: user.id,
    })
    .select("*")
    .single();

  if (error) throw error;

  await createAuditLog({
    workspaceId,
    action: "Fase criada",
    menu: "Meus trabalhos",
    entityType: "kanban_phase",
    entityId: data.id,
    newValue: data,
    detail: `Fase criada: ${name}`,
    userName,
  });

  return data;
}

export async function createCard({ workspaceId, phaseId, card, userName }) {
  const user = await getCurrentSessionUser();

  const { data: requestType } = await supabase
    .from("request_types")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("name", card.tag || "Processos")
    .maybeSingle();

  const { data: department } = await supabase
    .from("form_departments")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("name", card.department || "CS OPS")
    .maybeSingle();

  const { data, error } = await supabase
    .from("cards")
    .insert({
      workspace_id: workspaceId,
      phase_id: phaseId,
      title: card.title,
      description: card.description || "",
      request_type_id: requestType?.id || null,
      department_id: department?.id || null,
      priority: card.priority || "Normal",
      requester_name: card.requester || "",
      requester_email: card.requesterEmail || "",
      due_date: card.dueDate || null,
      completed_at: card.phase === "Concluído" ? new Date().toISOString() : null,
      status: card.phase === "Concluído" ? "completed" : "open",
      original_form: card.originalForm || null,
      created_by: user.id,
      position: card.position || 0,
    })
    .select("*")
    .single();

  if (error) throw error;

  await createAuditLog({
    workspaceId,
    action: "Card criado",
    menu: "Meus trabalhos",
    entityType: "card",
    entityId: data.id,
    newValue: data,
    detail: `Card criado: ${card.title}`,
    userName,
  });

  return data;
}

export async function updateCard({ workspaceId, cardId, card, oldCard, phases, userName }) {
  const phase = phases.find((item) => item.name === card.phase || item.id === card.phaseId);

  const { data: requestType } = await supabase
    .from("request_types")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("name", card.tag || "Processos")
    .maybeSingle();

  const { data: department } = await supabase
    .from("form_departments")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("name", card.department || "CS OPS")
    .maybeSingle();

  const isCompleted = card.phase === "Concluído";

  const { data, error } = await supabase
    .from("cards")
    .update({
      phase_id: phase?.id || card.phaseId || null,
      title: card.title,
      description: card.description || "",
      request_type_id: requestType?.id || null,
      department_id: department?.id || null,
      priority: card.priority || "Normal",
      requester_name: card.requester || "",
      requester_email: card.requesterEmail || "",
      due_date: card.dueDate || null,
      completed_at: isCompleted
        ? card.finishedAt
          ? new Date(card.finishedAt).toISOString()
          : new Date().toISOString()
        : null,
      status: isCompleted ? "completed" : "open",
      original_form: card.originalForm || null,
      position: card.position || 0,
    })
    .eq("id", cardId)
    .select("*")
    .single();

  if (error) throw error;

  await createAuditLog({
    workspaceId,
    action: "Card editado",
    menu: "Meus trabalhos",
    entityType: "card",
    entityId: cardId,
    oldValue: oldCard || null,
    newValue: data,
    detail: `Card editado: ${card.title}`,
    userName,
  });

  return data;
}

export async function moveCardToPhase({
  workspaceId,
  cardId,
  phaseId,
  phaseName,
  oldCard,
  userName,
}) {
  const isCompleted = phaseName === "Concluído";

  const { data, error } = await supabase
    .from("cards")
    .update({
      phase_id: phaseId,
      completed_at: isCompleted ? new Date().toISOString() : null,
      status: isCompleted ? "completed" : "open",
    })
    .eq("id", cardId)
    .select("*")
    .single();

  if (error) throw error;

  await createAuditLog({
    workspaceId,
    action: "Card movido",
    menu: "Meus trabalhos",
    entityType: "card",
    entityId: cardId,
    oldValue: oldCard || null,
    newValue: data,
    detail: `Card movido para ${phaseName}`,
    userName,
  });

  return data;
}

export async function createRequestFromForm({
  workspaceId,
  phaseId,
  form,
  userName,
}) {
  const card = {
    title: form.title,
    description: form.description,
    tag: form.tag,
    department: form.department,
    priority: form.priority,
    requester: form.requester,
    requesterEmail: form.requesterEmail,
    dueDate: form.dueDate,
    originalForm: form,
  };

  const data = await createCard({
    workspaceId,
    phaseId,
    card,
    userName,
  });

  await createAuditLog({
    workspaceId,
    action: "Pedido criado",
    menu: "Formulário",
    entityType: "card",
    entityId: data.id,
    newValue: data,
    detail: `Solicitação aberta por ${form.requester}: ${form.title}`,
    userName,
  });

  return data;
}

export async function refreshCurrentPortalData() {
  return fetchPortalData();
}


// ─── Configurações reais do formulário ───────────────────────────────────────────
export async function createDepartment({ workspaceId, name, userName }) {
  const cleanName = String(name || "").trim();
  if (!cleanName) { throw new Error("Informe o nome do setor."); }
  const { data, error } = await supabase.from("form_departments").insert({ workspace_id: workspaceId, name: cleanName }).select("*").single();
  if (error) throw error;
  await createAuditLog({ workspaceId, action: "Setor criado", menu: "Formulário", entityType: "form_department", entityId: data.id, newValue: data, detail: `Setor criado: ${cleanName}`, userName });
  return data;
}

export async function updateDepartment({ workspaceId, departmentName, nextName, userName }) {
  const cleanNextName = String(nextName || "").trim();
  if (!cleanNextName) { throw new Error("Informe o novo nome do setor."); }
  const { data: current, error: findError } = await supabase.from("form_departments").select("*").eq("workspace_id", workspaceId).eq("name", departmentName).maybeSingle();
  if (findError) throw findError;
  if (!current) { throw new Error("Setor não encontrado."); }
  const { data, error } = await supabase.from("form_departments").update({ name: cleanNextName }).eq("id", current.id).select("*").single();
  if (error) throw error;
  await createAuditLog({ workspaceId, action: "Setor editado", menu: "Formulário", entityType: "form_department", entityId: data.id, oldValue: current, newValue: data, detail: `Setor editado: ${departmentName} → ${cleanNextName}`, userName });
  return data;
}

export async function deleteDepartment({ workspaceId, departmentName, userName }) {
  const { data: current, error: findError } = await supabase.from("form_departments").select("*").eq("workspace_id", workspaceId).eq("name", departmentName).maybeSingle();
  if (findError) throw findError;
  if (!current) { throw new Error("Setor não encontrado."); }
  await createAuditLog({ workspaceId, action: "Setor excluído", menu: "Formulário", entityType: "form_department", entityId: current.id, oldValue: current, detail: `Setor excluído: ${departmentName}`, userName });
  const { error } = await supabase.from("form_departments").delete().eq("id", current.id);
  if (error) throw error;
  return true;
}

export async function createRequestType({ workspaceId, name, color, userName }) {
  const cleanName = String(name || "").trim();
  if (!cleanName) { throw new Error("Informe o nome do tipo de pedido."); }
  const { data, error } = await supabase.from("request_types").insert({ workspace_id: workspaceId, name: cleanName, color: color || "border-stone-200 bg-stone-50 text-stone-700" }).select("*").single();
  if (error) throw error;
  await createAuditLog({ workspaceId, action: "Tipo de pedido criado", menu: "Formulário", entityType: "request_type", entityId: data.id, newValue: data, detail: `Tipo de pedido criado: ${cleanName}`, userName });
  return data;
}

export async function updateRequestType({ workspaceId, requestTypeName, nextName, userName }) {
  const cleanNextName = String(nextName || "").trim();
  if (!cleanNextName) { throw new Error("Informe o novo nome do tipo de pedido."); }
  const { data: current, error: findError } = await supabase.from("request_types").select("*").eq("workspace_id", workspaceId).eq("name", requestTypeName).maybeSingle();
  if (findError) throw findError;
  if (!current) { throw new Error("Tipo de pedido não encontrado."); }
  const { data, error } = await supabase.from("request_types").update({ name: cleanNextName }).eq("id", current.id).select("*").single();
  if (error) throw error;
  await createAuditLog({ workspaceId, action: "Tipo de pedido editado", menu: "Formulário", entityType: "request_type", entityId: data.id, oldValue: current, newValue: data, detail: `Tipo de pedido editado: ${requestTypeName} → ${cleanNextName}`, userName });
  return data;
}

export async function deleteRequestType({ workspaceId, requestTypeName, userName }) {
  const { data: current, error: findError } = await supabase.from("request_types").select("*").eq("workspace_id", workspaceId).eq("name", requestTypeName).maybeSingle();
  if (findError) throw findError;
  if (!current) { throw new Error("Tipo de pedido não encontrado."); }
  await createAuditLog({ workspaceId, action: "Tipo de pedido excluído", menu: "Formulário", entityType: "request_type", entityId: current.id, oldValue: current, detail: `Tipo de pedido excluído: ${requestTypeName}`, userName });
  const { error } = await supabase.from("request_types").delete().eq("id", current.id);
  if (error) throw error;
  return true;
}


// ─── Pessoas e permissões reais ──────────────────────────────────────────
const MEMBER_DEFAULT_MENU_ACCESS = { work: true, dash: true, form: false, flow: false, people: false, logs: false, settings: false };
const MEMBER_DEFAULT_EDIT_PERMISSIONS = { createCard: false, moveCard: false, editCard: false, deleteCard: false, createPhase: false, editPhase: false, deletePhase: false, formSettings: false, flowEdit: false, peopleEdit: false };

function normalizeMemberRole(permission) {
  return permission === "edit" ? "editor" : "viewer";
}

export async function inviteWorkspaceMember({ workspaceId, email, permission = "view", userName }) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) throw new Error("Informe um e-mail válido.");
  const role = normalizeMemberRole(permission);

  const { data, error } = await supabase.rpc("invite_workspace_member_safe", {
    p_workspace_id: workspaceId,
    p_email: cleanEmail,
    p_role: role,
  });
  if (error) throw error;

  await createAuditLog({ workspaceId, action: "Pessoa criada", menu: "Pessoas", entityType: "workspace_member", entityId: data?.id || null, newValue: data, detail: `Pessoa adicionada: ${cleanEmail}`, userName });
  return data;
}

export async function updateWorkspaceMember({ workspaceId, memberId, changes, oldMember, userName }) {
  const payload = {};
  if (changes.permission) payload.role = normalizeMemberRole(changes.permission);
  if (changes.role) payload.role = changes.role;
  if (changes.cardScope) payload.card_scope = changes.cardScope;
  if (changes.menuAccess) payload.menu_access = changes.menuAccess;
  if (changes.editDetails) payload.edit_permissions = changes.editDetails;

  if (!Object.keys(payload).length) return null;

  const { data, error } = await supabase.rpc("update_workspace_member_safe", {
    p_workspace_id: workspaceId,
    p_member_id: memberId,
    p_role: payload.role || null,
    p_card_scope: payload.card_scope || null,
    p_menu_access: payload.menu_access ? JSON.stringify(payload.menu_access) : null,
    p_edit_permissions: payload.edit_permissions ? JSON.stringify(payload.edit_permissions) : null,
  });
  if (error) throw error;

  await createAuditLog({ workspaceId, action: "Pessoa editada", menu: "Pessoas", entityType: "workspace_member", entityId: memberId, oldValue: oldMember || null, newValue: data, detail: "Permissões da pessoa foram atualizadas.", userName });
  return data;
}

export async function updateWorkspaceMemberNestedPermission({ workspaceId, memberId, field, key, value, oldMember, userName }) {
  if (!["menuAccess", "editDetails"].includes(field)) throw new Error("Campo de permissão inválido.");
  const currentValue = field === "menuAccess" ? oldMember?.menuAccess || {} : oldMember?.editDetails || {};
  const nextValue = { ...currentValue, [key]: value };
  const isMenu = field === "menuAccess";

  const { data, error } = await supabase.rpc("update_workspace_member_safe", {
    p_workspace_id: workspaceId,
    p_member_id: memberId,
    p_role: null,
    p_card_scope: null,
    p_menu_access: isMenu ? JSON.stringify(nextValue) : null,
    p_edit_permissions: !isMenu ? JSON.stringify(nextValue) : null,
  });
  if (error) throw error;

  await createAuditLog({ workspaceId, action: "Permissão editada", menu: "Pessoas", entityType: "workspace_member", entityId: memberId, oldValue: oldMember || null, newValue: data, detail: `${field}.${key} = ${value}`, userName });
  return data;
}

export async function removeWorkspaceMember({ workspaceId, memberId, oldMember, userName }) {
  if (oldMember?.role === "owner") throw new Error("O dono do espaço não pode ser removido.");

  await createAuditLog({ workspaceId, action: "Pessoa excluída", menu: "Pessoas", entityType: "workspace_member", entityId: memberId, oldValue: oldMember || null, detail: `Pessoa removida: ${oldMember?.email || memberId}`, userName });

  const { error } = await supabase.rpc("remove_workspace_member_safe", {
    p_workspace_id: workspaceId,
    p_member_id: memberId,
  });
  if (error) throw error;
  return true;
}


// ─── Fluxogramas reais ──────────────────────────────────────────────────────

const DEFAULT_FLOW_NODES = [
  {
    id: "inicio",
    type: "input",
    position: { x: 120, y: 120 },
    data: { label: "Início" },
  },
  {
    id: "atividade",
    position: { x: 360, y: 120 },
    data: { label: "Nova atividade" },
  },
  {
    id: "fim",
    type: "output",
    position: { x: 620, y: 120 },
    data: { label: "Fim" },
  },
];

const DEFAULT_FLOW_EDGES = [
  {
    id: "inicio-atividade",
    source: "inicio",
    target: "atividade",
  },
  {
    id: "atividade-fim",
    source: "atividade",
    target: "fim",
  },
];

function cleanFlowName(value, fallback = "Novo fluxograma") {
  const clean = String(value || "").trim();
  return clean || fallback;
}

function mapFlowFolderFromDatabase(folder) {
  return {
    id: folder.id,
    workspaceId: folder.workspace_id,
    name: folder.name,
    createdBy: folder.created_by,
    createdAt: folder.created_at,
    updatedAt: folder.updated_at,
  };
}

function mapFlowchartFromDatabase(flowchart) {
  return {
    id: flowchart.id,
    workspaceId: flowchart.workspace_id,
    folderId: flowchart.folder_id,
    name: flowchart.name,
    nodes: Array.isArray(flowchart.nodes) ? flowchart.nodes : [],
    edges: Array.isArray(flowchart.edges) ? flowchart.edges : [],
    createdBy: flowchart.created_by,
    createdAt: flowchart.created_at,
    updatedAt: flowchart.updated_at,
  };
}

export async function fetchFlowData({ workspaceId }) {
  if (!workspaceId) {
    return {
      folders: [],
      flowcharts: [],
    };
  }

  const [foldersResult, flowchartsResult] = await Promise.all([
    supabase
      .from("flow_folders")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true }),

    supabase
      .from("flowcharts")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true }),
  ]);

  if (foldersResult.error) throw foldersResult.error;
  if (flowchartsResult.error) throw flowchartsResult.error;

  return {
    folders: (foldersResult.data || []).map(mapFlowFolderFromDatabase),
    flowcharts: (flowchartsResult.data || []).map(mapFlowchartFromDatabase),
  };
}

export async function createFlowFolder({ workspaceId, name, userName }) {
  const user = await getCurrentSessionUser();
  const cleanName = cleanFlowName(name, "Nova pasta");

  const { data, error } = await supabase
    .from("flow_folders")
    .insert({
      workspace_id: workspaceId,
      name: cleanName,
      created_by: user.id,
    })
    .select("*")
    .single();

  if (error) throw error;

  await createAuditLog({
    workspaceId,
    action: "Pasta de fluxograma criada",
    menu: "Fluxogramas",
    entityType: "flow_folder",
    entityId: data.id,
    newValue: data,
    detail: `Pasta criada: ${cleanName}`,
    userName,
  });

  return mapFlowFolderFromDatabase(data);
}

export async function updateFlowFolder({ workspaceId, folderId, name, oldFolder, userName }) {
  const cleanName = cleanFlowName(name, "Pasta sem nome");

  const { data, error } = await supabase
    .from("flow_folders")
    .update({
      name: cleanName,
    })
    .eq("id", folderId)
    .eq("workspace_id", workspaceId)
    .select("*")
    .single();

  if (error) throw error;

  await createAuditLog({
    workspaceId,
    action: "Pasta de fluxograma editada",
    menu: "Fluxogramas",
    entityType: "flow_folder",
    entityId: folderId,
    oldValue: oldFolder || null,
    newValue: data,
    detail: `Pasta editada: ${cleanName}`,
    userName,
  });

  return mapFlowFolderFromDatabase(data);
}

export async function deleteFlowFolder({ workspaceId, folderId, oldFolder, userName }) {
  await createAuditLog({
    workspaceId,
    action: "Pasta de fluxograma excluída",
    menu: "Fluxogramas",
    entityType: "flow_folder",
    entityId: folderId,
    oldValue: oldFolder || null,
    detail: `Pasta excluída: ${oldFolder?.name || folderId}`,
    userName,
  });

  const { error } = await supabase
    .from("flow_folders")
    .delete()
    .eq("id", folderId)
    .eq("workspace_id", workspaceId);

  if (error) throw error;

  return true;
}

export async function createFlowchart({
  workspaceId,
  folderId = null,
  name,
  nodes = DEFAULT_FLOW_NODES,
  edges = DEFAULT_FLOW_EDGES,
  userName,
}) {
  const user = await getCurrentSessionUser();
  const cleanName = cleanFlowName(name, "Novo fluxograma");

  const { data, error } = await supabase
    .from("flowcharts")
    .insert({
      workspace_id: workspaceId,
      folder_id: folderId || null,
      name: cleanName,
      nodes,
      edges,
      created_by: user.id,
    })
    .select("*")
    .single();

  if (error) throw error;

  await createAuditLog({
    workspaceId,
    action: "Fluxograma criado",
    menu: "Fluxogramas",
    entityType: "flowchart",
    entityId: data.id,
    newValue: data,
    detail: `Fluxograma criado: ${cleanName}`,
    userName,
  });

  return mapFlowchartFromDatabase(data);
}

export async function updateFlowchartName({
  workspaceId,
  flowchartId,
  name,
  oldFlowchart,
  userName,
}) {
  const cleanName = cleanFlowName(name, "Fluxograma sem nome");

  const { data, error } = await supabase
    .from("flowcharts")
    .update({
      name: cleanName,
    })
    .eq("id", flowchartId)
    .eq("workspace_id", workspaceId)
    .select("*")
    .single();

  if (error) throw error;

  await createAuditLog({
    workspaceId,
    action: "Fluxograma editado",
    menu: "Fluxogramas",
    entityType: "flowchart",
    entityId: flowchartId,
    oldValue: oldFlowchart || null,
    newValue: data,
    detail: `Fluxograma renomeado para: ${cleanName}`,
    userName,
  });

  return mapFlowchartFromDatabase(data);
}

export async function moveFlowchartToFolder({
  workspaceId,
  flowchartId,
  folderId,
  oldFlowchart,
  userName,
}) {
  const { data, error } = await supabase
    .from("flowcharts")
    .update({
      folder_id: folderId || null,
    })
    .eq("id", flowchartId)
    .eq("workspace_id", workspaceId)
    .select("*")
    .single();

  if (error) throw error;

  await createAuditLog({
    workspaceId,
    action: "Fluxograma movido",
    menu: "Fluxogramas",
    entityType: "flowchart",
    entityId: flowchartId,
    oldValue: oldFlowchart || null,
    newValue: data,
    detail: "Fluxograma movido para outra pasta.",
    userName,
  });

  return mapFlowchartFromDatabase(data);
}

export async function saveFlowchartData({
  workspaceId,
  flowchartId,
  nodes = [],
  edges = [],
  oldFlowchart,
  userName,
}) {
  const safeNodes = Array.isArray(nodes) ? nodes : [];
  const safeEdges = Array.isArray(edges) ? edges : [];

  const { data, error } = await supabase
    .from("flowcharts")
    .update({
      nodes: safeNodes,
      edges: safeEdges,
    })
    .eq("id", flowchartId)
    .eq("workspace_id", workspaceId)
    .select("*")
    .single();

  if (error) throw error;

  await createAuditLog({
    workspaceId,
    action: "Fluxograma salvo",
    menu: "Fluxogramas",
    entityType: "flowchart",
    entityId: flowchartId,
    oldValue: oldFlowchart || null,
    newValue: {
      id: data.id,
      name: data.name,
      nodesCount: safeNodes.length,
      edgesCount: safeEdges.length,
    },
    detail: `Fluxograma salvo: ${data.name}`,
    userName,
  });

  return mapFlowchartFromDatabase(data);
}

export async function deleteFlowchart({
  workspaceId,
  flowchartId,
  oldFlowchart,
  userName,
}) {
  await createAuditLog({
    workspaceId,
    action: "Fluxograma excluído",
    menu: "Fluxogramas",
    entityType: "flowchart",
    entityId: flowchartId,
    oldValue: oldFlowchart || null,
    detail: `Fluxograma excluído: ${oldFlowchart?.name || flowchartId}`,
    userName,
  });

  const { error } = await supabase
    .from("flowcharts")
    .delete()
    .eq("id", flowchartId)
    .eq("workspace_id", workspaceId);

  if (error) throw error;

  return true;
}

// ─── Formulário público ──────────────────────────────────────────────────────

export async function fetchPublicRequestForm(slug = "cs-ops") {
  const { data, error } = await supabase.rpc("get_public_request_form", {
    p_slug: slug,
  });

  if (error) throw error;

  return {
    workspaceId: data?.workspaceId || null,
    workspaceName: data?.workspaceName || "Portal CS OPS",
    departments: Array.isArray(data?.departments) ? data.departments : [],
    serviceTypes: Array.isArray(data?.requestTypes) ? data.requestTypes : [],
    phases: Array.isArray(data?.phases) ? data.phases : ["A fazer"],
  };
}

export async function submitPublicRequestForm(slug = "cs-ops", form) {
  const { data, error } = await supabase.rpc("submit_public_request", {
    p_slug: slug,
    p_title: form.title,
    p_description: form.description,
    p_requester_name: form.requester,
    p_requester_email: form.requesterEmail,
    p_department: form.department,
    p_request_type: form.tag,
    p_priority: form.priority,
    p_due_date: form.dueDate || null,
    p_phase: form.phase || "A fazer",
  });

  if (error) throw error;

  return data;
}

// ─── Formulário público ──────────────────────────────────────────────────────

export async function fetchPublicRequestForm(slug = "cs-ops") {
  const { data, error } = await supabase.rpc("get_public_request_form", {
    p_slug: slug,
  });

  if (error) throw error;

  return {
    workspaceId: data?.workspaceId || null,
    workspaceName: data?.workspaceName || "Portal CS OPS",
    departments: Array.isArray(data?.departments) ? data.departments : [],
    serviceTypes: Array.isArray(data?.requestTypes) ? data.requestTypes : [],
    phases: Array.isArray(data?.phases) ? data.phases : ["A fazer"],
  };
}

export async function submitPublicRequestForm(slug = "cs-ops", form) {
  const { data, error } = await supabase.rpc("submit_public_request", {
    p_slug: slug,
    p_title: form.title,
    p_description: form.description,
    p_requester_name: form.requester,
    p_requester_email: form.requesterEmail,
    p_department: form.department,
    p_request_type: form.tag,
    p_priority: form.priority,
    p_due_date: form.dueDate || null,
    p_phase: form.phase || "A fazer",
  });

  if (error) throw error;

  return data;
}
