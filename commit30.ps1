# Git Automation Script: 20 Sequential Commits
# Pushes to both 'aayush-made-features' and 'main'

$branch = git branch --show-current
if ($branch -ne "aayush-made-features") {
    Write-Host "Error: Current branch is not 'aayush-made-features'. Please switch before running." -ForegroundColor Red
    exit
}

$logFile = ".contribution_log"

Write-Host "Starting 20-commit sequence..." -ForegroundColor Cyan

for ($i = 1; $i -le 20; $i++) {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss-fff"
    Add-Content -Path $logFile -Value "Entry #$i - $timestamp"
    git add $logFile
    git commit -m "Automated update sequence $i [ref:$timestamp]"
}

Write-Host "`nPushing sequence to origin/aayush-made-features..." -ForegroundColor Yellow
git push origin aayush-made-features

Write-Host "`nMerging changes into main..." -ForegroundColor Yellow
git checkout main
git merge aayush-made-features --no-edit
git push origin main

Write-Host "`nReturning to feature branch..." -ForegroundColor Cyan
git checkout aayush-made-features

Write-Host "`n✅ All 20 commits successfully processed and pushed to both branches." -ForegroundColor Green
