# Partnership 项目 - 一键部署脚本
# 请在 PowerShell 中运行此脚本（以管理员身份）

param(
    [string]$GitHubRepo = ""
)

$ErrorActionPreference = "Stop"

function Write-Color($text, $color = "White") {
    Write-Host $text -ForegroundColor $color
}

Write-Color "========================================" "Cyan"
Write-Color "Partnership 项目 - 一键部署" "Cyan"
Write-Color "========================================" "Cyan"
Write-Host ""

# 1. 检查 Git
Write-Color "[1/7] 检查 Git..." "Yellow"
try {
    git --version
    Write-Host "✅ Git 已安装"
} catch {
    Write-Color "❌ Git 未安装，请先安装 Git" "Red"
    exit 1
}
Write-Host ""

# 2. 检查 Node.js
Write-Color "[2/7] 检查 Node.js..." "Yellow"
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js 版本: $nodeVersion"
} catch {
    Write-Color "❌ Node.js 未安装，请先安装 Node.js" "Red"
    exit 1
}
Write-Host ""

# 3. 本地测试（可选）
Write-Color "[3/7] 本地测试构建..." "Yellow"
Write-Host "正在安装依赖并测试构建..."
try {
    Push-Location "F:\Projects\Partnership\partnership-api"
    npm ci
    if ($LASTEXITCODE -ne 0) { throw "npm ci 失败" }

    # 生成 Prisma 客户端
    npx prisma generate
    if ($LASTEXITCODE -ne 0) { throw "prisma generate 失败" }

    Pop-Location

    Push-Location "F:\Projects\Partnership\partnership-app"
    npm ci
    if ($LASTEXITCODE -ne 0) { throw "npm ci 失败" }
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "构建失败" }
    Pop-Location

    Write-Host "✅ 本地构建成功"
} catch {
    Write-Color "❌ 构建失败: $_" "Red"
    Write-Host "继续尝试部署..."
}
Write-Host ""

# 4. Git 配置
Write-Color "[4/7] 配置 Git..." "Yellow"
if (-not (Test-Path "F:\Projects\Partnership\.git")) {
    Write-Host "初始化 Git 仓库..."
    Push-Location "F:\Projects\Partnership"
    git init
    git add .
    git commit -m "Initial commit - Partnership Management System"
    git branch -M main
    Pop-Location
    Write-Host "✅ Git 初始化完成"
} else {
    Write-Host "✅ Git 仓库已存在"
}
Write-Host ""

# 5. 推送到 GitHub（如果需要）
if ($GitHubRepo) {
    Write-Color "[5/7] 推送到 GitHub..." "Yellow"
    try {
        Push-Location "F:\Projects\Partnership"
        git remote add origin $GitHubRepo 2>$null
        git push -u origin main
        Pop-Location
        Write-Host "✅ 已推送到 GitHub"
    } catch {
        Write-Color "⚠️  推送失败: $_" "Yellow"
        Write-Host "你可能需要手动推送，或仓库已存在"
    }
    Write-Host ""
}

# 6. 生成 JWT_SECRET
Write-Color "[6/7] 生成 JWT_SECRET..." "Yellow"
$generatedSecret = [System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
Write-Host "✅ JWT_SECRET: $generatedSecret"
Write-Host ""

# 7. 部署到 Vercel
Write-Color "[7/7] 部署到 Vercel..." "Yellow"
Write-Host "准备安装 Vercel CLI 并部署..."
try {
    # 检查 Vercel 是否已安装
    $vercelVersion = vercel --version 2>$null
    if (-not $vercelVersion) {
        Write-Host "正在安装 Vercel CLI..."
        npm install -g vercel
        if ($LASTEXITCODE -ne 0) { throw "Vercel 安装失败" }
    }

    Push-Location "F:\Projects\Partnership"

    # 登录 Vercel（如果需要）
    Write-Host "检查 Vercel 登录状态..."
    vercel whoami 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "需要登录 Vercel，请在打开的浏览器中完成..."
        vercel login
    }

    Write-Host "开始部署..."
    Write-Host "注意：首次部署可能需要几分钟..."
    vercel --prod --yes

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 部署成功！"
    } else {
        throw "部署失败"
    }

    Pop-Location
} catch {
    Write-Color "❌ 部署失败: $_" "Red"
    Write-Host ""
    Write-Host "========================================" "Yellow"
    Write-Host "请手动完成以下步骤：" "Yellow"
    Write-Host "========================================" "Yellow"
    Write-Host ""
    Write-Host "1. 确保已登录 Vercel: vercel login"
    Write-Host "2. 在项目目录执行: vercel --prod"
    Write-Host "3. 在 Vercel 控制台设置环境变量:"
    Write-Host "   - DATABASE_URL = postgresql://postgres:Pgf$7@UFqk!ArHy@db.jzlfxjvtlgaoiplqwnxt.supabase.co:5432/postgres"
    Write-Host "   - JWT_SECRET = $generatedSecret"
    Write-Host "   - NODE_ENV = production"
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Color "========================================" "Green"
Write-Color "部署流程全部完成！" "Green"
Write-Color "========================================" "Green"
Write-Host ""
Write-Host "📋 部署信息："
Write-Host "  管理员账号: admin"
Write-Host "  管理员密码: admin123"
Write-Host ""
Write-Host "🔗 访问链接：见 Vercel 输出"
Write-Host ""
Write-Host "⚡ 实时协作：已启用 Socket.io"
Write-Host ""
Write-Host "如有问题，请查看 DEPLOY.md 文档"
Write-Host ""
pause
