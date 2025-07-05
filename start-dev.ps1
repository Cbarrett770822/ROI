Write-Host "Starting ROI Warehouse Management System development servers..." -ForegroundColor Cyan

# Kill any existing Node.js processes
Write-Host "Stopping any running Node.js processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Start Netlify Functions server in a new window
Write-Host "Starting Netlify Functions server on port 9999..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; netlify functions:serve"

# Wait a moment for the Netlify Functions server to start
Start-Sleep -Seconds 2

# Start Vite development server
Write-Host "Starting Vite development server on port 8888..." -ForegroundColor Green
npm run dev

Write-Host "Development servers started!" -ForegroundColor Cyan
