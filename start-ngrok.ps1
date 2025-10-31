# Script para iniciar servidor local y ngrok para KABSA Group
# Ejecutar: .\start-ngrok.ps1

$ErrorActionPreference = "Stop"

# Colores para la consola
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Green "=========================================="
Write-ColorOutput Green "  KABSA Group - Servidor ngrok"
Write-ColorOutput Green "=========================================="
Write-Output ""

# Puerto del servidor local
$port = 5500
$localUrl = "http://127.0.0.1:$port"

# Verificar si ngrok está instalado
Write-ColorOutput Yellow "Verificando ngrok..."
try {
    $ngrokVersion = ngrok version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "ngrok no encontrado"
    }
Write-ColorOutput Green "[OK] ngrok encontrado"
} catch {
    Write-ColorOutput Red "[ERROR] ngrok no está instalado o no está en el PATH"
    Write-Output "Instala ngrok desde: https://ngrok.com/download"
    Write-Output "O ejecuta: winget install ngrok.ngrok"
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Output ""

# Verificar authtoken de ngrok (ambas ubicaciones posibles)
Write-ColorOutput Yellow "Verificando configuracion de ngrok..."
function Test-NgrokToken {
    param([string]$Path)
    if (Test-Path $Path) {
        try {
            $content = Get-Content -Path $Path -Raw -ErrorAction Stop
            return ($content -match "authtoken:")
        } catch { return $false }
    }
    return $false
}
$configOld = Join-Path $env:USERPROFILE ".ngrok2\ngrok.yml"
$configNew = Join-Path $env:LOCALAPPDATA "ngrok\ngrok.yml"
$hasToken = (Test-NgrokToken -Path $configOld) -or (Test-NgrokToken -Path $configNew)
if (-not $hasToken) {
    Write-ColorOutput Yellow "[WARN] No se encontro authtoken configurado"
    Write-Output "Ejecuta: ngrok config add-authtoken TU_AUTHTOKEN"
    Write-Output "Obtén tu authtoken en: https://dashboard.ngrok.com/get-started/your-authtoken"
    Write-Output ""
    $continue = Read-Host "Deseas continuar de todos modos? (S/N)"
    if ($continue -ne "S" -and $continue -ne "s") { exit 1 }
}

Write-Output ""

# Cambiar al directorio del proyecto
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath
Write-ColorOutput Cyan "Directorio de trabajo: $scriptPath"
Write-Output ""

# Función para iniciar servidor con Python
function Start-PythonServer {
    Write-ColorOutput Yellow "Intentando iniciar servidor con Python..."
    $pythonCmd = $null
    
    # Buscar Python
    if (Get-Command python -ErrorAction SilentlyContinue) {
        $pythonCmd = "python"
    } elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
        $pythonCmd = "python3"
    }
    
    if ($pythonCmd) {
        Write-ColorOutput Green "[OK] Python encontrado: $pythonCmd"
        Start-Process -NoNewWindow -FilePath $pythonCmd -ArgumentList "-m", "http.server", $port
        Start-Sleep -Seconds 2
        try {
            $response = Invoke-WebRequest -Uri $localUrl -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
            Write-ColorOutput Green "[OK] Servidor iniciado en $localUrl"
            return $true
        } catch {
            Write-ColorOutput Yellow "[WARN] El servidor no responde aún"
        }
    }
    return $false
}

# Función para iniciar servidor con Node.js
function Start-NodeServer {
    Write-ColorOutput Yellow "Intentando iniciar servidor con Node.js..."
    if (Get-Command npx -ErrorAction SilentlyContinue) {
        Write-ColorOutput Green "[OK] Node.js/npx encontrado"
        Start-Process -NoNewWindow -FilePath "npx" -ArgumentList "http-server", ".", "-p", $port, "-c-1"
        Start-Sleep -Seconds 3
        try {
            $response = Invoke-WebRequest -Uri $localUrl -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
            Write-ColorOutput Green "[OK] Servidor iniciado en $localUrl"
            return $true
        } catch {
            Write-ColorOutput Yellow "[WARN] El servidor no responde aún"
        }
    }
    return $false
}

