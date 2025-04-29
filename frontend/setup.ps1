# 安装依赖
Write-Host "安装项目依赖..." -ForegroundColor Green
pnpm install

# 构建项目
Write-Host "构建项目..." -ForegroundColor Green
pnpm build

# 完成信息
Write-Host "`n构建完成!" -ForegroundColor Green
Write-Host "你可以在Chrome浏览器中加载此扩展:" -ForegroundColor Cyan
Write-Host "1. 打开 chrome://extensions/" -ForegroundColor Yellow
Write-Host "2. 开启 '开发者模式'" -ForegroundColor Yellow
Write-Host "3. 点击 '加载已解压的扩展程序'" -ForegroundColor Yellow
Write-Host "4. 选择 '$PWD\dist' 目录" -ForegroundColor Yellow

# 启动开发服务器的说明 
Write-Host "`n如需启动开发服务器，请运行:" -ForegroundColor Cyan
Write-Host "pnpm dev" -ForegroundColor Yellow 