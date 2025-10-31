# Guía rápida: Servidor ngrok para KABSA Group

## Requisitos previos

1. **Instalar ngrok:**
   ```powershell
   winget install ngrok.ngrok
   ```
   O descarga desde: https://ngrok.com/download

2. **Configurar authtoken (solo primera vez):**
   - Crea cuenta en: https://dashboard.ngrok.com/signup
   - Obtén tu authtoken en: https://dashboard.ngrok.com/get-started/your-authtoken
   - Ejecuta:
   ```powershell
   ngrok config add-authtoken TU_AUTHTOKEN_AQUI
   ```

3. **Instalar servidor HTTP (una de estas opciones):**
   - Python: `winget install Python.Python.3`
   - Node.js: `winget install OpenJS.NodeJS`
   - O usa Live Server en VS Code

## Uso del script

### Opción 1: Doble clic
Simplemente haz doble clic en `start-ngrok.ps1`

### Opción 2: Desde PowerShell
```powershell
cd C:\Users\yerct\KABSA
.\start-ngrok.ps1
```

### Opción 3: Ejecutar con permisos
Si aparece un error de permisos, ejecuta:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Qué hace el script

1. ✓ Verifica que ngrok esté instalado
2. ✓ Verifica la configuración de authtoken
3. ✓ Inicia un servidor HTTP local (Python, Node.js o detecta Live Server)
4. ✓ Inicia ngrok y expone tu sitio
5. ✓ Muestra la URL pública que puedes compartir
6. ✓ Copia la URL al portapapeles automáticamente

## URLs importantes

- **URL pública:** Se mostrará en la consola (ejemplo: `https://xxxxx.ngrok-free.app`)
- **Panel de ngrok:** http://127.0.0.1:4040
- **Servidor local:** http://127.0.0.1:5500

## Para detener

Presiona `Ctrl+C` en la ventana de PowerShell o simplemente ciérrala.

## Solución de problemas

### Error: "ngrok no encontrado"
- Instala ngrok: `winget install ngrok.ngrok`
- Asegúrate de que ngrok esté en el PATH

### Error: "No se pudo iniciar servidor HTTP"
- Instala Python: `winget install Python.Python.3`
- O usa Live Server en VS Code antes de ejecutar el script

### Error de permisos de ejecución
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### La URL no aparece
- Abre manualmente: http://127.0.0.1:4040
- Verifica que ngrok se haya iniciado correctamente

## Notas

- Mantén la ventana de PowerShell abierta mientras uses ngrok
- La URL pública cambia cada vez que reinicias ngrok (a menos que tengas cuenta Pro)
- La URL gratuita expira después de cierto tiempo de inactividad


