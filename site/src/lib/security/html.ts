export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function emailSubjectText(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim().slice(0, 160);
}
