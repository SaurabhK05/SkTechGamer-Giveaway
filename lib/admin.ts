export function isAdminEmail(email?: string | null) {
  if (!email) return false;

  const configuredEmails = (process.env.ADMIN_EMAIL ?? "")
    .replace(/[\[\]'\"]/g, "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return configuredEmails.includes(email.toLowerCase());
}
