// Small trusted friend group, no real role system — the admin page and its
// destructive actions are just gated to one hardcoded name rather than
// building out a permissions model for a single person.
const ADMIN_USER_NAME = "luke";

export function isAdminUser(name: string): boolean {
  return name.trim().toLowerCase() === ADMIN_USER_NAME;
}
