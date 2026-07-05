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
  // Anyone above INTERN may assign/approve people into roles strictly below their own
  // (owner→admin, admin→developer, developer→user, user→intern). Interns cannot invite.
  manage_roles: "USER",
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
 * Can `actor` assign the `target` role to someone?
 * Cascading rule: an actor may grant only roles STRICTLY BELOW their own
 * (owner→admin-or-below, admin→developer-or-below, developer→user-or-below,
 * user→intern only, intern→nothing). OWNER is permanent and never assignable.
 */
export function canAssignRole(actor: AccessRole, target: AccessRole): boolean {
  if (target === "OWNER") return false
  return RANK[actor] > RANK[target]
}

/**
 * Can `actor` manage (change/approve) a person who currently holds `targetCurrent`?
 * You can only manage people strictly below you — so an admin can't touch another
 * admin or the owner, a developer can't touch an admin, etc.
 */
export function canManageMemberAt(actor: AccessRole, targetCurrent: AccessRole): boolean {
  return RANK[actor] > RANK[targetCurrent]
}

/** Assignable roles for an actor, for building the admin UI dropdown. */
export function assignableRoles(actor: AccessRole): AccessRole[] {
  return (ACCESS_ROLES as readonly AccessRole[]).filter((r) => canAssignRole(actor, r))
}
