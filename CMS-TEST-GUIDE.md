# 🧪 Guía de Prueba del CMS KABSA GROUP

## Pasos para Probar el Sistema CMS

### 1. Acceder al CMS
1. Abre `admin-login.html` en tu navegador
2. Usuario: `admin`
3. Contraseña: `kabsa2025`
4. Deberías ser redirigido a `admin.html`

### 2. Probar la Edición de Contenido

#### Prueba Básica de Texto:
1. Ve a la sección **"Páginas"** en el menú lateral
2. Selecciona **"Inicio (index.html)"** del dropdown
3. Espera a que cargue el editor
4. Busca algún campo de texto (ej: título del hero)
5. Cambia el texto a algo como: "**KABSA GROUP - PRUEBA**"
6. Haz clic en **"Guardar Cambios"**
7. Deberías ver un mensaje: "¡Cambios guardados exitosamente!"
8. Abre la consola del navegador (F12) y verifica:
   - Deberías ver: "Iniciando guardado de página: index.html"
   - "Contenido obtenido: {...}"
   - "Guardando X elementos..."
   - "Guardado exitoso: {success: true}"
   - "Datos guardados en localStorage: {...}"

#### Verificar que se Guardó:
1. En la consola del navegador (F12), ejecuta:
```javascript
const stored = localStorage.getItem('cms_content_data');
console.log(JSON.parse(stored));
```
2. Deberías ver un objeto con `index.html` y los cambios guardados

#### Verificar que se Aplica:
1. Abre `index.html` en una nueva pestaña
2. Abre la consola (F12)
3. Deberías ver: "CMS: Aplicados X cambios de contenido a index.html"
4. El texto que cambiaste debería aparecer en la página

### 3. Probar Edición de Imágenes

1. En el CMS, selecciona una página con imágenes (ej: `empresas.html`)
2. Busca un campo de imagen en el editor
3. Cambia la URL a: `https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop`
4. Guarda los cambios
5. Abre la página en una nueva pestaña
6. La imagen debería haber cambiado

### 4. Usar la Página de Prueba

Abre `test-cms.html` en tu navegador para pruebas rápidas:
- Verifica que los módulos estén cargados
- Prueba guardado y lectura de localStorage
- Prueba aplicación de cambios
- Visualiza el contenido completo de localStorage

### 5. Verificar Errores Comunes

Si algo no funciona:

1. **Error: "Editor no encontrado"**
   - Asegúrate de haber seleccionado una página del dropdown
   - Espera a que el editor termine de cargar

2. **Error: "CMSEditor no está disponible"**
   - Recarga la página `admin.html`
   - Verifica que todos los scripts estén cargando (F12 → Network)

3. **Los cambios no se aplican**
   - Verifica que `content-applier.js` esté incluido en la página
   - Abre la consola y busca errores
   - Verifica que los selectores sean correctos

4. **Los cambios no se guardan**
   - Verifica que no haya errores en la consola
   - Revisa que localStorage esté habilitado en tu navegador
   - Intenta limpiar localStorage y volver a guardar

### 6. Limpiar Datos de Prueba

Para empezar de cero:
1. Abre la consola del navegador (F12)
2. Ejecuta:
```javascript
localStorage.removeItem('cms_content_data');
location.reload();
```

---

## ✅ Checklist de Funcionalidades

- [ ] Login funciona correctamente
- [ ] El selector de páginas carga el editor
- [ ] Los campos del editor muestran valores originales
- [ ] Al editar y guardar, se muestra mensaje de éxito
- [ ] Los datos se guardan en localStorage
- [ ] Los cambios se aplican automáticamente en las páginas
- [ ] El editor muestra valores guardados previamente
- [ ] Las imágenes se pueden editar
- [ ] Los textos se pueden editar
- [ ] Las listas se pueden editar

---

## 📊 Estructura de Datos Guardados

```javascript
{
  "index.html": {
    "hero-title-0": {
      "value": "Nuevo Título",
      "type": "text",
      "selector": "#inicio > h1"
    },
    "hero-image-0": {
      "value": "https://...",
      "type": "image",
      "selector": "#hero-slider img:nth-of-type(1)"
    },
    "lastModified": "2025-01-15T10:30:00.000Z"
  }
}
```

