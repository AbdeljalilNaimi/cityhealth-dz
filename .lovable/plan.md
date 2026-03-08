

## Plan: Admin Dashboard Functional Verification

### Analysis

The admin dashboard at `/admin/dashboard` has **12 tabs** to verify, all powered by Firebase/Firestore for data. The login uses Firebase Auth with the credentials `admin@test.com | Admin123!`.

### Tabs to Test (in order)

1. **Login Flow** -- Navigate to `/admin/login`, enter credentials, verify redirect to `/admin/dashboard`
2. **Overview (Tableau de bord)** -- Verify stats cards load (total providers, pending, verified, users), quick actions work, recent audit logs display
3. **Inscriptions** -- Verify pending providers table renders, search filter works, approve/reject buttons function
4. **Verifications** -- `VerificationQueue` component loads and displays provider verification queue
5. **Annonces (Ads)** -- `AdsModeration` + `AdminNotificationsPanel` render correctly
6. **Utilisateurs** -- `UserManagement` loads citizens and admin lists from Firestore
7. **Analytiques** -- `AdminAnalyticsCharts` renders charts
8. **Journal d'audit** -- `AuditLogViewer` loads and displays audit entries
9. **Rendez-vous** -- `AdminAppointmentsOverview` loads
10. **Signalements** -- `ReportsModerationPanel` loads provider/ad/community reports
11. **Configuration** -- `SettingsPanel` loads platform settings
12. **Documentation IA** -- `AdminDocUpload` PDF upload to storage
13. **Gestion API** -- `ApiManagementPanel` shows API keys, logs, usage stats
14. **Sidebar** -- Collapse/expand, navigation between tabs, logout, profile link
15. **Provider Detail Dialog** -- Opens on eye icon click in inscriptions tab

### Implementation Steps

1. Log in via browser automation with the provided credentials
2. Navigate through each tab sequentially, taking screenshots to verify rendering
3. Test key interactions: sidebar collapse, search filtering, button clicks
4. Document any errors from console logs or failed network requests
5. Report findings with screenshots for each section

### Technical Notes

- Auth is Firebase-based (`loginAsAdmin` in AuthContext)
- Data comes from Firestore (`providers`, `admin_profiles`, `citizens`, `audit_logs` collections)
- Some panels also query Lovable Cloud tables (`api_keys`, `api_logs`, `api_usage`, `ads`, `provider_reports`)
- The `AdminGuard` checks `profile.userType === 'admin'` before granting access

