# Partnership 项目 - 完整部署流程
# 请以管理员身份在 PowerShell 中运行此脚本

# 设置错误处理
$ErrorActionPreference = "Stop"

# 颜色定义
function Write-Color($text, $color = "White") {
    Write-Host $text -ForegroundColor $color
}

Write-Color "========================================" "Cyan"
Write-Color "Partnership 项目 - 部署流程" "Cyan"
Write-Color "========================================" "Cyan"
Write-Host ""

# 1. 检查 Node.js
Write-Color "[1/6] 检查 Node.js 环境..." "Yellow"
$nodeVersion = node -v
Write-Host "✅ Node.js 版本: $nodeVersion"
Write-Host ""

# 2. 设置环境变量
Write-Color "[2/6] 配置环境变量..." "Yellow"
$env:DATABASE_URL = "postgresql://postgres:Pgf$7@UFqk!ArHy@db.jzlfxjvtlgaoiplqwnxt.supabase.co:5432/postgres"
$env:JWT_SECRET = "change-this-to-a-random-secret-minimum-32-chars-long"
$env:NODE_ENV = "production"
Write-Host "✅ 环境变量已设置"
Write-Host "   DATABASE_URL: $env:DATABASE_URL"
Write-Host "   JWT_SECRET: (已隐藏)"
Write-Host ""

# 3. 同步数据库 Schema
Write-Color "[3/6] 同步数据库 Schema 到 Supabase..." "Yellow"
Write-Host "正在运行: npx prisma db push --skip-generate"
try {
    Push-Location "F:\Projects\Partnership\partnership-api"
    npx prisma db push --skip-generate
    if ($LASTEXITCODE -ne 0) { throw "数据库同步失败" }
    Pop-Location
    Write-Host "✅ 数据库同步完成"
} catch {
    Write-Color "❌ 数据库同步失败: $_" "Red"
    Write-Host "请检查："
    Write-Host "  1. Supabase 数据库是否运行"
    Write-Host "  2. DATABASE_URL 是否正确"
    Write-Host "  3. 网络连接是否正常"
    pause
    exit 1
}
Write-Host ""

# 4. 创建管理员用户
Write-Color "[4/6] 创建管理员用户..." "Yellow"
Write-Host "正在运行: npx prisma db seed"
try {
    Push-Location "F:\Projects\Partnership\partnership-api"
    npx prisma db seed
    if ($LASTEXITCODE -ne 0) { throw "种子脚本执行失败" }
    Pop-Location
    Write-Host "✅ 管理员用户创建完成"
    Write-Host "   用户名: admin"
    Write-Host "   密码: admin123"
} catch {
    Write-Color "❌ 创建管理员失败: $_" "Red"
    Write-Host "可能的原因："
    Write-Host "  1. 用户已存在（正常）"
    Write-Host "  2. 数据库连接问题"
    pause
    exit 1
}
Write-Host ""

# 5. 检查 Vercel CLI
Write-Color "[5/6] 检查 Vercel CLI..." "Yellow"
try {
    $vercelVersion = vercel --version 2>$null
    if (-not $vercelVersion) {
        Write-Host "⚠️  Vercel CLI 未安装"
        Write-Host "正在安装..."
        npm install -g vercel
        if ($LASTEXITCODE -ne 0) { throw "Vercel 安装失败" }
        Write-Host "✅ Vercel CLI 已安装"
    } else {
        Write-Host "✅ Vercel CLI 已安装: $vercelVersion"
    }
} catch {
    Write-Color "❌ Vercel CLI 问题: $_" "Red"
    Write-Host "请手动安装: npm install -g vercel"
    pause
    exit 1
}
Write-Host ""

# 6. 生成 JWT_SECRET
Write-Color "[6/6] 生成 JWT_SECRET..." "Yellow"
$generatedSecret = [System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
Write-Host "✅ 生成的 JWT_SECRET: $generatedSecret"
Write-Host "请在 Vercel 项目设置中添加此环境变量"
Write-Host ""

# 部署准备总结
Write-Color "========================================" "Cyan"
Write-Color "准备完成！" "Green"
Write-Color "========================================" "Cyan"
Write-Host ""
Write-Host "接下来请手动执行："
Write-Host "1. 登录 Vercel: vercel login"
Write-Host "2. 在 Vercel 控制台创建项目，设置环境变量:"
Write-Host "   - DATABASE_URL = postgresql://postgres:Pgf$7@UFqk!ArHy@db.jzlfxjvtlgaoiplqwnxt.supabase.co:5432/postgres"
Write-Host "   - JWT_SECRET = $generatedSecret"
Write-Host "   - NODE_ENV = production"
Write-Host "3. 部署: vercel --prod"
Write-Host ""
Write-Host "或者，你可以在 Vercel 网站直接导入项目，然后添加环境变量"
Write-Host ""
pause
