# This script sets PowerShell execution policy for the current user to allow Netlify CLI scripts to run
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
Write-Host "PowerShell execution policy set to RemoteSigned for CurrentUser. You can now run 'netlify dev'."
