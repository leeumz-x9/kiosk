# run_local.ps1 - Create venv and run the simulated server on Windows
# Usage: Open PowerShell, cd to this folder and run: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; .\run_local.ps1

try {
    py -3 --version > $null 2>&1
} catch {
    Write-Error "Python launcher 'py' not found. Install Python 3 from https://python.org and ensure the 'py' launcher is available."
    exit 1
}

$venvPath = Join-Path $PSScriptRoot 'venv'
if (-not (Test-Path $venvPath)) {
    Write-Host "Creating virtual environment..."
    py -3 -m venv $venvPath
}

Write-Host "Upgrading pip and installing dependencies..."
& "$venvPath\Scripts\python" -m pip install -U pip
& "$venvPath\Scripts\python" -m pip install flask flask-cors opencv-python

Write-Host "Starting local camera server (http://localhost:5000)..."
Write-Host "Stream: http://localhost:5000/api/camera/stream"
Write-Host "Detect: http://localhost:5000/api/camera/detect"
& "$venvPath\Scripts\python" "$PSScriptRoot\app_local_camera.py"
