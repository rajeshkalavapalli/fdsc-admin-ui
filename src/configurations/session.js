// FDSC admin session, kept in localStorage under its own keys.
const TOKEN_KEY = 'fdscAdminToken'
const EXPIRES_KEY = 'fdscAdminExpiresAt'
const ADMIN_KEY = 'fdscAdmin'

const read = (key) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export const getToken = () => {
  const token = read(TOKEN_KEY)
  const expiresAt = Date.parse(read(EXPIRES_KEY) || '')
  if (!token || (expiresAt && expiresAt <= Date.now())) return null
  return token
}

export const isSignedIn = () => Boolean(getToken())

export const getAdmin = () => {
  try {
    return JSON.parse(read(ADMIN_KEY) || 'null')
  } catch {
    return null
  }
}

export const saveSession = ({ token, expiresAt, admin }) => {
  try {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(EXPIRES_KEY, expiresAt)
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin))
  } catch {
    /* storage blocked: the session lasts only for this page */
  }
}

export const clearSession = () => {
  try {
    ;[TOKEN_KEY, EXPIRES_KEY, ADMIN_KEY].forEach((key) => localStorage.removeItem(key))
  } catch {
    /* ignore */
  }
}
