@echo off
:: Quick Build - TypeScript only (no lint, no WASM) ~2 seconds
:: Use this for fast one-shot rebuilds

title Unreal MCP - Quick Build
cd /d "%~dp0"

echo [BUILD] Compiling TypeScript...
call npx tsc -p tsconfig.json
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Build failed!
    pause
    exit /b 1
)
echo [DONE] Build complete - dist\ updated
echo [INFO] Restart Claude Code/Desktop to load changes
