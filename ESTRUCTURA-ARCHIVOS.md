# Estructura de Archivos Cargados

## Configuración de Límites

Los formularios de KABSA GROUP tienen las siguientes restricciones de carga de archivos:

- **Máximo de archivos**: 5 archivos por formulario
- **Tamaño máximo por archivo**: 15MB
- **Validación en tiempo real**: Frontend valida antes del envío

## Estructura de Carpetas en el Servidor

### 1. Registro de Proveedores (`proveedor.html`)

**Ruta de almacenamiento:**
```
/uploads/proveedores/{RUC}_{timestamp}/
```

**Ejemplo:**
```
/uploads/proveedores/20600212070_20251031143025/
  ├── certificado_iso.pdf
  ├── ficha_ruc.pdf
  └── carta_presentacion.pdf
```

**Formatos permitidos:**
- PDF (.pdf)
- Imágenes (.jpg, .jpeg, .png)
- Documentos de Word (.doc, .docx)

**Campos del formulario:**
- Razón Social
- RUC
- Contacto Principal
- Cargo
- Correo Electrónico
- Teléfono
- Categoría de Proveedor
- Productos o Servicios
- Experiencia y Certificaciones
- **Archivos adjuntos** (hasta 5 archivos)

**Metadatos a guardar en base de datos:**
```json
{
  "ruc": "20600212070",
  "razon_social": "EMPRESA S.A.C.",
  "timestamp": "2025-10-31T14:30:25.000Z",
  "archivos": [
    {
      "nombre_original": "certificado_iso.pdf",
      "nombre_guardado": "20600212070_20251031143025_certificado_iso.pdf",
      "tamano_bytes": 2048000,
      "tipo_mime": "application/pdf",
      "ruta": "/uploads/proveedores/20600212070_20251031143025/certificado_iso.pdf"
    }
  ]
}
```

---

### 2. Trabaja con Nosotros (`empleo.html`)

**Ruta de almacenamiento:**
```
/uploads/empleos/{DNI}_{timestamp}/
```

**Ejemplo:**
```
/uploads/empleos/12345678_20251031143530/
  └── cv_juan_perez.pdf
```

**Formatos permitidos:**
- Solo PDF (.pdf)

**Campos del formulario:**
- Nombres Completos
- DNI
- Correo Electrónico
- Teléfono / WhatsApp
- Área de Interés
- Profesión / Especialidad
- Años de Experiencia
- Resumen de Experiencia
- **CV en PDF** (1 archivo obligatorio)

**Metadatos a guardar en base de datos:**
```json
{
  "dni": "12345678",
  "nombre_completo": "Juan Pérez García",
  "area_interes": "ingenieria",
  "timestamp": "2025-10-31T14:35:30.000Z",
  "cv": {
    "nombre_original": "cv_juan_perez.pdf",
    "nombre_guardado": "12345678_20251031143530_cv.pdf",
    "tamano_bytes": 1024000,
    "tipo_mime": "application/pdf",
    "ruta": "/uploads/empleos/12345678_20251031143530/cv_juan_perez.pdf"
  }
}
```

---

### 3. Libro de Reclamaciones (`reclamaciones.html`)

**Ruta de almacenamiento:**
```
/uploads/reclamaciones/{documento}_{timestamp}/
```

**Ejemplo:**
```
/uploads/reclamaciones/12345678_20251031144015/
  ├── factura_123.pdf
  ├── foto_producto.jpg
  └── contrato.pdf
```

**Formatos permitidos:**
- PDF (.pdf)
- Imágenes (.jpg, .jpeg, .png)
- Documentos de Word (.doc, .docx)

**Campos del formulario:**
- Tipo (Reclamo/Queja)
- Nombres y Apellidos
- Documento de Identidad
- Correo Electrónico
- Teléfono
- Dirección
- Empresa del Grupo
- Servicio/Producto Contratado
- Fecha del Incidente
- Detalle del Reclamo
- Pedido del Consumidor
- **Documentos adjuntos** (hasta 5 archivos opcionales)

**Metadatos a guardar en base de datos:**
```json
{
  "tipo": "reclamo",
  "documento": "12345678",
  "nombre_completo": "María López Rodríguez",
  "empresa": "argos",
  "timestamp": "2025-10-31T14:40:15.000Z",
  "archivos": [
    {
      "nombre_original": "factura_123.pdf",
      "nombre_guardado": "12345678_20251031144015_factura_123.pdf",
      "tamano_bytes": 512000,
      "tipo_mime": "application/pdf",
      "ruta": "/uploads/reclamaciones/12345678_20251031144015/factura_123.pdf"
    },
    {
      "nombre_original": "foto_producto.jpg",
      "nombre_guardado": "12345678_20251031144015_foto_producto.jpg",
      "tamano_bytes": 3145728,
      "tipo_mime": "image/jpeg",
      "ruta": "/uploads/reclamaciones/12345678_20251031144015/foto_producto.jpg"
    }
  ]
}
```

