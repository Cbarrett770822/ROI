# PowerShell script to test the users API endpoint
$token = Get-Content -Path "D:\Cascade\ROI\token.txt" -ErrorAction SilentlyContinue

if (-not $token) {
    Write-Host "No token found in token.txt. Please login first and save your token." -ForegroundColor Red
    exit 1
}

Write-Host "Testing users API endpoint..." -ForegroundColor Cyan

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:9999/.netlify/functions/users" -Headers $headers -Method GET
    
    Write-Host "Response Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response Headers:" -ForegroundColor Yellow
    $response.Headers | Format-Table -AutoSize
    
    Write-Host "Response Body:" -ForegroundColor Yellow
    $responseBody = $response.Content | ConvertFrom-Json
    $responseBody | ConvertTo-Json -Depth 4
}
catch {
    Write-Host "Error accessing users API:" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
    else {
        Write-Host "Error Details: $_" -ForegroundColor Red
    }
}
