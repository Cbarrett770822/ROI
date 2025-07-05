# ROI Warehouse Management System - API Diagnostics Script
Write-Host "ROI Warehouse Management System - API Diagnostics" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Step 1: Check if token exists
Write-Host "`n[1] Checking for authentication token..." -ForegroundColor Yellow
$token = Get-Content -Path "D:\Cascade\ROI\token.txt" -ErrorAction SilentlyContinue

if (-not $token) {
    Write-Host "  No token found in token.txt. Running auto-login..." -ForegroundColor Red
    & "D:\Cascade\ROI\auto-login.ps1"
    $token = Get-Content -Path "D:\Cascade\ROI\token.txt" -ErrorAction SilentlyContinue
    
    if (-not $token) {
        Write-Host "  Failed to obtain token. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host "  Token found: $($token.Substring(0, 20))..." -ForegroundColor Green

# Step 2: Test CORS preflight for users endpoint
Write-Host "`n[2] Testing CORS preflight for users endpoint..." -ForegroundColor Yellow
try {
    $preflightResponse = Invoke-WebRequest -Uri "http://localhost:9999/.netlify/functions/users" -Method OPTIONS -Headers @{
        "Origin" = "http://localhost:8888"
        "Access-Control-Request-Method" = "GET"
        "Access-Control-Request-Headers" = "Authorization, Content-Type"
    }
    
    Write-Host "  CORS preflight response status: $($preflightResponse.StatusCode)" -ForegroundColor Green
    Write-Host "  CORS headers:" -ForegroundColor Green
    $corsHeaders = $preflightResponse.Headers | Where-Object { $_.Key -like "Access-Control-*" }
    $corsHeaders | ForEach-Object { Write-Host "    $($_.Key): $($_.Value)" -ForegroundColor Green }
}
catch {
    Write-Host "  CORS preflight request failed:" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Test users endpoint with token
Write-Host "`n[3] Testing users endpoint with token..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-WebRequest -Uri "http://localhost:9999/.netlify/functions/users" -Headers $headers -Method GET
    
    Write-Host "  Users API response status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "  Response content type: $($response.Headers['Content-Type'])" -ForegroundColor Green
    
    # Parse and display users
    $users = ($response.Content | ConvertFrom-Json).users
    Write-Host "  Found $($users.Count) users:" -ForegroundColor Green
    $users | ForEach-Object {
        Write-Host "    - $($_.username) (Role: $($_.role))" -ForegroundColor Green
    }
}
catch {
    Write-Host "  Users API request failed:" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "  Response: $responseBody" -ForegroundColor Red
    }
    else {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Step 4: Check frontend localStorage for token
Write-Host "`n[4] Creating localStorage test script..." -ForegroundColor Yellow
$localStorageTestScript = @"
// Test script to check localStorage token
const token = localStorage.getItem('token');
console.log('Token in localStorage:', token ? 'Found' : 'Not found');
if (token) {
  try {
    // Try parsing it as JSON
    const parsedToken = JSON.parse(token);
    console.log('Token is stored as JSON object:', parsedToken);
  } catch (e) {
    console.log('Token is stored as string:', token);
  }
}

// Test fetching users
async function testFetchUsers() {
  console.log('Testing fetch to users endpoint...');
  try {
    // Get token from localStorage
    let authToken = localStorage.getItem('token');
    try {
      // Try parsing it as JSON
      authToken = JSON.parse(authToken);
    } catch {}
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${authToken}\`
    };
    
    console.log('Request headers:', headers);
    
    const response = await fetch('/.netlify/functions/users', { 
      method: 'GET',
      headers: headers
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
    
    const contentType = response.headers.get('content-type');
    console.log('Response content type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Response data:', data);
    } else {
      const text = await response.text();
      console.log('Response text:', text);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testFetchUsers();
"@

$localStorageTestScript | Out-File -FilePath "D:\Cascade\ROI\public\test-localStorage.js" -Encoding utf8

Write-Host "  Created localStorage test script at D:\Cascade\ROI\public\test-localStorage.js" -ForegroundColor Green
Write-Host "  Open the browser console and run this script to test localStorage token and API fetch" -ForegroundColor Yellow

# Step 5: Create a simple HTML test page
Write-Host "`n[5] Creating HTML test page..." -ForegroundColor Yellow
$htmlTestPage = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ROI API Test</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    button { padding: 10px; margin: 5px; cursor: pointer; }
    pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow: auto; }
    .success { color: green; }
    .error { color: red; }
  </style>
</head>
<body>
  <h1>ROI API Test Page</h1>
  
  <div>
    <h2>Authentication</h2>
    <div>
      <input type="text" id="username" placeholder="Username" value="admin">
      <input type="password" id="password" placeholder="Password" value="admin123">
      <button onclick="login()">Login</button>
    </div>
    <pre id="auth-result"></pre>
  </div>
  
  <div>
    <h2>API Tests</h2>
    <button onclick="testUsers()">Test Users API</button>
    <pre id="api-result"></pre>
  </div>
  
  <script>
    // Login function
    async function login() {
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const authResult = document.getElementById('auth-result');
      
      try {
        authResult.textContent = 'Logging in...';
        
        const response = await fetch('/.netlify/functions/auth-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.token) {
          localStorage.setItem('token', data.token);
          authResult.className = 'success';
          authResult.textContent = `Login successful! Token: ${data.token.substring(0, 20)}...`;
        } else {
          authResult.className = 'error';
          authResult.textContent = `Login failed: ${JSON.stringify(data)}`;
        }
      } catch (error) {
        authResult.className = 'error';
        authResult.textContent = `Error: ${error.message}`;
      }
    }
    
    // Test Users API
    async function testUsers() {
      const apiResult = document.getElementById('api-result');
      
      try {
        apiResult.textContent = 'Fetching users...';
        
        const token = localStorage.getItem('token');
        if (!token) {
          apiResult.className = 'error';
          apiResult.textContent = 'No token found. Please login first.';
          return;
        }
        
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };
        
        apiResult.textContent += `\nRequest headers: ${JSON.stringify(headers, null, 2)}`;
        
        const response = await fetch('/.netlify/functions/users', {
          method: 'GET',
          headers: headers
        });
        
        apiResult.textContent += `\nResponse status: ${response.status}`;
        
        const contentType = response.headers.get('content-type');
        apiResult.textContent += `\nResponse content type: ${contentType}`;
        
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          apiResult.className = 'success';
          apiResult.textContent += `\nUsers: ${JSON.stringify(data, null, 2)}`;
        } else {
          const text = await response.text();
          apiResult.className = 'error';
          apiResult.textContent += `\nNon-JSON response: ${text}`;
        }
      } catch (error) {
        apiResult.className = 'error';
        apiResult.textContent += `\nError: ${error.message}`;
      }
    }
  </script>
</body>
</html>
"@

$htmlTestPage | Out-File -FilePath "D:\Cascade\ROI\public\api-test.html" -Encoding utf8

Write-Host "  Created HTML test page at D:\Cascade\ROI\public\api-test.html" -ForegroundColor Green
Write-Host "  Access this page at http://localhost:9999/api-test.html to test the API" -ForegroundColor Yellow

# Final instructions
Write-Host "`nDiagnostics Complete!" -ForegroundColor Cyan
Write-Host "To further diagnose the issue:" -ForegroundColor Yellow
Write-Host "1. Access the test page at http://localhost:9999/api-test.html" -ForegroundColor Yellow
Write-Host "2. Open browser developer tools (F12) to monitor network requests and console output" -ForegroundColor Yellow
Write-Host "3. Try logging in and testing the users API from the test page" -ForegroundColor Yellow
Write-Host "4. Check for any CORS errors or authentication issues in the console" -ForegroundColor Yellow
