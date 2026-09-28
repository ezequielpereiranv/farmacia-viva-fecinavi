@echo off
cd /d "%~dp0"
title Feira de Ciencias - Servidor Local
where node >nul 2>nul
if errorlevel 1 goto SEMNODE
if not exist node_modules call npm install
cls
node server.js
pause
exit /b 0
:SEMNODE
echo Node.js nao encontrado. Instale o Node.js primeiro.
pause
exit /b 1
