Write-Host "Staging new credential seed file..." -ForegroundColor Blue
git add .
git commit -m "chore: add seed script for Admin, Doctor, and Patient default credentials"

Write-Host "Pushing to aayush-made-features branch..." -ForegroundColor Blue
git push origin aayush-made-features

Write-Host "Switching to main branch..." -ForegroundColor Blue
git checkout main

Write-Host "Merging changes into main..." -ForegroundColor Blue
git merge aayush-made-features -m "Merge branch 'aayush-made-features' into main: Seed credentials"

Write-Host "Pushing to main branch..." -ForegroundColor Blue
git push origin main

Write-Host "Returning to your working branch..." -ForegroundColor Blue
git checkout aayush-made-features

Write-Host "Repository synchronisation complete!" -ForegroundColor Green
