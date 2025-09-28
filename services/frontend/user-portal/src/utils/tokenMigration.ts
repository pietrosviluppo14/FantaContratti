/**
 * Token Migration Utility
 * Migrates from old 'auth_token' key to new 'authToken' key
 * for localStorage token consistency
 */

export const migrateAuthToken = (): void => {
  // Check if old token exists
  const oldToken = localStorage.getItem('auth_token')
  const newToken = localStorage.getItem('authToken')
  
  // If old token exists but new one doesn't, migrate it
  if (oldToken && !newToken) {
    localStorage.setItem('authToken', oldToken)
    localStorage.removeItem('auth_token')
    console.log('✅ Auth token migrated from auth_token to authToken')
  }
  
  // If both exist, prefer the new one and remove the old
  if (oldToken && newToken) {
    localStorage.removeItem('auth_token')
    console.log('✅ Removed duplicate auth_token, keeping authToken')
  }
}

export const clearAllAuthTokens = (): void => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user')
  console.log('✅ All auth tokens cleared')
}