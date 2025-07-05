# Start both backend and frontend servers in separate windows

# Start the backend server in a new window
Write-Host "Starting Netlify Functions server on port 9999..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev:functions"

# Wait a moment for the backend to initialize
Start-Sleep -Seconds 2

# Start the frontend server in a new window
Write-Host "Starting Vite frontend server on port 8888..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev:frontend"

Write-Host "All servers started in separate windows!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:8888" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:9999/.netlify/functions" -ForegroundColor Cyan
