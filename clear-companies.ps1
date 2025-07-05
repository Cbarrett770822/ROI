Write-Host "Clearing all companies from the database..." -ForegroundColor Yellow

# Navigate to the project directory
Set-Location -Path $PSScriptRoot

# Run the clear-companies.js script using Node.js
node scripts/clear-companies.js

Write-Host "Done! All companies have been removed from the database." -ForegroundColor Green
Write-Host "Users will now only see companies they create themselves." -ForegroundColor Green
Write-Host "Admin users will still be able to see all companies." -ForegroundColor Green
