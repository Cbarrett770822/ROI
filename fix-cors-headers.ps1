# PowerShell script to fix missing event parameter in addCorsHeaders calls
$filePath = "D:\Cascade\ROI\netlify\functions\companies.js"
$content = Get-Content -Path $filePath -Raw

# Replace all instances of addCorsHeaders that are missing the event parameter
$updatedContent = $content -replace 'return addCorsHeaders\(\{([^}]+)\}\);', 'return addCorsHeaders({$1}, event);'

# Save the updated content back to the file
Set-Content -Path $filePath -Value $updatedContent

Write-Host "Updated all addCorsHeaders calls in companies.js to include the event parameter"
