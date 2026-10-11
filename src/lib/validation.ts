export function cleanText(value: unknown, max = 1000) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/[\u0000-\u001F\u007F]/g, "").slice(0, max);
}
export function hasProfanity(text: string) {
  // Basic starter filter; replace with a moderation service for production.
  return /\b(fuck|shit|bitch|cunt|nigger)\b/i.test(text);
}
export function validHttpUrl(value: string) {
  try { const u = new URL(value); return u.protocol === "https:" || u.protocol === "http:"; } catch { return false; }
}
