# ============================================================
# commit30.ps1  -  30 logical commits for HealthCareEHR
# Run from the repo root:  powershell -ExecutionPolicy Bypass -File .\commit30.ps1
# ============================================================

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function TryCommit([string]$msg) {
    $status = git status --porcelain
    if ($status) {
        git commit -m $msg
    } else {
        Write-Host "  (nothing to commit, skipped)" -ForegroundColor DarkGray
    }
}

Write-Host "=== Healthcare EHR - 30 Commits ===" -ForegroundColor Cyan

# 1
Write-Host "[1/30]" -ForegroundColor Yellow
git add backend/package.json backend/package-lock.json
TryCommit "chore(deps): install nodemailer for Gmail SMTP email delivery"

# 2
Write-Host "[2/30]" -ForegroundColor Yellow
git add backend/src/utils/email.js
TryCommit "feat(backend): add Nodemailer Gmail SMTP transporter with branded OTP email template"

# 3
Write-Host "[3/30]" -ForegroundColor Yellow
git add backend/src/models/user.model.js
TryCommit "feat(backend/model): add resetToken and resetTokenExpiry fields to User model"

# 4
Write-Host "[4/30]" -ForegroundColor Yellow
git add backend/src/models/doctor.model.js
TryCommit "fix(backend/model): make Doctor email and licenseNumber allowNull true for optional input"

# 5
Write-Host "[5/30]" -ForegroundColor Yellow
git add backend/src/controllers/auth.controller.js
TryCommit "feat(backend/auth): implement forgotPassword, verifyOtp, resetPassword with 6-digit OTP via email"

# 6
Write-Host "[6/30]" -ForegroundColor Yellow
git add backend/src/routes/auth.route.js
TryCommit "feat(backend/routes): register /forgot-password /verify-otp /reset-password staff auth routes"

# 7
Write-Host "[7/30]" -ForegroundColor Yellow
git add backend/src/controllers/portal/auth.portal.controller.js
TryCommit "feat(backend/portal): auto-verify patient on register; add forgotPortalPassword verifyPortalOtp resetPortalPassword"

# 8
Write-Host "[8/30]" -ForegroundColor Yellow
git add backend/src/routes/portal/auth.portal.route.js
TryCommit "feat(backend/portal-routes): add /forgot-password /verify-otp /reset-password routes for patient portal"

# 9
Write-Host "[9/30]" -ForegroundColor Yellow
git add backend/src/validators/doctor.validator.js
TryCommit "fix(backend/validation): rename specialty to specialization in doctor schema; make email phone license optional"

# 10
Write-Host "[10/30]" -ForegroundColor Yellow
git add backend/src/controllers/doctor.controller.js
TryCommit "fix(backend/doctor): only firstName lastName specialization required; null-safe duplicate checks"

# 11
Write-Host "[11/30]" -ForegroundColor Yellow
git add backend/src/validators/patient.validator.js
TryCommit "fix(backend/validation): add bloodType and emergencyContact to patient schema; make phone and email optional"

# 12
Write-Host "[12/30]" -ForegroundColor Yellow
git add backend/src/controllers/patient.controller.js
TryCommit "fix(backend/patient): remove mandatory contactInformation email+phone check; persist bloodType and emergencyContact"

# 13
Write-Host "[13/30]" -ForegroundColor Yellow
git add frontend/src/services/auth.service.js
TryCommit "feat(frontend/service): add forgotPassword verifyOtp resetPassword methods to auth service"

# 14
Write-Host "[14/30]" -ForegroundColor Yellow
git add frontend/src/api/portal.service.js
TryCommit "feat(frontend/api): create portal.service.js covering register login me and password reset"

# 15
Write-Host "[15/30]" -ForegroundColor Yellow
git add frontend/src/store/slices/portalAuthSlice.js
TryCommit "feat(frontend/store): add portalAuthSlice with loginPortalUser registerPortalUser logoutPortal and localStorage persistence"

