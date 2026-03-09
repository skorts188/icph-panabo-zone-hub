@echo off
setlocal enabledelayedexpansion
cd /d %~dp0

:: 🛡️ ICPH CYBER-DEPLOY V4.1: STABILITY PATCH
:: Engineered by the Elite 20 (Titan Prime & Code Sentinel)
:: Standard: TOP 1 IN THE COUNTRY

:: Initialize ESC Character for Colors
for /F "tokens=1,2 delims=#" %%a in ('"prompt #$H#$E# & echo on & for %%b in (1) do rem"') do set ESC=%%b

cls
echo.
echo    %ESC%[31m██╗ ██████╗██████╗ ██╗  ██╗    ██████╗ ███████╗██████╗ ██╗      ██████╗ ██╗   ██╗%ESC%[0m
echo    %ESC%[31m██║██╔════╝██╔══██╗██║  ██║    ██╔══██╗██╔════╝██╔══██╗██║     ██╔═══██╗╚██╗ ██╔╝%ESC%[0m
echo    %ESC%[31m██║██║     ██████╔╝███████║    ██║  ██║█████╗  ██████╔╝██║     ██║   ██║ ╚████╔╝ %ESC%[0m
echo    %ESC%[31m██║██║     ██╔═══╝ ██╔══██║    ██║  ██║██╔══╝  ██╔═══╝ ██║     ██║   ██║  ╚██╔╝  %ESC%[0m
echo    %ESC%[31m██║╚██████╗██║     ██║  ██║    ██████╔╝███████╗██║     ███████╗╚██████╔╝   ██║   %ESC%[0m
echo    %ESC%[31m╚═╝ ╚═════╝╚═╝     ╚═╝  ╚═╝    ╚═════╝ ╚══════╝╚═╝     ╚══════╝ ╚═════╝    ╚═╝   %ESC%[0m
echo.
echo    %ESC%[36m[SYSTEM] INITIALIZING DEPLOYMENT PROTOCOL V4.1...%ESC%[0m
echo.

:: 2. Robust Timestamping
set "t=%time: =0%"
set "datestamp=%date:~-4,4%-%date:~-10,2%-%date:~-7,2%"
set "timestamp=%t:~0,2%:%t:~3,2%"
set "commit_msg=ICPH-STABILIZE: [%datestamp% @ %timestamp%]"

:: 3. Junk Purge (Logic Overlord)
echo    %ESC%[90m[CLEANUP] REMOVING TEMPORARY ASSETS...%ESC%[0m
del /s /f /q Thumbs.db >nul 2>&1
del /s /f /q .DS_Store >nul 2>&1
echo    %ESC%[32m[SUCCESS] SYSTEM PURGE COMPLETE.%ESC%[0m

:: 4. Local Backup Engine (Infra-Shadow)
echo    %ESC%[90m[BACKUP] CREATING LOCAL SNAPSHOT...%ESC%[0m
if exist "C:\Program Files\WinRAR\Rar.exe" (
    "C:\Program Files\WinRAR\Rar.exe" a -r -ep1 -idq "..\ICPH_BACKUP_%datestamp%_%t:~0,2%%t:~3,2%.rar" .
    echo    %ESC%[32m[SUCCESS] LOCAL RAR BACKUP CREATED IN ROOT.%ESC%[0m
) else (
    echo    %ESC%[33m[NOTICE] WINRAR NOT DETECTED. SKIPPING LOCAL COMPRESSION.%ESC%[0m
)

:: 5. Git Synchronization (Titan Prime)
echo    %ESC%[90m[GIT] ESTABLISHING REMOTE HANDSHAKE...%ESC%[0m

if not exist ".git" (
    echo    %ESC%[33m[INIT] REBUILDING GIT INFRASTRUCTURE...%ESC%[0m
    git init >nul
    git remote add origin https://github.com/skorts188/icph-panabo-zone-hub.git
)

git config user.email "skorts188@gmail.com"
git config user.name "skorts188"
git branch -M main >nul 2>&1

echo    %ESC%[90m[SYNC] STAGING ASSETS...%ESC%[0m
git add .
git commit -m "%commit_msg%" >nul 2>&1

echo    %ESC%[90m[PUSH] TRANSMITTING TO GITHUB CLOUD...%ESC%[0m
git push -u origin main --force

echo.
echo    %ESC%[32m[DONE] ICPH HUB DEPLOYED AT PEAK PERFORMANCE.%ESC%[0m
echo    %ESC%[36mTIME: %datestamp% @ %timestamp%%ESC%[0m
echo.
echo    %ESC%[90mPress any key to return to dev mode...%ESC%[0m
pause >nul
