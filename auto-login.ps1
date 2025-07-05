# PowerShell script to automatically login with default credentials
Write-Host "ROI Warehouse Management System - Auto Login Script" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$username = "admin"
$password = "admin123"

$loginData = @{
    username = $username
    password = $password
} | ConvertTo-Json

Write-Host "Logging in as $username..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:9999/.netlify/functions/auth-login" -Method POST -Body $loginData -ContentType "application/json"
    
    $responseBody = $response.Content | ConvertFrom-Json
    
    if ($responseBody.token) {
        # Save token to file
        $responseBody.token | Out-File -FilePath "D:\Cascade\ROI\token.txt"
        
        Write-Host "Login successful! Token saved to token.txt" -ForegroundColor Green
        Write-Host "Token: $($responseBody.token)" -ForegroundColor Green
        
        # Also save user info
        $userInfo = @{
            username = $username
            role = $responseBody.role
            token = $responseBody.token
        } | ConvertTo-Json
        
        $userInfo | Out-File -FilePath "D:\Cascade\ROI\user-info.json"
        
        Write-Host "User info saved to user-info.json" -ForegroundColor Green
    }
    else {
        Write-Host "Login failed: No token received in response" -ForegroundColor Red
        Write-Host "Response: $($response.Content)" -ForegroundColor Red
    }
}
catch {
    Write-Host "Login failed with error:" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
    else {
        Write-Host "Error Details: $_" -ForegroundColor Red
    }
}
