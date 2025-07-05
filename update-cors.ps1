Write-Host "ROI Warehouse Management System - CORS Update Script" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. First, let's kill any running servers
Write-Host "`nStep 1: Killing any processes on ports 8888 and 9999..." -ForegroundColor Yellow
$ports = @(8888, 9999)
foreach ($port in $ports) {
    $processes = netstat -ano | Select-String ":$port\s" | ForEach-Object {
        ($_ -split '\s+')[-1]
    } | Select-Object -Unique
    
    foreach ($p in $processes) {
        if ($p -match '^\d+$' -and $p -ne "0") {
            try {
                $processName = (Get-Process -Id $p -ErrorAction SilentlyContinue).ProcessName
                Stop-Process -Id $p -Force
                Write-Host "  - Killed process $p ($processName) on port $port" -ForegroundColor Green
            } catch {
                Write-Host "  - Could not kill process $p on port $port" -ForegroundColor Red
            }
        }
    }
}

# 2. Create a new, improved corsHeaders.js file
Write-Host "`nStep 2: Creating improved CORS headers utility..." -ForegroundColor Yellow
$corsHeadersPath = "D:\Cascade\ROI\netlify\functions\utils\corsHeaders.js"

$corsHeadersContent = @'
// CORS headers utility for Netlify Functions
// This provides consistent CORS headers across all API endpoints

/**
 * Generate CORS headers based on the request event
 * @param {Object} event - The Netlify Functions event object
 * @returns {Object} - CORS headers object
 */
const getCorsHeaders = (event) => {
  // Get origin from request headers or default to localhost:8888
  const origin = event && event.headers && event.headers.origin;
  
  // Allow both development ports and production URLs
  const allowedOrigins = ['http://localhost:8888', 'http://localhost:8889', 'http://localhost:9999'];
  
  // Use the requesting origin if it's allowed, otherwise default to localhost:8888
  const allowedOrigin = origin && allowedOrigins.includes(origin)
    ? origin
    : 'http://localhost:8888';
    
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Cache-Control, Pragma',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };
};

/**
 * Handle CORS preflight requests
 * @param {Object} event - The Netlify Functions event object
 * @returns {Object|null} - Response object for OPTIONS requests or null
 */
const handleCors = (event) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('[CORS] Handling preflight request from origin:', event.headers.origin);
    return {
      statusCode: 204,
      headers: getCorsHeaders(event),
      body: ''
    };
  }
  return null;
};

/**
 * Add CORS headers to any response object
 * @param {Object} response - The response object
 * @param {Object} event - The Netlify Functions event object
 * @returns {Object} - Response with CORS headers added
 */
const addCorsHeaders = (response, event) => {
  if (!event) {
    console.warn('[CORS] Warning: No event object provided to addCorsHeaders');
  }
  
  return {
    ...response,
    headers: {
      ...response.headers,
      ...getCorsHeaders(event)
    }
  };
};

module.exports = {
  getCorsHeaders,
  handleCors,
  addCorsHeaders
};
'@

Set-Content -Path $corsHeadersPath -Value $corsHeadersContent
Write-Host "  - Created improved CORS headers utility at $corsHeadersPath" -ForegroundColor Green

# 3. Create a withCors middleware
Write-Host "`nStep 3: Creating withCors middleware..." -ForegroundColor Yellow
$withCorsPath = "D:\Cascade\ROI\netlify\functions\utils\withCors.js"

$withCorsContent = @'
const { getCorsHeaders, handleCors, addCorsHeaders } = require('./corsHeaders');

/**
 * Middleware to add CORS support to Netlify Functions
 * @param {Function} handler - The original handler function
 * @returns {Function} - Enhanced handler with CORS support
 */
