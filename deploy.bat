@echo off
echo ========================================
echo Partnership 项目部署脚本
echo ========================================
echo.

:: 1. 设置环境变量
set DATABASE_URL=postgresql://postgres:Pgf$7@UFqk!ArHy@db.jzlfxjvtlgaoiplqwnxt.supabase.co:5432/postgres
set JWT_SECRET=your-secret-key-change-this-to-a-random-string
set NODE_ENV=production

:: 2. 同步数据库 Schema
echo [1/5] 同步数据库 Schema...
cd partnership-api
call npx prisma db push --skip-generate
if errorlevel 1 (
    echo ❌ 数据库同步失败，请检查 DATABASE_URL
    pause
    exit /b 1
)
echo ✅ 数据库同步完成
echo.

:: 3. 创建管理员用户
echo [2/5] 创建管理员用户...
call npx prisma db seed
if errorlevel 1 (
    echo ❌ 创建管理员失败
    pause
    exit /b 1
)
echo ✅ 管理员用户创建完成 (admin / admin123)
echo.

:: 4. 构建前端
echo [3/5] 构建前端...
cd ..\partnership-app
call npm ci
if errorlevel 1 (
    echo ❌ npm ci 失败
    pause
    exit /b 1
)
call npm run build
if errorlevel 1 (
    echo ❌ 构建失败
    pause
    exit /b 1
)
echo ✅ 前端构建完成
echo.

:: 5. 部署到 Vercel
echo [4/5] 部署到 Vercel...
cd ..
echo 请确保你已经登录 Vercel (vercel login)
echo 如果没有安装 Vercel CLI，请先运行: npm install -g vercel
echo.
pause
echo 开始部署...
call vercel --prod --yes
if errorlevel 1 (
    echo ❌ 部署失败
    pause
    exit /b 1
)
echo ✅ 部署完成！
echo.

:: 6. 测试部署
echo [5/5] 部署信息：
echo 请访问上一步输出的 Vercel 链接
echo 登录账号: admin
echo 登录密码: admin123
echo.
echo ========================================
echo 部署流程全部完成！
echo ========================================
pause