---

## Implementación en Backend

### Recomendaciones de Seguridad

1. **Validación del lado del servidor**: Aunque hay validación en frontend, SIEMPRE validar en el servidor:
   - Tamaño de archivos
   - Tipo MIME real (no solo extensión)
   - Número de archivos
   - Contenido malicioso (escáner de virus)

2. **Nombres de archivo seguros**:
   - Sanitizar nombres de archivo
   - Usar UUIDs o timestamps
   - Evitar caracteres especiales

3. **Permisos de carpeta**:
   - Solo lectura/escritura para el servidor
   - No ejecutables
   - Acceso restringido desde web

4. **Almacenamiento**:
   - Considerar usar servicios cloud (AWS S3, Google Cloud Storage)
   - Implementar backups automáticos
   - Limpieza periódica de archivos antiguos

### Ejemplo de Implementación (Node.js + Express + Multer)

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tipo = req.body.tipo_formulario; // 'proveedores', 'empleos', 'reclamaciones'
    const identificador = req.body.ruc || req.body.dni || req.body.documento;
    const timestamp = Date.now();
    
    const uploadPath = path.join(__dirname, 'uploads', tipo, `${identificador}_${timestamp}`);
    
    // Crear directorio si no existe
    fs.mkdirSync(uploadPath, { recursive: true });
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Sanitizar nombre de archivo
    const safeFilename = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${safeFilename}`);
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  const tipoFormulario = req.body.tipo_formulario;
  
  if (tipoFormulario === 'empleos') {
    // Solo PDF para CVs
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF para CVs'), false);
    }
  } else {
    // PDF, imágenes y documentos para otros formularios
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
    files: 5 // Máximo 5 archivos
  }
});

// Rutas
app.post('/api/proveedor', upload.array('archivos', 5), (req, res) => {
  // Procesar formulario de proveedor
  const archivos = req.files.map(file => ({
    nombre_original: file.originalname,
    nombre_guardado: file.filename,
    tamano_bytes: file.size,
    tipo_mime: file.mimetype,
    ruta: file.path
  }));
  
  // Guardar en base de datos
  // ...
  
  res.json({ success: true, archivos });
});

app.post('/api/empleo', upload.single('cv'), (req, res) => {
  // Procesar formulario de empleo
  const cv = {
    nombre_original: req.file.originalname,
    nombre_guardado: req.file.filename,
    tamano_bytes: req.file.size,
    tipo_mime: req.file.mimetype,
    ruta: req.file.path
  };
  
  // Guardar en base de datos
  // ...
  
  res.json({ success: true, cv });
});

app.post('/api/reclamacion', upload.array('documentos', 5), (req, res) => {
  // Procesar formulario de reclamación
  const documentos = req.files.map(file => ({
    nombre_original: file.originalname,
    nombre_guardado: file.filename,
    tamano_bytes: file.size,
    tipo_mime: file.mimetype,
    ruta: file.path
  }));
  
  // Guardar en base de datos
  // ...
  
  res.json({ success: true, documentos });
});
```

---

## Validación Frontend

El archivo `assets/file-upload.js` maneja la validación en tiempo real:

- ✅ Verifica número máximo de archivos (5)
- ✅ Valida tamaño máximo por archivo (15MB)
- ✅ Comprueba extensiones permitidas
- ✅ Muestra errores visuales en pantalla
- ✅ Lista archivos seleccionados con su tamaño
- ✅ Previene el envío si hay errores

---

## Notificaciones por Email

Cuando se reciba un formulario, enviar notificaciones a:

### Proveedores
- **Para**: compras@kabsagroup.com
- **CC**: info@kabsagroup.com
- **Asunto**: Nuevo Registro de Proveedor - {Razón Social}

### Empleos
- **Para**: rrhh@kabsagroup.com
- **CC**: info@kabsagroup.com
- **Asunto**: Nueva Postulación - {Nombre} - {Área de Interés}

### Reclamaciones
- **Para**: atencioncliente@kabsagroup.com
- **CC**: gerencia@kabsagroup.com
- **Asunto**: [URGENTE] Nuevo {Reclamo/Queja} - {Empresa} - {Ticket #}

---

## Mantenimiento

1. **Limpieza automática**: Considerar eliminar archivos después de cierto tiempo (ej: 2 años para reclamaciones cerradas)
2. **Monitoreo de espacio**: Alertar si el espacio en disco es bajo
3. **Logs**: Registrar todas las operaciones de carga/descarga de archivos
4. **Auditoría**: Mantener registro de quién accedió a qué archivo y cuándo

