@echo off
setlocal
title KnowledgeHub AI - First-time setup
pushd "%~dp0" || exit /b 1

if not exist "package.json" goto incomplete
where node.exe >nul 2>nul
if errorlevel 1 goto missing_node
node.exe -e "process.exit(Number(process.versions.node.split('.')[0]) === 24 ? 0 : 1)"
if errorlevel 1 goto wrong_node
where npm.cmd >nul 2>nul
if errorlevel 1 goto missing_node

echo.
echo KnowledgeHub AI - First-time setup
echo Keep this window open. The first installation needs internet access.
echo.
if not exist ".env.local" copy /Y ".env.example" ".env.local" >nul
echo [1/2] Installing project dependencies...
call npm.cmd ci
if errorlevel 1 goto failed

echo.
echo [2/2] Building the application...
call npm.cmd run build
if errorlevel 1 goto failed

echo.
echo Setup completed successfully.
echo Next: double-click 02-start.cmd, then open http://127.0.0.1:3000
echo Run this setup again after updating the source code.
goto success

:missing_node
echo.
echo Node.js or npm was not found.
echo Install Node.js 24.x for Windows from https://nodejs.org/en/download
echo Keep the default npm and PATH options, then reopen this script.
goto failed

:wrong_node
echo.
echo This project requires Node.js 24.x. Your current version is:
node.exe --version
echo Select Node.js 24.x at https://nodejs.org/en/download
goto failed

:incomplete
echo.
echo package.json was not found. Extract the ENTIRE ZIP before running this script.
goto failed

:failed
echo.
echo Setup did not finish. Please keep or screenshot the error above.
pause
popd
exit /b 1

:success
pause
popd
exit /b 0
