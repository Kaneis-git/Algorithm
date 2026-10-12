@echo off
setlocal
title KnowledgeHub AI - Local server
pushd "%~dp0" || exit /b 1

where node.exe >nul 2>nul
if errorlevel 1 goto missing_node
node.exe -e "process.exit(Number(process.versions.node.split('.')[0]) === 24 ? 0 : 1)"
if errorlevel 1 goto missing_node
where npm.cmd >nul 2>nul
if errorlevel 1 goto missing_node
if not exist ".next\standalone\server.js" goto missing_build

rem This shortcut is deliberately local to this computer.
set "APP_HOST=127.0.0.1"
set "PORT=3000"
echo.
echo Starting KnowledgeHub AI on this computer...
echo Once the server is ready, open http://127.0.0.1:3000 in your browser.
echo Keep this window open while using the website.
echo To stop the website, press Ctrl+C and confirm if prompted.
echo.
call npm.cmd start
if errorlevel 1 goto failed
popd
exit /b 0

:missing_node
echo.
echo Node.js 24.x and npm are required.
echo Install them from https://nodejs.org/en/download and reopen this script.
goto failed

:missing_build
echo.
echo No production build was found. Run 01-setup.cmd first.
goto failed

:failed
echo.
echo The server did not start or stopped with an error.
echo If port 3000 is already in use, close the earlier server window and retry.
echo Please keep or screenshot the error above if you need help.
pause
popd
exit /b 1
