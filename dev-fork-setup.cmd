@echo off
:: One-time setup: Fork the repo and configure git remotes
:: Run this AFTER you've forked on GitHub (https://github.com/ChiR24/Unreal_mcp/fork)

cd /d "%~dp0"

echo ============================================
echo   Unreal MCP - Fork Setup
echo ============================================
echo.

:: Check if fork remote already exists
git remote get-url fork >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Fork remote already configured:
    git remote get-url fork
    echo.
    echo To change it: git remote set-url fork ^<your-fork-url^>
    pause
    exit /b 0
)

:: Get GitHub username
set /p GH_USER="Enter your GitHub username: "
if "%GH_USER%"=="" (
    echo [ERROR] Username cannot be empty
    pause
    exit /b 1
)

echo.
echo [SETUP] Renaming 'origin' to 'upstream' (original repo)...
git remote rename origin upstream 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] upstream already exists, skipping rename
)

echo [SETUP] Adding your fork as 'fork' remote...
git remote add fork https://github.com/%GH_USER%/Unreal_mcp.git 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] fork remote already exists, updating URL
    git remote set-url fork https://github.com/%GH_USER%/Unreal_mcp.git
)

echo.
echo [DONE] Git remotes configured:
git remote -v
echo.
echo Workflow:
echo   git pull upstream main     -- Pull latest from original
echo   git push fork main         -- Push to your fork
echo   git checkout -b my-feature -- Create feature branch
echo   git push fork my-feature   -- Push feature to your fork
echo.
pause
