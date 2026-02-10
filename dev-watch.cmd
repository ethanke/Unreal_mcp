@echo off
:: Fast Dev Watch - Auto-recompiles TypeScript on save
:: Usage: double-click or run from terminal
:: After changes compile, restart Claude Code/Desktop to pick up new code

title Unreal MCP - Dev Watch (auto-rebuild on save)
echo ============================================
echo   Unreal MCP - Development Watch Mode
echo ============================================
echo.
echo  Source:  src\  (edit here)
echo  Output:  dist\ (auto-compiled)
echo  Config:  Both Claude Code + Desktop point to dist\cli.js
echo.
echo  Workflow:
echo    1. Edit files in src\
echo    2. This window auto-compiles on save
echo    3. Restart Claude Code/Desktop to load changes
echo.
echo  Press Ctrl+C to stop watching.
echo ============================================
echo.

cd /d "%~dp0"
npx tsc -p tsconfig.json --watch
