Write-Host "Staging all frontend RBAC UI changes..." -ForegroundColor Blue
git add .

Write-Host "Committing changes..." -ForegroundColor Blue
git commit -m "feat: complete strict role-based access control (RBAC) UI constraints

- Applied patient data edit restrictions and added Admin patient login creation
- Locked doctor side appointment booking/editing with unauthorized popup alerts 
- Removed 'New Encounter' and 'Progress Note' creation buttons for Doctors
- Enforced doctor-specific filtering for Appointments, Lab & Imaging Orders
- Automized prescriber identity in Medications and restricted Admins from prescribing
- Restored strictly filtered UI for Doctors: removed Add Doctor and Audit Logs access"

Write-Host "Pushing to aayush-made-features branch..." -ForegroundColor Blue
git push origin aayush-made-features

Write-Host "Checking out main branch..." -ForegroundColor Blue
git checkout main

Write-Host "Merging changes into main..." -ForegroundColor Blue
git merge aayush-made-features -m "Merge branch 'aayush-made-features' into main: RBAC constraints"

Write-Host "Pushing to main branch..." -ForegroundColor Blue
git push origin main

Write-Host "Returning to your working branch..." -ForegroundColor Blue
git checkout aayush-made-features

Write-Host "Repository synchronisation complete!" -ForegroundColor Green
