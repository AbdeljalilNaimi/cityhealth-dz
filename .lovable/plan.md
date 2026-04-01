

## Authentication Fixes + Build Error Fixes

### Bugs Identified

**Bug 1: Citizen email verification — `emailVerified` stays false after confirmation**

**Root cause**: In `AuthContext.tsx` line 186-193, the `onAuthStateChanged` listener checks `firebaseUser.emailVerified` and signs out the user if false. However, Firebase caches the user token — after email verification in another tab/browser, the cached token still has `emailVerified = false`. The fix in `loginAsCitizen` (line 259-266) calls `signInWithEmailAndPassword` but does NOT call `reload()` on the returned user before checking `emailVerified`. The freshly signed-in user object may still have a stale `emailVerified` value.

**Fix**: Call `await loggedInUser.reload()` before checking `emailVerified` in `loginAsCitizen`. Also update the `onAuthStateChanged` listener to `reload()` before blocking unverified users.

**Bug 2: Provider registration — "Missing or insufficient permissions"**

**Root cause**: The `createProviderFromRegistration` function creates the Firebase Auth account (line 61), then immediately tries to write to Firestore collections (`profiles`, `user_roles`, `users`, `providers`). The Firestore rules for `profiles/{userId}` require `isOwner(userId)`, which checks `request.auth.uid == userId`. However, the newly created user's email is **not verified**, and the `onAuthStateChanged` listener (lines 186-193) signs them out when it detects `emailVerified = false`. This causes a race condition where:
1. `createUserWithEmailAndPassword` triggers `onAuthStateChanged`
2. The listener sees `emailVerified = false` and calls `firebaseSignOut`
3. Subsequent Firestore writes fail with "Missing or insufficient permissions" because `auth.currentUser` is now null

The `isSigningUpRef` guard in `signupAsCitizen` prevents this for citizens, but provider registration uses `providerRegistrationService.ts` which doesn't set this flag.

**Fix**: Add a mechanism to prevent the `onAuthStateChanged` listener from signing out during provider registration. The simplest approach: make `isSigningUpRef` accessible or add a similar guard in the registration service flow.

**Bug 3: Build errors — `NodeJS.Timeout` and `process` not found**

**Root cause**: TypeScript config doesn't include Node types. Multiple files use `NodeJS.Timeout` and `process.env`.

**Fix**: Replace `NodeJS.Timeout` with `ReturnType<typeof setTimeout>` and replace `process.env.NODE_ENV` with `import.meta.env.DEV`.

---

### Changes

**1. `src/contexts/AuthContext.tsx`** — Fix email verification + expose signup guard

- In `loginAsCitizen`: add `await loggedInUser.reload()` before the `emailVerified` check (after line 259)
- In `onAuthStateChanged` listener (line 186): add `await firebaseUser.reload()` before the `emailVerified` check
- Export `isSigningUpRef` setter so provider registration can use it, or convert to a module-level variable with a setter function (`setSigningUp(true/false)`)

**2. `src/services/providerRegistrationService.ts`** — Prevent auth listener interference

- Import the signup guard setter from AuthContext
- Set it to `true` before `createUserWithEmailAndPassword` and `false` after all Firestore writes complete
- This prevents the `onAuthStateChanged` listener from signing out the user mid-registration

**3. `src/components/AnimatedTransition.tsx`** — Fix `NodeJS.Timeout`

- Change `let timer: NodeJS.Timeout` to `let timer: ReturnType<typeof setTimeout>`

**4. `src/components/ErrorBoundary.tsx`** — Fix `process.env`

- Replace `process.env.NODE_ENV === 'development'` with `import.meta.env.DEV`

**5. `src/components/search/SearchMap.tsx`** — Fix `NodeJS.Timeout`

- Replace `NodeJS.Timeout` with `ReturnType<typeof setTimeout>`

**6. `src/components/search/SearchResults.tsx`** — Fix `NodeJS.Timeout`

- Replace `NodeJS.Timeout` with `ReturnType<typeof setTimeout>`

**7. `src/hooks/useRegistrationWizard.ts`** — Fix `NodeJS.Timeout`

- Replace `NodeJS.Timeout` with `ReturnType<typeof setTimeout>`

**8. `src/utils/providerValidation.ts`** — Fix `process` reference

- Replace `process.env` usage with `import.meta.env` equivalent

---

### Summary

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Email verification false | Missing `reload()` before `emailVerified` check | Add `reload()` in `loginAsCitizen` and `onAuthStateChanged` |
| Provider "Missing permissions" | `onAuthStateChanged` signs out unverified user during registration | Guard registration with `isSigningUpRef` flag |
| Build errors (6 files) | Missing Node types in browser project | Replace `NodeJS.Timeout` and `process.env` with browser equivalents |

