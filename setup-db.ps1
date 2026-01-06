# PowerShell script to setup Realtime Database
# This script uses Firebase REST API to create a database instance

$projectId = "smart-papr-kiosk"
$apiKey = ""  # Will be retrieved from config

# Get the web API key from Firebase config
Write-Host "Setting up Realtime Database..."
Write-Host "Project ID: $projectId"

# Try using firebase CLI directly with explicit configuration
Write-Host "Creating database instance..."
firebase database:instances:create $projectId --project=$projectId

Write-Host "Database setup complete!"