const withCors = (handler) => {
  return async (event, context) => {
    // Handle preflight requests
    const corsResponse = handleCors(event);
    if (corsResponse) {
      return corsResponse;
    }
    
    try {
      // Call the original handler
      const response = await handler(event, context);
      
      // Add CORS headers to the response
      return addCorsHeaders(response, event);
    } catch (error) {
      console.error('[withCors] Error in handler:', error);
      
      // Return error with CORS headers
      return addCorsHeaders({
        statusCode: 500,
        body: JSON.stringify({ 
          message: 'Server error', 
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
      }, event);
    }
  };
};

module.exports = withCors;
'@

Set-Content -Path $withCorsPath -Value $withCorsContent
Write-Host "  - Created withCors middleware at $withCorsPath" -ForegroundColor Green

# 4. Update the auth-login.js file to use the new CORS middleware
Write-Host "`nStep 4: Updating auth-login.js to use the new CORS middleware..." -ForegroundColor Yellow
$authLoginPath = "D:\Cascade\ROI\netlify\functions\auth-login.js"

if (Test-Path $authLoginPath) {
    $authLoginContent = Get-Content $authLoginPath -Raw
    
    # Check if we need to update the file
    if ($authLoginContent -match "const \{ corsHeaders, handleCors, addCorsHeaders \}") {
        $updatedAuthLogin = $authLoginContent -replace "const \{ corsHeaders, handleCors, addCorsHeaders \} = require\(`"./utils/corsHeaders`"\);", "const withCors = require(`"./utils/withCors`");"
        
        # Update the export handler line
        $updatedAuthLogin = $updatedAuthLogin -replace "exports\.handler = async function\(event, context\)", "const handler = async function(event, context)"
        
        # Add the withCors wrapper at the end
        if ($updatedAuthLogin -match "module\.exports") {
            $updatedAuthLogin = $updatedAuthLogin -replace "module\.exports = \{[^}]*\};", ""
        }
        
        if (!($updatedAuthLogin -match "exports\.handler = withCors\(handler\);")) {
            $updatedAuthLogin += "`n`n// Export the handler with CORS middleware`nexports.handler = withCors(handler);"
        }
        
        # Remove any existing CORS handling
        $updatedAuthLogin = $updatedAuthLogin -replace "const corsResponse = handleCors\(event\);[\s\S]*?if \(corsResponse\) \{[\s\S]*?return corsResponse;[\s\S]*?\}", ""
        $updatedAuthLogin = $updatedAuthLogin -replace "return addCorsHeaders\(\{", "return {"
        $updatedAuthLogin = $updatedAuthLogin -replace "return addCorsHeaders\(response", "return response"
        $updatedAuthLogin = $updatedAuthLogin -replace "\}\);", "};"
        
        Set-Content -Path $authLoginPath -Value $updatedAuthLogin
        Write-Host "  - Updated auth-login.js to use the new CORS middleware" -ForegroundColor Green
    } else {
        Write-Host "  - auth-login.js doesn't match the expected pattern, skipping" -ForegroundColor Yellow
    }
} else {
    Write-Host "  - auth-login.js not found at $authLoginPath" -ForegroundColor Red
}

# 5. Restart the servers with the new CORS configuration
Write-Host "`nStep 5: Starting servers with new CORS configuration..." -ForegroundColor Yellow
Write-Host "  - Starting backend server (Netlify Functions)..." -ForegroundColor Yellow
$backendProcess = Start-Process powershell -ArgumentList "cd 'D:\Cascade\ROI'; netlify dev --port 9999" -WindowStyle Normal -PassThru
Write-Host "  - Backend server starting on port 9999 (Process ID: $($backendProcess.Id))" -ForegroundColor Green

# Wait a moment for backend to initialize
Write-Host "  - Waiting for backend to initialize (5 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start frontend server
Write-Host "  - Starting frontend server..." -ForegroundColor Yellow
$frontendProcess = Start-Process powershell -ArgumentList "cd 'D:\Cascade\ROI'; npm run dev -- --port 8888" -WindowStyle Normal -PassThru
Write-Host "  - Frontend server starting on port 8888 (Process ID: $($frontendProcess.Id))" -ForegroundColor Green

# 6. Final instructions
Write-Host "`nCORS Update Complete!" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host "The CORS configuration has been updated to allow requests from:" -ForegroundColor Green
Write-Host "  - http://localhost:8888" -ForegroundColor Green
Write-Host "  - http://localhost:8889" -ForegroundColor Green
Write-Host "  - http://localhost:9999" -ForegroundColor Green
Write-Host "`nFrontend: http://localhost:8888" -ForegroundColor Green
Write-Host "Backend API: http://localhost:9999/.netlify/functions/" -ForegroundColor Green
Write-Host "Netlify Dev Proxy: http://localhost:9999" -ForegroundColor Green
Write-Host "`nIMPORTANT: For full-stack development with proper API routing," -ForegroundColor Yellow
Write-Host "use http://localhost:9999 in your browser." -ForegroundColor Yellow
Write-Host "`nPress Ctrl+C to stop this script (servers will continue running)" -ForegroundColor Cyan
