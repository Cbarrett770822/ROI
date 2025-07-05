Write-Host "ROI Warehouse Management System - Database Cleanup (DEV MODE)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# Call the clear-data-dev API endpoint
Write-Host "`nClearing database (development mode)..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:9999/.netlify/functions/clear-data-dev" -Method GET
    
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
