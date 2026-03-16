@echo off
chcp 65001 >nul
echo =====================================
echo   Partnership App Backend 启动器
echo =====================================
echo.

cd /d "%~dp0backend"

if not exist "node_modules" (
    echo [1/2] 正在安装依赖...
    npm install
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
) else (
    echo [1/2] 依赖已存在，跳过安装
)

echo.
echo [2/2] 启动后端服务器...
echo 前端地址: http://localhost:5175
echo 后端 API:  http://localhost:3000
echo.

node server.js

pause
