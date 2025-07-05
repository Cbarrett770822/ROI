# PowerShell script to restart servers and test API endpoints

Write-Host "Stopping any existing Node.js processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Stopping process with ID $($_.Id)..." -ForegroundColor Gray
    Stop-Process -Id $_.Id -Force
}

Write-Host "Starting Netlify Functions server on port 9999..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command cd '$PSScriptRoot'; npm run dev:functions"

Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Testing CORS headers on API endpoints..." -ForegroundColor Cyan
node test-cors.js

Write-Host "Starting Vite frontend server on port 8888..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command cd '$PSScriptRoot'; npm run dev:frontend"

Write-Host "All servers started and tests completed!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:8888" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:9999/.netlify/functions" -ForegroundColor Cyan
