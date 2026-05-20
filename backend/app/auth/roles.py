ROLE_ALIASES = {
    "super_aadmin": "super_admin",
    "superadmin": "super_admin",
    "gov_admin": "government_admin",
    "governmentadmin": "government_admin",
}


def normalize_role(role: str | None) -> str:
    if not role:
        return ""
    cleaned = role.strip().lower()
    return ROLE_ALIASES.get(cleaned, cleaned)


def has_required_role(role: str | None, allowed_roles: tuple[str, ...]) -> bool:
    normalized_role = normalize_role(role)
    allowed = {normalize_role(item) for item in allowed_roles}
    return normalized_role in allowed
