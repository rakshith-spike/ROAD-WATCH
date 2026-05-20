const ROLE_ALIASES = {
  super_aadmin: "super_admin",
  superadmin: "super_admin",
  gov_admin: "government_admin",
  governmentadmin: "government_admin",
};

export function normalizeRole(role) {
  const cleaned = String(role || "").trim().toLowerCase();
  return ROLE_ALIASES[cleaned] || cleaned;
}

export function hasAnyRole(role, allowedRoles) {
  const normalized = normalizeRole(role);
  return allowedRoles.map((item) => normalizeRole(item)).includes(normalized);
}

export function isAdminRole(role) {
  return hasAnyRole(role, ["government_admin", "super_admin"]);
}
