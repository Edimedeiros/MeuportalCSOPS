export function canSeeCard(card, user, isOwner) {
  if (!card) return false;
  if (isOwner || !user || user.cardScope !== "own") return true;
  return card.requesterEmail === user.email || card.requester === user.name;
}

export function canAccessWorkspace(workspace, user) {
  if (!workspace || !user) return false;
  if (user.role === "owner") return true;
  if (workspace.ownerEmail && workspace.ownerEmail === user.email) return true;
  return Array.isArray(workspace.memberEmails) && workspace.memberEmails.includes(user.email);
}

export function canAccessMenu(menuId, user, isOwner) {
  if (isOwner) return true;
  return Boolean(user?.menuAccess?.[menuId]);
}

export function canEditAction(action, user, isOwner) {
  if (isOwner) return true;
  if (user?.permission !== "edit") return false;
  return Boolean(user?.editDetails?.[action]);
}

export function avatarFromEmail(email) {
  const raw = (email || "usuario")
    .split("@")[0]
    .replaceAll(".", " ")
    .replaceAll("_", " ")
    .replaceAll("-", " ");
  return (
    raw
      .split(" ")
      .filter(Boolean)
      .map((word) => (word[0] ? word[0].toUpperCase() : ""))
      .slice(0, 2)
      .join("") || "U"
  );
}
