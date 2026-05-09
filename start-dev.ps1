# Cursor Clone Development Servers PowerShell Script
# Usage: .\start-dev.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Cursor Clone Development Servers" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend node_modules exists
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

# Check if frontend node_modules exists
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

Write-Host ""
Write-Host "Starting development servers..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend will run on: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend will run on: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host ""

# Start backend server
$backend = Start-Job -ScriptBlock {
    Set-Location backend
    npm run dev
}

# Start frontend server
$frontend = Start-Job -ScriptBlock {
    Set-Location frontend
    npm run dev
}

# Monitor and display output
while ($true) {
    # Check backend output
    $backendOutput = Receive-Job -Job $backend -ErrorAction SilentlyContinue
    if ($backendOutput) {
        Write-Host "[BACKEND]" -ForegroundColor Green -NoNewline
        Write-Host " $backendOutput"
    }
    
    # Check frontend output
    $frontendOutput = Receive-Job -Job $frontend -ErrorAction SilentlyContinue
    if ($frontendOutput) {
        Write-Host "[FRONTEND]" -ForegroundColor Blue -NoNewline
        Write-Host " $frontendOutput"
    }
    
    # Check if jobs are still running
    if ($backend.State -eq "Failed" -or $frontend.State -eq "Failed") {
        Write-Host "One or more servers failed to start!" -ForegroundColor Red
        break
    }
    
    if ($backend.State -eq "Completed" -or $frontend.State -eq "Completed") {
        Write-Host "One or more servers completed." -ForegroundColor Yellow
        break
    }
    
    Start-Sleep -Milliseconds 100
}

# Cleanup jobs
Remove-Job -Job $backend -Force
Remove-Job -Job $frontend -Force

Write-Host ""
Write-Host "Servers stopped." -ForegroundColor Yellow
