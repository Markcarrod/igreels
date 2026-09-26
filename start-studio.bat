@echo off
title Viral Music Video Studio
cd /d "%~dp0"
echo ==============================================================
echo   Launching Viral Music Video Generator Web Studio...
echo   Opening in your browser at: http://localhost:4000
echo ==============================================================
node server.js
pause
