@echo off
echo ========================================================
echo  Holy Mother English Medium School - Git Push Script
echo ========================================================
echo.
echo 1/3 Staging changes...
"C:\Program Files\Git\cmd\git.exe" add .
echo.
echo 2/3 Committing changes...
"C:\Program Files\Git\cmd\git.exe" commit -m "Holy Mother English Medium School: Mobile footer layout, broadcast bell notifications, real badge count, zero load flash, card UI refinements"
echo.
echo 3/3 Pushing to remote repository...
"C:\Program Files\Git\cmd\git.exe" push
echo.
echo ========================================================
echo  SUCCESS: All changes successfully pushed to Git!
echo ========================================================
pause
