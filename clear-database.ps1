Write-Host "ROI Warehouse Management System - Database Cleanup Script" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# 1. Get stored token from localStorage (if available)
Write-Host "`nStep 1: Retrieving authentication token..." -ForegroundColor Yellow

# Path to a temporary HTML file that will extract the token from localStorage
$tempHtmlPath = "D:\Cascade\ROI\temp-token-extractor.html"

# Create a temporary HTML file to extract the token
$htmlContent = @"
<!DOCTYPE html>
<html>
<head>
    <title>Token Extractor</title>
    <script>
        function extractToken() {
            const token = localStorage.getItem('authToken');
            document.getElementById('tokenOutput').value = token || '';
            document.getElementById('tokenForm').submit();
        }
    </script>
</head>
<body onload="extractToken()">
    <form id="tokenForm" method="POST" action="about:blank">
        <input type="hidden" id="tokenOutput" name="token">
    </form>
    <p>Extracting token from localStorage...</p>
</body>
</html>
"@

Set-Content -Path $tempHtmlPath -Value $htmlContent

# Prompt for manual token entry
Write-Host "  - Please enter your authentication token (or press Enter to use browser localStorage):" -ForegroundColor Yellow
$manualToken = Read-Host

if ([string]::IsNullOrEmpty($manualToken)) {
    Write-Host "  - No token provided manually. Please login to the application first." -ForegroundColor Yellow
    Write-Host "  - Opening browser to extract token from localStorage..." -ForegroundColor Yellow
    Start-Process "http://localhost:9999"
    
    # Wait for user to confirm they've logged in
    Write-Host "`nPlease confirm when you've logged into the application (press Enter):" -ForegroundColor Yellow
    Read-Host | Out-Null
    
    Write-Host "  - Please copy your token from the browser's localStorage (Application tab in DevTools)" -ForegroundColor Yellow
    $token = Read-Host "Paste token here"
} else {
    $token = $manualToken
    Write-Host "  - Using provided token" -ForegroundColor Green
}

# Remove the temporary HTML file
if (Test-Path $tempHtmlPath) {
    Remove-Item $tempHtmlPath
}

if ([string]::IsNullOrEmpty($token)) {
    Write-Host "`nNo token provided. Cannot proceed with database cleanup." -ForegroundColor Red
    exit 1
}

# 2. Call the clear-data API endpoint
Write-Host "`nStep 2: Clearing database..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:9999/.netlify/functions/clear-data" -Method GET -Headers $headers
    
    Write-Host "`nDatabase Cleared Successfully!" -ForegroundColor Green
    Write-Host "===========================" -ForegroundColor Green
    Write-Host "Deleted Companies: $($response.deletedCompanies)" -ForegroundColor Green
    Write-Host "Deleted Questionnaires: $($response.deletedQuestionnaires)" -ForegroundColor Green
} catch {
    Write-Host "`nError clearing database:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $responseBody = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($responseBody)
        $responseContent = $reader.ReadToEnd()
        Write-Host "Response: $responseContent" -ForegroundColor Red
    }
}

Write-Host "`nScript completed." -ForegroundColor Cyan
