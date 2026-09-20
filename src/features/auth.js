const listeners = new Set()

let currentSession = null

export function initAuth(supabase) {
  supabase.auth.getSession().then(({ data }) => {
    currentSession = data.session
    notify()
  })

  supabase.auth.onAuthStateChange((_event, session) => {
    currentSession = session
    notify()
  })

  return {
    signInWithGoogle: () =>
      supabase.auth.signInWithOAuth({ provider: 'google' }),
    signOut: () => supabase.auth.signOut(),
  }
}

function notify() {
  for (const fn of listeners) fn(currentSession)
}

export function onAuthChange(fn) {
  listeners.add(fn)
  fn(currentSession)
  return () => listeners.delete(fn)
}

export function getSession() {
  return currentSession
}

export function isSignedIn() {
  return currentSession != null
}

export function requireSignIn(actions) {
  if (isSignedIn()) return true
  actions.promptSignIn()
  return false
}
