param(
    [string]$ContainerName = "prelegal"
)

$ErrorActionPreference = "Stop"

$null = docker inspect $ContainerName 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[prelegal] Stopping container '$ContainerName' ..."
    docker stop $ContainerName | Out-Null
    docker rm   $ContainerName | Out-Null
    Write-Host "[prelegal] Stopped."
} else {
    Write-Host "[prelegal] No container named '$ContainerName' is running."
}

# Volume 'prelegal-data' is intentionally retained so SQLite data persists between runs.
# To wipe data: docker volume rm prelegal-data
