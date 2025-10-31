# 📘 CMS KABSA GROUP - Documentación de Uso

## 🚀 Inicio Rápido

### Acceso al CMS
1. Navega a `admin-login.html` en tu navegador
2. Usuario por defecto: `admin`
3. Contraseña por defecto: `kabsa2025`

### Estructura del CMS
- **admin-login.html**: Página de inicio de sesión
- **admin.html**: Panel principal de administración
- **assets/cms/**: Módulos JavaScript del sistema

---

## 📖 Guía de Uso

### 1. Dashboard
El dashboard muestra:
- Estadísticas generales (total de páginas, última edición, medios)
- Accesos rápidos a páginas comunes

### 2. Gestión de Páginas

#### Cómo editar una página:
1. Ve a la sección "Páginas"
2. Selecciona una página del dropdown
3. El editor mostrará todos los elementos editables
4. Haz tus cambios en los campos de texto/URL
5. Haz clic en "Guardar Cambios"

#### Elementos editables por página:
- **Textos**: Títulos, párrafos, descripciones
- **Imágenes**: URLs de imágenes (puedes seleccionar de la biblioteca o usar URLs externas)
- **Listas**: Elementos de listas (cada línea es un elemento)

### 3. Gestor de Medios

#### Subir imágenes/videos:
1. Ve a la sección "Medios"
2. Selecciona la pestaña "Imágenes" o "Videos"
3. Haz clic en "Elegir archivo"
4. Selecciona tu archivo
5. Haz clic en "Subir"

#### Usar medios en páginas:
1. Al editar una imagen en una página
2. Haz clic en "Seleccionar de Biblioteca"
3. Elige la imagen deseada

### 4. Navegación
Edita el menú de navegación y el footer desde esta sección.

### 5. Configuración

#### Cambiar credenciales:
- Haz clic en "Cambiar Usuario/Contraseña"
- Ingresa las nuevas credenciales

#### Backup y Restauración:
- **Exportar**: Descarga un archivo JSON con todo el contenido
- **Importar**: Restaura desde un archivo JSON de backup

---

## 🔧 Configuración Avanzada

### Personalizar Mapeo de Elementos Editables

El mapeo de qué elementos son editables se define en `assets/cms/editor.js`, función `getPageMap()`.

Ejemplo para agregar más elementos editables:

```javascript
'index.html': {
    sections: [
        { id: 'nuevo-elemento', selector: '#mi-seccion h2', type: 'text', label: 'Mi Nuevo Elemento' },
        // ... más elementos
    ]
}
```

### Almacenamiento

**Estado Actual (Desarrollo):**
- Los cambios se guardan en `localStorage` del navegador
- Los medios subidos se convierten a Base64 (limitado por tamaño)

**Para Producción:**
Se recomienda implementar:
1. **Backend API**: Servidor que maneje autenticación y almacenamiento
2. **Base de Datos**: Guardar contenido en BD (MySQL, PostgreSQL, MongoDB)
3. **Almacenamiento de Archivos**: Servidor de archivos o cloud storage (AWS S3, Cloudinary)
4. **Sistema de Versiones**: Historial de cambios y capacidad de revertir

---

## 🛠️ Arquitectura Técnica

### Módulos del CMS

1. **auth.js**: Autenticación y gestión de sesiones
2. **admin.js**: Lógica principal del panel y navegación
3. **editor.js**: Editor de contenido y mapeo de elementos
4. **media-manager.js**: Gestión de imágenes y videos
5. **api.js**: Comunicación con backend/almacenamiento

### Flujo de Edición

```
Usuario → admin.html → Selecciona página → editor.js carga HTML
→ Identifica elementos editables → Usuario edita → Guarda
→ api.js persiste cambios → localStorage/Backend
```

---

## 📝 Notas Importantes

### Limitaciones Actuales
- El almacenamiento en localStorage tiene límites de tamaño (~5-10MB)
- Las imágenes en Base64 pueden ser muy grandes
- No hay sistema de versiones implementado
- Los cambios son solo en el navegador actual

### Mejoras Recomendadas para Producción

1. **Backend REST API**
   - Endpoints para CRUD de contenido
   - Autenticación JWT
   - Validación de datos

2. **Base de Datos**
   - Tabla de páginas
   - Tabla de contenido (textos, imágenes, etc.)
   - Tabla de medios
   - Tabla de usuarios

3. **Sistema de Archivos**
   - Subida directa de archivos al servidor
   - Generación de URLs públicas
   - Optimización de imágenes

4. **Sistema de Versiones**
   - Historial de cambios
   - Capacidad de revertir
   - Comparación de versiones

5. **Seguridad**
   - Validación de tipos de archivo
   - Sanitización de contenido HTML
   - Protección CSRF
   - Rate limiting

---

## 🆘 Solución de Problemas

### No puedo iniciar sesión
- Verifica que las credenciales sean correctas
- Revisa la consola del navegador para errores
- Limpia el localStorage y vuelve a intentar

### Los cambios no se guardan
- Verifica que tengas permisos de escritura
- Revisa la consola para errores de JavaScript
- Verifica el espacio disponible en localStorage

### Las imágenes no se cargan
- Verifica que la URL sea correcta
- Asegúrate de que las imágenes sean accesibles públicamente
- Revisa la consola para errores CORS

---

## 📞 Soporte

Para más información o ayuda, consulta la documentación técnica en `CMS-MAPEO-ESTRUCTURA.md`.

