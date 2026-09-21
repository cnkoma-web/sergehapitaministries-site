export class PublicFormError extends Error {
  constructor(message = "Les informations transmises ne sont pas valides.") {
    super(message);
    this.name = "PublicFormError";
  }
}

export function requiredText(formData: FormData, key: string, maxLength: number): string {
  const value = String(formData.get(key) ?? "").trim();
  if (!value || value.length > maxLength) throw new PublicFormError();
  return value;
}

export function optionalText(formData: FormData, key: string, maxLength: number): string | null {
  const value = String(formData.get(key) ?? "").trim();
  if (value.length > maxLength) throw new PublicFormError();
  return value || null;
}

export function validEmail(formData: FormData, key = "email"): string {
  const email = requiredText(formData, key, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new PublicFormError();
  return email;
}

export function allowedValue(formData: FormData, key: string, allowed: readonly string[]): string {
  const value = requiredText(formData, key, 120);
  if (!allowed.includes(value)) throw new PublicFormError();
  return value;
}

export function validDate(formData: FormData, key: string): string {
  const value = requiredText(formData, key, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new PublicFormError();

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new PublicFormError();
  }
  return value;
}
