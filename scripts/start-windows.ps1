param(
    [string]$ContainerName = "prelegal",
    [string]$ImageName     = "prelegal:latest",
    [string]$VolumeName    = "prelegal-data",
    [string]$HostPort      = "8000"
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$RepoRoot  = Resolve-Path "$ScriptDir\.."

Write-Host "[prelegal] Building image $ImageName ..."
docker build -t $ImageName $RepoRoot

# Stop and remove existing container if present (idempotent restart)
$null = docker inspect $ContainerName 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[prelegal] Stopping existing container '$ContainerName' ..."
    docker stop $ContainerName | Out-Null
    docker rm   $ContainerName | Out-Null
}

# Create named volume if absent
docker volume inspect $VolumeName 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[prelegal] Creating volume '$VolumeName' ..."
    docker volume create $VolumeName | Out-Null
}

Write-Host "[prelegal] Starting container '$ContainerName' on port $HostPort ..."
docker run -d `
    --name $ContainerName `
    -p "${HostPort}:8000" `
    -v "${VolumeName}:/data" `
    $ImageName

Write-Host "[prelegal] Running at http://localhost:$HostPort"
Write-Host "[prelegal] Health:  http://localhost:$HostPort/api/health"
