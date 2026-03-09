@echo off
cd /d %~dp0

:: Completely wipe local git history to remove blocked secrets
rd /s /q .git >nul 2>&1

git init
git config --global user.email "skorts188@gmail.com"
git config --global user.name "skorts188"
git remote add origin https://github.com/skorts188/icph-panabo-zone-hub.git

:: The .gitignore file will ensure "my user.txt" is never added again
git branch -M main
git add .
git commit -m "V34.0 (The Global Search & Social Update) - Secure Upload"
git push -u origin main --force
echo.
echo Process complete! Please check your GitHub repository.
pause
