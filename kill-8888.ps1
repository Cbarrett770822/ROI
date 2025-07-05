Write-Host "Killing processes on port 8888..."
$pids = netstat -ano | Select-String ":8888\s" | ForEach-Object {
    ($_ -split '\s+')[-1]
} | Select-Object -Unique
foreach ($p in $pids) {
    if ($p -match '^\d+$') {
        try {
            Stop-Process -Id $p -Force
            Write-Host "Killed process $p on port 8888"
        } catch {
            Write-Host "Could not kill process $p on port 8888"
        }
    }
}
