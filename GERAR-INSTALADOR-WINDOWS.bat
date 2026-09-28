@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Gerar Instalador - Feira de Ciencias
cls
echo ====================================================
echo  GERADOR DO INSTALADOR WINDOWS
echo ====================================================
echo.
where node >nul 2>nul || (echo ERRO: Node.js nao encontrado neste computador de desenvolvimento.&echo Instale o Node.js apenas neste PC que vai GERAR o instalador.&pause&exit /b 1)
echo Instalando dependencias de compilacao...
call npm install || (echo ERRO no npm install.&pause&exit /b 1)
echo.
echo Gerando Setup.exe e versao Portatil.exe...
call npm run dist:win
if errorlevel 1 (echo.&echo ERRO ao gerar os executaveis.&pause&exit /b 1)
echo.
echo ====================================================
echo  CONCLUIDO!
echo  Os executaveis estao na pasta DIST.
echo ====================================================
start "" "%~dp0dist"
pause