# Intentar iniciar servidor local
Write-ColorOutput Yellow "Iniciando servidor HTTP local..."
$serverStarted = $false

# Verificar si Live Server ya está corriendo
try {
    $response = Invoke-WebRequest -Uri $localUrl -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-ColorOutput Green "[OK] Ya hay un servidor corriendo en $localUrl (probablemente Live Server)"
    $serverStarted = $true
} catch {
    # Intentar iniciar servidor
    if (-not (Start-PythonServer)) {
        if (-not (Start-NodeServer)) {
            Write-ColorOutput Red "[ERROR] No se pudo iniciar un servidor HTTP"
            Write-Output ""
            Write-Output "Opciones:"
            Write-Output "1. Instala Python: winget install Python.Python.3"
            Write-Output "2. Instala Node.js: winget install OpenJS.NodeJS"
            Write-Output "3. Usa Live Server en VS Code"
            Write-Output ""
            Read-Host "Presiona Enter para salir"
            exit 1
        }
    }
    $serverStarted = $true
}

Write-Output ""

# Iniciar ngrok
Write-ColorOutput Yellow "Iniciando ngrok..."
Write-ColorOutput Cyan "URL local: $localUrl"
Write-Output ""

# Matar procesos de ngrok anteriores si existen
Get-Process -Name "ngrok" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Iniciar ngrok en una nueva ventana
Start-Process -FilePath "ngrok" -ArgumentList "http", $port, "--log=stdout"

Write-Output ""
Write-ColorOutput Green "=========================================="
Write-ColorOutput Green "  ngrok iniciado"
Write-ColorOutput Green "=========================================="
Write-Output ""
Write-ColorOutput Yellow "Esperando a que ngrok se inicie..."

# Esperar hasta 10 intentos a que la API responda y tenga un tunel https
$publicUrl = $null
for ($i=1; $i -le 10; $i++) {
    try {
        $ngrokApi = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -TimeoutSec 2 -ErrorAction Stop
        $publicUrl = $ngrokApi.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1 -ExpandProperty public_url
        if ($publicUrl) { break }
    } catch { }
    Start-Sleep -Seconds 1
}

if ($publicUrl) {
        Write-Output ""
        Write-ColorOutput Green "=========================================="
        Write-ColorOutput Green "  [OK] URL PÚBLICA DISPONIBLE"
        Write-ColorOutput Green "=========================================="
        Write-Output ""
        Write-ColorOutput Cyan "URL pública: $publicUrl"
        Write-Output ""
        Write-Output "Comparte esta URL con quien quieras mostrar la web."
        Write-Output ""
        Write-Output "Panel de ngrok: http://127.0.0.1:4040"
        Write-Output ""
        Write-Output "Para detener: Presiona Ctrl+C o cierra esta ventana"
        Write-Output ""
        
        # Copiar URL al portapapeles (opcional)
        try { Set-Clipboard -Value $publicUrl; Write-ColorOutput Green "[OK] URL copiada al portapapeles" } catch {}
} else {
    Write-ColorOutput Yellow "[WARN] No se pudo obtener la URL automaticamente"
    Write-Output "Verifica en: http://127.0.0.1:4040"
    Write-Output "O revisa la ventana de ngrok que se abrio"
}

Write-Output ""
Write-ColorOutput Yellow "Mantén esta ventana abierta mientras uses ngrok..."
Write-Output "Presiona Ctrl+C para detener todo"
Write-Output ""

# Mantener el script corriendo
try {
    while ($true) {
        Start-Sleep -Seconds 60
        # Verificar que el servidor sigue corriendo
        try {
            $response = Invoke-WebRequest -Uri $localUrl -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        } catch {
            Write-ColorOutput Red "[WARN] El servidor local dejó de responder"
            break
        }
    }
} catch {
    Write-Output ""
    Write-ColorOutput Yellow "Deteniendo..."
}

# Limpiar procesos al salir
Write-Output ""
Write-ColorOutput Yellow "Cerrando procesos..."
Get-Process -Name "ngrok" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Write-ColorOutput Green "[OK] Finalizado"


