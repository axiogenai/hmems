@echo off
echo ========================================================
echo Pushing HMEMS SchoolSite Pro to GitHub repository 'hmems'
echo ========================================================
echo.

cd /d "%~dp0"

echo 1. Initializing Git repository...
git init

echo.
echo 2. Adding all project files...
git add .

echo.
echo 3. Creating initial commit...
git commit -m "Initial commit of HMEMS SchoolSite Pro (Midnight Emerald Theme)"

echo.
echo 4. Renaming branch to main...
git branch -M main

echo.
echo 5. Linking remote repository...
echo Please enter your GitHub Username:
set /p GH_USER=

git remote remove origin 2>nul
git remote add origin https://github.com/%GH_USER%/hmems.git

echo.
echo 6. Pushing to https://github.com/%GH_USER%/hmems.git...
git push -u origin main

echo.
echo ========================================================
echo Push complete!
echo ========================================================
pause
