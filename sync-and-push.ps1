# Run this from PowerShell to fix push. Uses a fresh clone so there's no divergence.
#
# Usage 1 (you will be prompted for username + token as password):
#   cd D:\proofpilot
#   .\sync-and-push.ps1
#
# Usage 2 (with token - create a NEW token at GitHub and replace YOUR_NEW_TOKEN):
#   cd D:\proofpilot
#   .\sync-and-push.ps1 -Token "YOUR_NEW_TOKEN"

param([string]$Token = "")

$ErrorActionPreference = "Stop"
$freshDir = "D:\proofpilot-fresh"
$sourceDir = "D:\proofpilot"

if ($Token) {
    $repoUrl = "https://yskhub:$Token@github.com/yskhub/proofpilot.git"
    $pushUrl = $repoUrl
} else {
    $repoUrl = "https://github.com/yskhub/proofpilot.git"
    $pushUrl = $repoUrl
    Write-Host "No token passed. When asked for password, paste your GitHub Personal Access Token." -ForegroundColor Yellow
}

Write-Host "Step 1: Remove old fresh clone if it exists..." -ForegroundColor Cyan
if (Test-Path $freshDir) {
    Remove-Item -Recurse -Force $freshDir
}

Write-Host "Step 2: Clone repo..." -ForegroundColor Cyan
Set-Location D:\
git clone $repoUrl proofpilot-fresh
Set-Location $freshDir

Write-Host "Step 3: Copy fixed files into the clone..." -ForegroundColor Cyan
Copy-Item -Path "$sourceDir\render.yaml" -Destination "$freshDir\render.yaml" -Force
Copy-Item -Path "$sourceDir\package.json" -Destination "$freshDir\package.json" -Force
Copy-Item -Path "$sourceDir\index.html" -Destination "$freshDir\index.html" -Force
Copy-Item -Path "$sourceDir\vite.config.ts" -Destination "$freshDir\vite.config.ts" -Force
if (Test-Path "$sourceDir\public\_redirects") {
    if (-not (Test-Path "$freshDir\public")) { New-Item -ItemType Directory -Path "$freshDir\public" | Out-Null }
    Copy-Item -Path "$sourceDir\public\_redirects" -Destination "$freshDir\public\_redirects" -Force
}
if (Test-Path "$sourceDir\RENDER_BUILD_COMMAND.txt") { Copy-Item -Path "$sourceDir\RENDER_BUILD_COMMAND.txt" -Destination "$freshDir\RENDER_BUILD_COMMAND.txt" -Force }

Write-Host "Step 4: Commit and push from the fresh clone..." -ForegroundColor Cyan
git add render.yaml package.json index.html vite.config.ts
if (Test-Path "public\_redirects") { git add public/_redirects }
if (Test-Path "RENDER_BUILD_COMMAND.txt") { git add RENDER_BUILD_COMMAND.txt }
git status
git commit -m "Fix blank page: update HTML template, add SPA routing, fix vite config"
if ($Token) { git push $pushUrl main } else { git push origin main }

Write-Host "Step 5: Update your main project folder to match GitHub..." -ForegroundColor Cyan
Set-Location $sourceDir
git fetch origin
git reset --hard origin/main

Write-Host "Done. You can delete D:\proofpilot-fresh if you want." -ForegroundColor Green
Write-Host "If Step 5 asked for a password, use your GitHub token. If it failed, run in D:\proofpilot: git fetch origin then git reset --hard origin/main" -ForegroundColor Gray
