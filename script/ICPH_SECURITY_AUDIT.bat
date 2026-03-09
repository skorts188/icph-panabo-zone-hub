@echo off
title ICPH: SECURITY AUDIT
color 0C
cls
echo.
echo    ICPH CYBER-SECURITY SCANNER V1.0
echo    --------------------------------
echo.
echo    [SYSTEM]: Scanning HTML Files for Security Locks...
echo.

set "missing=0"

for %%f in (..\*.html) do (
    findstr "auth-overlay" "%%f" >nul
    if errorlevel 1 (
        echo    [!] WARNING: %%f is UNLOCKED! (No auth-overlay^)
        set /a missing+=1
    ) else (
        echo    [OK]: %%f is SECURED.
    )
)

echo.
echo    --------------------------------
if %missing%==0 (
    echo    AUDIT RESULT: SHIELD ACTIVE (All files secured^)
) else (
    echo    AUDIT RESULT: %missing% VULNERABILITIES FOUND!
)
echo    --------------------------------
echo.
pause