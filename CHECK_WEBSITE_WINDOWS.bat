@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js is not installed. Open START_HERE_中文.md and follow Step 1.
  echo.
  pause
  exit /b 1
)
node scripts\preview-dist.mjs
pause
