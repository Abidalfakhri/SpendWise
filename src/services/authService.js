const KEY = 'spendwise-user';

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeUser(user) {
  localStorage.setItem(KEY, JSON.stringify(user));
}

export async function loginDummy(username) {
  await new Promise((r) => setTimeout(r, 400));
  const user = { name: username || 'Tamu', createdAt: Date.now() };
  storeUser(user);
  return user;
}

export async function registerDummy(username) {
  await new Promise((r) => setTimeout(r, 600));
  const user = { name: username || 'Pengguna Baru', createdAt: Date.now(), role: 'user' };
  storeUser(user);
  return user;
}

export function logoutDummy() {
  localStorage.removeItem(KEY);
}