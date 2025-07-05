# PowerShell script to kill processes on ports 8888 and 9999, then start backend and frontend servers

$ports = @(8888, 9999)
foreach ($port in $ports) {
    $pid = netstat -ano | Select-String ":$port\s" | ForEach-Object {
        ($_ -split '\s+')[-1]
    } | Select-Object -Unique
    foreach ($p in $pid) {
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

# Start backend (adjust the command and path as needed)
Start-Process powershell -ArgumentList "cd 'D:\Cascade\ROI'; netlify dev; pause" -WindowStyle Normal
