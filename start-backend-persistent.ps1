# Start the backend server and keep it running
Write-Host "Starting Netlify Functions server on port 9999..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow

# Use the -NoExit parameter to keep the process running
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev:functions"

Write-Host "Backend server started in a new window!" -ForegroundColor Green
