@echo off
cd /d "%~dp0"
title Instalacao - Feira de Ciencias
echo ================================================
echo  FEIRA DE CIENCIAS - INSTALACAO DO SERVIDOR
echo ================================================
where node >nul 2>nul
if errorlevel 1 goto SEMNODE
echo Node encontrado:
node --version
echo.
echo Instalando dependencias...
call npm install
if errorlevel 1 goto ERRO
echo.
echo INSTALACAO CONCLUIDA.
echo Agora execute INICIAR-SERVIDOR.bat
pause
exit /b 0
:SEMNODE
echo ERRO: Node.js nao foi encontrado.
echo Instale o Node.js LTS e execute novamente.
pause
exit /b 1
:ERRO
echo A instalacao encontrou um erro.
pause
exit /b 1
