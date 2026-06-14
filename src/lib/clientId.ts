const CLIENT_ID_KEY = 'wc26_client_id';
const DISPLAY_NAME_KEY = 'wc26_display_name';
const ADMIN_SECRET_KEY = 'wc26_admin_secret';

export function getClientId(): string {
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

export function getDisplayName(): string {
  return localStorage.getItem(DISPLAY_NAME_KEY) ?? '';
}

export function setDisplayName(name: string) {
  localStorage.setItem(DISPLAY_NAME_KEY, name.trim());
}

export function getAdminSecret(): string | null {
  return sessionStorage.getItem(ADMIN_SECRET_KEY);
}

export function setAdminSecret(secret: string) {
  sessionStorage.setItem(ADMIN_SECRET_KEY, secret);
}

export function clearAdminSecret() {
  sessionStorage.removeItem(ADMIN_SECRET_KEY);
}
