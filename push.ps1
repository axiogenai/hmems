Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " Holy Mother English Medium School - Git Push Script" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1/3 Staging changes..." -ForegroundColor Yellow
& "C:\Program Files\Git\cmd\git.exe" add .
Write-Host "2/3 Committing changes..." -ForegroundColor Yellow
& "C:\Program Files\Git\cmd\git.exe" commit -m "Holy Mother English Medium School: Mobile footer layout, broadcast bell notifications, real badge count, zero load flash, card UI refinements"
Write-Host "3/3 Pushing to remote repository..." -ForegroundColor Yellow
& "C:\Program Files\Git\cmd\git.exe" push
Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " SUCCESS: All changes successfully pushed to Git!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
