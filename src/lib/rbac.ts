// ─── Role-Based Access Control (single source of truth) ─────────────────────
// Five hierarchical roles. Each role inherits every permission of the roles
// below it: OWNER ⊃ ADMIN ⊃ DEVELOPER ⊃ USER ⊃ INTERN.
//
//   OWNER      – the PI (permanent, immutable, cannot be revoked)
//   ADMIN      – assignable/revocable by the OWNER; runs the lab
//   DEVELOPER  – USER + can manage connectors/integrations
//   USER       – full member functionality, including sharing content
//   INTERN     – limited: own work + read; NO sharing, NO connectors
//
// Enforcement uses `can(role, permission)`. Roles are resolved with
// resolveAccessRole() so the OWNER always comes from code (isOwnerEmail) and can
// never be changed in the DB, while ADMIN/DEVELOPER/USER/INTERN are stored on
// LabMember.accessRole and managed through the admin Roles screen.

import { isOwnerEmail, isAdminEmail } from "@/lib/auth"

export const ACCESS_ROLES = ["OWNER", "ADMIN", "DEVELOPER", "USER", "INTERN"] as const
export type AccessRole = (typeof ACCESS_ROLES)[number]

// Higher rank = more privilege. Used for hierarchy checks and "who can manage whom".
const RANK: Record<AccessRole, number> = {
  INTERN: 0,
  USER: 1,
  DEVELOPER: 2,
  ADMIN: 3,
  OWNER: 4,
}

export type Permission =
  | "view_portal"        // basic authenticated access (all roles)
  | "full_features"      // all member surfaces (papers, datasets, tools, planning, intelligence…)
  | "share_content"      // submit content for the public site / share assets
  | "manage_connectors"  // add/configure integrations & connectors
  | "manage_content"     // edit publications / news / software / CV upload
  | "manage_members"     // add/edit/remove lab members
  | "manage_roles"       // assign/revoke roles (DEVELOPER/USER/INTERN; ADMIN is owner-only)
  | "manage_admins"      // grant/revoke ADMIN, and anything touching the OWNER

// Minimum role required for each permission (hierarchy: anyone at or above passes).
const MIN_ROLE: Record<Permission, AccessRole> = {
  view_portal: "INTERN",
  full_features: "USER",
  share_content: "USER",
  manage_connectors: "DEVELOPER",
  manage_content: "ADMIN",
  manage_members: "ADMIN",
  manage_roles: "ADMIN",
  manage_admins: "OWNER",
}

/** Does `role` grant `permission`? */
export function can(role: AccessRole, permission: Permission): boolean {
  return RANK[role] >= RANK[MIN_ROLE[permission]]
}

/** Is `role` at least `min` in the hierarchy? */
export function roleAtLeast(role: AccessRole, min: AccessRole): boolean {
  return RANK[role] >= RANK[min]
}

/**
 * Resolve the effective access role for a person.
 * - OWNER is always from code (isOwnerEmail) and overrides any stored value.
 * - Otherwise the stored LabMember.accessRole wins (this is what the Roles screen
 *   edits, so demotions/promotions take effect immediately).
 * - If nothing is stored yet, fall back to ADMIN for bootstrap admin emails
 *   (isAdminEmail), else USER.
 */
export function resolveAccessRole(email: string, storedRole?: string | null): AccessRole {
  if (isOwnerEmail(email)) return "OWNER"
  const stored = (storedRole || "").toUpperCase()
  if ((ACCESS_ROLES as readonly string[]).includes(stored) && stored !== "OWNER") {
    return stored as AccessRole
  }
  if (isAdminEmail(email)) return "ADMIN"
  return "USER"
}

/**
 * Can `actor` assign `target` role to someone?
 * - OWNER is never assignable/removable through the UI (permanent).
 * - Only the OWNER may grant or revoke ADMIN.
 * - ADMINs may assign DEVELOPER/USER/INTERN.
 */
export function canAssignRole(actor: AccessRole, target: AccessRole): boolean {
  if (target === "OWNER") return false
  if (target === "ADMIN") return actor === "OWNER"
  return can(actor, "manage_roles")
}

/** Assignable roles for an actor, for building the admin UI dropdown. */
export function assignableRoles(actor: AccessRole): AccessRole[] {
  return (ACCESS_ROLES as readonly AccessRole[]).filter((r) => canAssignRole(actor, r))
}
