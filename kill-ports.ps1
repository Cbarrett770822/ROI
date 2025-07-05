Write-Host "Script started"
$ports = @(8888, 9999)
foreach ($port in $ports) {
    $pids = netstat -ano | Select-String ":$port\s" | ForEach-Object {
        ($_ -split '\s+')[-1]
    } | Select-Object -Unique
    foreach ($p in $pids) {
        if ($p -match '^\d+$') {
            try {
                Stop-Process -Id $p -Force
                Write-Host "Killed process $p on port $port"
            } catch {
                Write-Host "Could not kill process $p on port $port"
            }
        }
    }
}
