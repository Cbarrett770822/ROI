# Simple script to start both servers without killing processes

Write-Host "Starting Netlify Functions server on port 9999..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command cd '$PSScriptRoot'; npm run dev:functions"

Write-Host "Starting Vite frontend server on port 8888..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command cd '$PSScriptRoot'; npm run dev:frontend"

Write-Host "All servers started!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:8888" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:9999/.netlify/functions" -ForegroundColor Cyan