# 16
Write-Host "[16/30]" -ForegroundColor Yellow
git add frontend/src/store/index.js
TryCommit "feat(frontend/store): register portalAuth reducer in Redux store"

# 17
Write-Host "[17/30]" -ForegroundColor Yellow
git add frontend/src/pages/ForgotPassword.jsx
TryCommit "feat(frontend/page): add 3-step staff ForgotPassword wizard with username email OTP and new password steps"

# 18
Write-Host "[18/30]" -ForegroundColor Yellow
git add frontend/src/components/PortalProtectedRoute.jsx
TryCommit "feat(frontend/component): add PortalProtectedRoute guard that redirects to portal login when no token"

# 19
Write-Host "[19/30]" -ForegroundColor Yellow
git add frontend/src/pages/portal/
TryCommit "feat(frontend/portal): add PatientPortalLogin PatientPortalRegister PatientDashboard PortalForgotPassword pages"

# 20
Write-Host "[20/30]" -ForegroundColor Yellow
git add frontend/src/App.jsx
TryCommit "feat(frontend/routing): add /forgot-password and full /portal route tree with protected dashboard"

# 21
Write-Host "[21/30]" -ForegroundColor Yellow
git add frontend/src/pages/Login.jsx
TryCommit "feat(frontend/login): add Forgot password link below password field linking to /forgot-password"

# 22
Write-Host "[22/30]" -ForegroundColor Yellow
git add frontend/src/pages/Doctors.jsx
TryCommit "feat(frontend/doctors): add Create Login Account button and modal to provision staff logins for doctors"

# 23
Write-Host "[23/30]" -ForegroundColor Yellow
git add frontend/src/store/slices/doctorSlice.js
TryCommit "fix(frontend/store): fix fetchDoctors to read res.items from paginated response; add createDoctorLogin thunk"

# 24
Write-Host "[24/30]" -ForegroundColor Yellow
git add frontend/src/store/slices/patientSlice.js
TryCommit "fix(frontend/store): fix fetchPatients to read res.items from paginated backend response"

# 25
Write-Host "[25/30]" -ForegroundColor Yellow
git add frontend/src/store/slices/appointmentSlice.js
TryCommit "fix(frontend/store): fix fetchAppointments and fetchAppointmentsByPatient to use res.items pagination key"

# 26
Write-Host "[26/30]" -ForegroundColor Yellow
git add frontend/src/store/slices/medicationsSlice.js
TryCommit "fix(frontend/store): fix fetchAllMedications and fetchAllPrescriptions to use res.items pagination key"

# 27 - earlier session files (may already be committed, TryCommit handles gracefully)
Write-Host "[27/30]" -ForegroundColor Yellow
git add frontend/src/store/slices/ordersSlice.js 2>$null
git add frontend/src/pages/Orders.jsx 2>$null
TryCommit "fix(frontend/orders): add setAllLabOrders setAllImagingOrders setAllLabResults reducers; fix import pattern"

# 28
Write-Host "[28/30]" -ForegroundColor Yellow
git add frontend/src/store/slices/clinicalSlice.js 2>$null
git add frontend/src/pages/Documentation.jsx 2>$null
TryCommit "fix(frontend/clinical): add setAllEncounters and setAllProgressNotes reducers; fix Documentation fetch"

# 29
Write-Host "[29/30]" -ForegroundColor Yellow
git add frontend/src/pages/Dashboard.jsx 2>$null
TryCommit "fix(frontend/dashboard): wire Lab and Imaging Orders stat card to real combined order count"

# 30 - catch-all for anything remaining
Write-Host "[30/30]" -ForegroundColor Yellow
git add -A
TryCommit "chore: finalise all remaining frontend and backend changes from auth and onboarding session"

Write-Host ""
Write-Host "=== Done! Last 32 commits: ===" -ForegroundColor Green
git log --oneline -32
