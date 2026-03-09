@echo off
setlocal enabledelayedexpansion
title ICPH: PROJECT POWER LEVEL
color 0C
cls
echo.
echo    ICPH HUB: PROJECT POWER STATS
echo    -----------------------------
echo.
echo    [SYSTEM]: Analyzing Cyber-Logic...
echo.

set /a filecount=0
set /a linecount=0

for /r .. %%f in (*.html *.js *.css) do (
    set /a filecount+=1
    for /f "tokens=2 delims=:" %%l in ('find /c /v "" "%%f"') do set /a linecount+=%%l
)

echo    TOTAL CYBER-FILES: %filecount%
echo    TOTAL LOGIC-LINES: %linecount%
echo.

if %linecount% GTR 5000 (
    echo    POWER LEVEL: OVER 9000 (Master Architect^)
) else (
    echo    POWER LEVEL: ELITE DEVELOPER
)

echo.
echo    CURRENT VERSION: V37.2 (Final^)
echo    STATUS: RIDE READY
echo    -----------------------------
echo.
pause