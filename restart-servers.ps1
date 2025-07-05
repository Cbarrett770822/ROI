Write-Host "ROI Warehouse Management System - Server Restart Script" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Kill any processes on ports 8888 and 9999
Write-Host "`nStep 1: Killing any processes on ports 8888 and 9999..." -ForegroundColor Yellow
$ports = @(8888, 9999)
foreach ($port in $ports) {
    $processes = netstat -ano | Select-String ":$port\s" | ForEach-Object {
        ($_ -split '\s+')[-1]
    } | Select-Object -Unique
    
    foreach ($p in $processes) {
        if ($p -match '^\d+$' -and $p -ne "0") {
            try {
                $processName = (Get-Process -Id $p -ErrorAction SilentlyContinue).ProcessName
                Stop-Process -Id $p -Force
                Write-Host "  - Killed process $p ($processName) on port $port" -ForegroundColor Green
            } catch {
                $errorMsg = $_.Exception.Message
                Write-Host "  - Could not kill process $p on port $port" -ForegroundColor Red
            }
        }
    }
}

# 2. Start backend server (Netlify Functions)
Write-Host "`nStep 2: Starting backend server (Netlify Functions)..." -ForegroundColor Yellow
$backendProcess = Start-Process powershell -ArgumentList "cd 'D:\Cascade\ROI'; netlify dev --port 9999" -WindowStyle Normal -PassThru
Write-Host "  - Backend server starting on port 9999 (Process ID: $($backendProcess.Id))" -ForegroundColor Green

# 3. Wait a moment for backend to initialize
Write-Host "`nStep 3: Waiting for backend to initialize (5 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 4. Start frontend server (Vite/React)
Write-Host "`nStep 4: Starting frontend server..." -ForegroundColor Yellow
$frontendProcess = Start-Process powershell -ArgumentList "cd 'D:\Cascade\ROI'; npm run dev -- --port 8888" -WindowStyle Normal -PassThru
Write-Host "  - Frontend server starting on port 8888 (Process ID: $($frontendProcess.Id))" -ForegroundColor Green

# 5. Final instructions
Write-Host "`nServers Restarted!" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:8888" -ForegroundColor Green
Write-Host "Backend API: http://localhost:9999/.netlify/functions/" -ForegroundColor Green
Write-Host "Netlify Dev Proxy: http://localhost:9999" -ForegroundColor Green
Write-Host "`nIMPORTANT: For full-stack development with proper API routing," -ForegroundColor Yellow
Write-Host "use http://localhost:9999 in your browser." -ForegroundColor Yellow
Write-Host "`nPress Ctrl+C to stop this script (servers will continue running)" -ForegroundColor Cyan
