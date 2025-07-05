# Start the backend server in a new PowerShell window
Write-Host "Starting Netlify Functions server in a new window..." -ForegroundColor Green

# Start a new PowerShell window with the netlify dev command
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; netlify dev --port 9999"

Write-Host "Backend server started in a new window." -ForegroundColor Green
Write-Host "Backend API URL: http://localhost:9999/.netlify/functions/" -ForegroundColor Cyan
