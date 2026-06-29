@echo off
REM ============================================================
REM  AbstractOcclusion — local preview launcher (Windows)
REM  Double-click this file. It starts a small web server in
REM  this folder and opens the site in your browser, so scripts,
REM  filters, fonts and the 3D viewer all work like they will
REM  for real visitors. Close the server window to stop.
REM ============================================================
cd /d "%~dp0"
set "PORT=8000"

REM --- find Python (py launcher, then python, then node) ---
where py >nul 2>nul
if %errorlevel%==0 (
  start "AO preview server - close to stop" cmd /k py -m http.server %PORT%
  goto open
)
where python >nul 2>nul
if %errorlevel%==0 (
  start "AO preview server - close to stop" cmd /k python -m http.server %PORT%
  goto open
)
where node >nul 2>nul
if %errorlevel%==0 (
  start "AO preview server - close to stop" cmd /k npx --yes http-server -p %PORT% -c-1
  goto open
)

echo.
echo  No Python or Node.js found on this PC.
echo  Install Python (ticking "Add to PATH"): https://www.python.org/downloads/
echo  Then double-click preview.bat again.
echo.
pause
exit /b

:open
REM give the server a moment to start, then open the browser
timeout /t 2 >nul
start "" "http://localhost:%PORT%/index.html"
exit /b
