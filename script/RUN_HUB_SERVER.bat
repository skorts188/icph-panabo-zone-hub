@echo off
title ICPH HUB: LOCAL SERVER
color 0C
cls
echo.
echo    ICPH CYBER-SERVER V3: ONLINE
echo    ----------------------------
echo.
cd /d %~dp0
cd ..\..
if exist "server.js" (
    node server.js
) else (
    echo [ERROR] server.js not found in %cd%
)
pause