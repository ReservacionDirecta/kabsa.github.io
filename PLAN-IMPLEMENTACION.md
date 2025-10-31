# 📋 PLAN DE IMPLEMENTACIÓN - KABSA GROUP
## Actualización y Mejora Integral del Sitio Web

---

## 📊 RESUMEN EJECUTIVO

### Objetivo General
Actualizar la página web de KABSA Group para reflejar con precisión la estructura operativa actual del grupo, mejorar la experiencia de usuario y optimizar la presentación de servicios según el nuevo modelo de negocio.

### Estructura Actualizada del Grupo
- **BRONTES** → Diseño y Planificación (BIM + Financiamiento)
- **KATSUMOTO** → Ejecución de Obras (Infraestructura + Obras Civiles)
- **ARGOS** → Servicios y Bienes (Maquinaria + Consultoría Complementaria)

### Duración Estimada
**15-20 días hábiles** (dividido en 4 fases)

---

## 🎯 FASE 1: CORRECCIONES Y ACTUALIZACIONES DE INFORMACIÓN
**Duración: 3-4 días**

### 1.1 Información General y Datos Corporativos
**Prioridad: ALTA** | **Complejidad: BAJA**

#### Tareas:
- [ ] **Actualizar antigüedad de Brontes**
  - Cambiar año de fundación a 2015 en todas las páginas
  - Archivos a modificar: `empresas.html`, `grupo.html`, `brontes.html`, `index.html`
  - Validar coherencia en footer y secciones de historia

- [ ] **Actualizar dirección corporativa**
  - ✅ COMPLETADO: Av. Alejandro Velasco Astete 3525, Santiago de Surco – Lima
  - Verificar que esté correcta en todas las páginas

- [ ] **Actualizar correo corporativo**
  - ✅ COMPLETADO: info@kabsa.pe en toda la web

- [ ] **Eliminar icono de WhatsApp**
  - ✅ COMPLETADO en navbar
  - Revisar si aparece en otros lugares y mantener solo el texto del botón

- [ ] **Quitar sección "Capacidad de Contratación"**
  - Eliminar de `index.html` (sección "¿Por qué elegir KABSA GROUP?")
  - Reorganizar grid de 6 tarjetas a 5 tarjetas
  - Mantener alineación visual con sistema de alturas fijas

### 1.2 Justificación de Textos
**Prioridad: MEDIA** | **Complejidad: BAJA**

#### Tareas:
- [ ] **Revisar justificación global**
  - Validar que `assets/global.css` tenga la regla `.text-justify-all p`
  - Aplicar clase `text-justify-all` a todos los bloques de contenido largo
  - Mantener títulos y subtítulos centrados
  
- [ ] **Páginas a revisar:**
  - `index.html`: secciones de contenido
  - `grupo.html`: todas las secciones descriptivas
  - `empresas.html`: descripciones y contenido
  - `proyectos.html`: descripciones de proyectos
  - `noticias.html`: contenido de noticias
  - Páginas de empresas individuales: `argos.html`, `brontes.html`, `katsumoto.html`

---

## 🧭 FASE 2: REESTRUCTURACIÓN DE NAVEGACIÓN Y CONTENIDO
**Duración: 4-5 días**

### 2.1 Restructuración del Navbar
**Prioridad: ALTA** | **Complejidad: MEDIA**

#### Nueva Estructura Propuesta:
```
├── Inicio
├── Nosotros ▼
│   ├── Misión y Visión
│   ├── Quiénes Somos
│   └── Valores Corporativos
├── El Grupo ▼
│   ├── Empresas (visión general)
│   ├── BRONTES (Diseño)
│   ├── KATSUMOTO (Ejecución)
│   └── ARGOS (Servicios y Bienes)
├── Proyectos ▼
│   ├── Ejecución de Obras
│   ├── Consultoría Técnica
│   ├── Proveedores de Bienes
│   └── Topografía Especializada
├── Conoce Más ▼
│   ├── Registro de Proveedor
│   ├── Trabaja con Nosotros
│   ├── Consultas
│   └── Libro de Reclamaciones
└── Contacto
```

#### Tareas:
- [ ] **Modificar `partials/navbar.html`**
  - Crear nuevo dropdown "Nosotros" con subopciones
  - Reorganizar dropdown "El Grupo"
  - Crear nuevo dropdown "Proyectos" con categorías
  - Actualizar dropdown "Conoce Más"
  - Mantener funcionalidad JavaScript de dropdowns

- [ ] **Actualizar versión móvil**
  - Adaptar menú hamburguesa con nueva estructura
  - Mantener nombres cortos para móvil
  - Probar navegación en dispositivos móviles

- [ ] **Actualizar `partials/footer.html`**
  - Reorganizar enlaces según nueva estructura
  - Mantener coherencia con navbar

### 2.2 Reorganización de Secciones en Grupo KABSA
**Prioridad: ALTA** | **Complejidad: MEDIA**

#### Tareas:
- [ ] **Crear sección "Quiénes Somos"** en `grupo.html`
  - Incluir historia del grupo
  - Mostrar nombre completo: KABSA GROUP
  - Destacar composición de empresas

- [ ] **Mejorar Misión y Visión**
  - Investigar referencias de otros grupos corporativos peruanos
  - Redactar nueva misión enfocada en integración de servicios
  - Redactar nueva visión con mención explícita de Argos
  - Incluir compromiso con metodología BIM y sostenibilidad

- [ ] **Actualizar Valores Corporativos**
  - Revisar valores actuales
  - Asegurar que reflejen el nuevo modelo operativo
  - Agregar iconos únicos para cada valor

### 2.3 Proyectos Organizados por Tipo
**Prioridad: ALTA** | **Complejidad: ALTA**

#### Tareas:
- [ ] **Crear nueva estructura en `proyectos.html`**
  - Sección 1: **Ejecución de Obras** (Katsumoto)
    - Infraestructura vial
    - Obras eléctricas
    - Caminos vecinales
    - Descolmataciones
    - Obras de saneamiento
  
  - Sección 2: **Consultoría Técnica** (Brontes)
    - Diseño arquitectónico
    - Ingeniería estructural
    - Metodología BIM
    - Estudios de factibilidad
    - Supervisión de obras
  
  - Sección 3: **Proveedores de Bienes** (Argos)
    - Maquinaria pesada
    - Equipos de construcción
    - Materiales especializados
    - Logística y transporte
  
  - Sección 4: **Topografía Especializada** (NUEVA)
    - Levantamientos topográficos
    - Geodesia
    - Drones y fotogrametría

- [ ] **Agregar imágenes a proyectos**
  - Solicitar imagen pendiente al cliente
  - Optimizar imágenes para web
  - Asegurar imágenes de calidad para cada categoría

- [ ] **Incluir organigrama y cargos**
  - Diseñar organigrama visual del grupo
  - Listar cargos principales
  - Mostrar estructura de dirección

---

## 🏗️ FASE 3: ACTUALIZACIÓN DE EMPRESAS Y MODELO OPERATIVO
**Duración: 5-6 días**

### 3.1 Actualización BRONTES
**Prioridad: ALTA** | **Complejidad: ALTA**

#### Cambios Conceptuales:
- **ROL ANTERIOR**: Ejecución y fabricación
- **ROL NUEVO**: Diseño, planificación y financiamiento

#### Tareas:
- [ ] **Actualizar `brontes.html`**
  - Cambiar descripción principal
  - Nuevo enfoque: "Especialista en planificación integral, estructuración y financiamiento"
  - Agregar metodología BIM como servicio principal
  - Incluir financiamiento de proyectos

- [ ] **Actualizar servicios:**
  - ✅ Consultoría técnica (ahora bajo Brontes)
  - ✅ Diseño arquitectónico y estructural
  - ✅ Metodología BIM
  - ✅ Financiamiento de proyectos
  - ✅ Estudios de factibilidad
  - ✅ Planificación integral

- [ ] **Actualizar tarjeta en `empresas.html`**
  - Modificar logo, descripción y servicios
  - Ajustar slogan si es necesario
  - Actualizar lista de proyectos destacados

- [ ] **Actualizar tarjeta en `index.html`**
  - Cambiar párrafo descriptivo
  - Actualizar imágenes hover
  - Modificar servicios mostrados

### 3.2 Actualización KATSUMOTO
**Prioridad: ALTA** | **Complejidad: ALTA**

#### Cambios Conceptuales:
- **ROL ANTERIOR**: Consultoría y planificación
- **ROL NUEVO**: Ejecución de obras e infraestructura

#### Tareas:
- [ ] **Actualizar `katsumoto.html`**
  - Cambiar descripción principal
  - Nuevo enfoque: "Especializada en construcción y ejecución de obras de infraestructura"
  - Eliminar "Consultoría y Planifica"

- [ ] **Actualizar servicios:**
  - ✅ Ingeniería vial (incorporado desde Argos)
  - ✅ Obras eléctricas (NUEVO)
  - ✅ Caminos vecinales (NUEVO)
  - ✅ Descolmataciones (NUEVO)
  - ✅ Obras de saneamiento
  - ✅ Construcción de infraestructura
  - ❌ Eliminar consultoría técnica

- [ ] **Actualizar tarjeta en `empresas.html`**
  - Modificar descripción y servicios
  - Actualizar lista de capacidades
  - Cambiar enfoque a ejecución

- [ ] **Actualizar tarjeta en `index.html`**
  - Cambiar párrafo descriptivo
  - Actualizar imágenes a construcción
  - Modificar servicios mostrados

### 3.3 Actualización ARGOS
**Prioridad: ALTA** | **Complejidad: MEDIA**

#### Cambios Conceptuales:
- **ROL ANTERIOR**: Desarrollo y gestión de proyectos
- **ROL NUEVO**: Servicios y bienes para construcción

#### Tareas:
- [ ] **Actualizar `argos.html`**
  - Cambiar descripción principal
  - Nuevo enfoque: "Especializada en servicios y bienes para construcción"
  - Destacar rol de provisión y logística

- [ ] **Actualizar servicios:**
  - ✅ Venta de maquinaria y equipos
  - ✅ Obras de infraestructura
  - ✅ Obras eléctricas (reemplaza saneamiento)
  - ✅ Consultoría técnica complementaria
  - ✅ Suministro de materiales
  - ✅ Logística y transporte
  - ❌ Eliminar "saneamiento" como servicio principal

- [ ] **Actualizar tarjeta en `empresas.html`**
  - Modificar descripción hacia servicios
  - Actualizar lista de suministros
  - Agregar equipos y maquinaria

- [ ] **Actualizar tarjeta en `index.html`**
  - Cambiar párrafo descriptivo
  - Actualizar imágenes a maquinaria/equipos
  - Modificar servicios mostrados

### 3.4 Actualización del Modelo de Operación
**Prioridad: ALTA** | **Complejidad: MEDIA**

#### Tareas:
- [ ] **Actualizar sección en `grupo.html`**
  - Nueva distribución:
    ```
    DISEÑO → BRONTES
    EJECUCIÓN → KATSUMOTO
    SERVICIOS Y BIENES → ARGOS
    ```

- [ ] **Crear diagrama visual del modelo**
  - Diseñar infografía del ciclo completo
  - Mostrar flujo de trabajo integrado
  - Destacar complementariedad de empresas

- [ ] **Actualizar página `empresas.html`**
  - Reorganizar según nuevo modelo
  - Ajustar orden de presentación
  - Actualizar descripciones generales

---

## 🎨 FASE 4: MEJORAS VISUALES Y DE EXPERIENCIA
**Duración: 3-5 días**

### 4.1 Reemplazo de Franjas Azules por Imágenes
**Prioridad: MEDIA** | **Complejidad: MEDIA**

#### Tareas:
- [ ] **Identificar todas las secciones hero**
  - `index.html`: hero principal
  - `grupo.html`: hero de grupo
  - `empresas.html`: hero de empresas
  - `proyectos.html`: hero de proyectos
  - `noticias.html`: hero de noticias
  - `contacto.html`: hero de contacto
  - Páginas individuales de empresas

- [ ] **Obtener/crear imágenes de fondo**
  - Solicitar imágenes al cliente
  - Optimizar tamaños (1920x600px aprox)
  - Aplicar overlays para legibilidad del texto
  - Formato WebP para optimización

- [ ] **Implementar nuevos heroes**
  - Agregar `background-image` con gradientes
  - Mantener legibilidad del texto
  - Asegurar responsive design
  - Probar en diferentes dispositivos

### 4.2 Nueva Sección "Nuestros Clientes"
**Prioridad: MEDIA** | **Complejidad: MEDIA**

#### Tareas:
- [ ] **Diseñar sección en `index.html`**
  - Ubicación: después de "Múltiples empresas, una sola visión"
  - Incluir logos de clientes principales
  - Agregar carrusel o grid de logos
  - Mantener diseño limpio y profesional

- [ ] **Obtener logos de clientes**
  - Solicitar logos al cliente
  - Verificar permisos de uso
  - Optimizar imágenes en formato SVG o PNG
  - Crear versiones en escala de grises

- [ ] **Agregar texto descriptivo**
  - "Empresas e instituciones que confían en nosotros"
  - Lista de sectores atendidos
  - Testimonios breves (opcional)

### 4.3 Modificación de Tarjetas en "Empresas del Grupo"
**Prioridad: ALTA** | **Complejidad: ALTA**

#### Cambios Requeridos:
- **Antes**: Mostrar nombres completos de empresas en tarjetas
- **Después**: Identificar por servicios, mover detalles a páginas internas

#### Tareas:
- [ ] **Rediseñar tarjetas en `index.html`**
  - Tarjeta 1: "Diseño y Planificación" (Brontes)
    - Subtítulo: "Consultoría técnica y metodología BIM"
    - Servicios: Diseño arquitectónico, financiamiento, BIM
    - Logo discreto o sin nombre visible
  
  - Tarjeta 2: "Ejecución de Obras" (Katsumoto)
    - Subtítulo: "Infraestructura y construcción"
    - Servicios: Obras viales, eléctricas, saneamiento
    - Logo discreto o sin nombre visible
  
  - Tarjeta 3: "Servicios y Bienes" (Argos)
    - Subtítulo: "Maquinaria y suministros"
    - Servicios: Equipos, materiales, logística
    - Logo discreto o sin nombre visible

- [ ] **Ampliar páginas internas de empresas**
  - Mover toda la información detallada a páginas individuales
  - Agregar secciones:
    - Historia detallada
    - Equipo técnico
    - Certificaciones ampliadas
    - Proyectos destacados con galería
    - Capacidades técnicas detalladas
    - Contacto directo por empresa

- [ ] **Mantener sistema de alineación precisa**
  - Aplicar mismo sistema de alturas fijas
  - `flex flex-col` con `flex-shrink-0`
  - Alturas consistentes entre tarjetas

### 4.4 Optimización de Imágenes y Performance
**Prioridad: MEDIA** | **Complejidad: BAJA**

#### Tareas:
- [ ] **Optimizar todas las imágenes**
  - Convertir a formatos modernos (WebP, AVIF)
  - Implementar lazy loading
  - Crear versiones responsive
  - Comprimir sin pérdida de calidad

- [ ] **Mejorar tiempos de carga**
  - Minificar CSS y JavaScript
  - Implementar caché de assets
  - Optimizar fuentes web
  - Revisar y eliminar código no usado

---

## 📝 FASE 5: CONTENIDO Y REDACCIÓN
**Duración: Transversal a todas las fases**

### 5.1 Redacción de Contenidos
**Prioridad: ALTA** | **Complejidad: MEDIA**

#### Tareas:
- [ ] **Misión del Grupo**
  - Investigar misiones de grupos similares (Gloria, Aceros Arequipa, Graña y Montero)
  - Redactar misión clara e inspiradora
  - Incluir compromiso con calidad, sostenibilidad e innovación
  - Longitud: 2-3 párrafos justificados

- [ ] **Visión del Grupo**
  - Incluir mención explícita de las tres empresas
  - Destacar rol de Argos en servicios
  - Proyección a 5-10 años
  - Incluir liderazgo en BIM y sostenibilidad
  - Longitud: 2-3 párrafos justificados

- [ ] **Descripción de cada empresa**
  - Brontes: enfoque en diseño y financiamiento
  - Katsumoto: enfoque en ejecución técnica
  - Argos: enfoque en servicios y provisión
  - Párrafos SEO-optimizados, concisos y potentes

- [ ] **Descripciones de servicios**
  - Por cada servicio nuevo agregado
  - Incluir beneficios y casos de uso
  - Optimizar para SEO con palabras clave

### 5.2 SEO y Metadatos
**Prioridad: MEDIA** | **Complejidad: BAJA**

#### Tareas:
- [ ] **Actualizar meta descriptions**
  - Todas las páginas principales
  - Incluir nuevos servicios y estructura

- [ ] **Actualizar títulos de página**
  - Reflejar nueva estructura
  - Optimizar para buscadores

- [ ] **Crear/actualizar sitemap.xml**
  - Incluir nuevas páginas y secciones
  - Actualizar prioridades

- [ ] **Actualizar robots.txt**
  - Permitir indexación de todo el contenido público

---

## 📋 TAREAS COMPLEMENTARIAS Y VALIDACIÓN

### Validación de Contenido
- [ ] Revisar ortografía y gramática en todas las páginas
- [ ] Validar coherencia de términos técnicos
- [ ] Verificar que todos los enlaces funcionen
- [ ] Comprobar formularios de contacto

### Testing Cross-Browser
- [ ] Chrome/Edge (Windows)
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

### Testing Responsive
- [ ] Desktop (1920px, 1440px, 1366px)
- [ ] Tablet (1024px, 768px)
- [ ] Mobile (414px, 375px, 360px)

### Accesibilidad
- [ ] Validar contraste de colores
- [ ] Verificar navegación por teclado
- [ ] Agregar alt text a todas las imágenes
- [ ] Validar estructura de encabezados (h1-h6)

### Performance
- [ ] Google PageSpeed Insights (>90 en móvil y desktop)
- [ ] Validar Core Web Vitals
- [ ] Verificar tiempos de carga <3s

---

## 🎯 PRIORIZACIÓN DE TAREAS

### 🔴 CRÍTICAS (Hacer primero)
1. Actualizar antigüedad de Brontes (2015)
2. Actualizar modelo operativo en todas las páginas
3. Modificar roles de cada empresa (Brontes→Diseño, Katsumoto→Ejecución, Argos→Servicios)
4. Restructurar navbar con nuevas opciones
5. Quitar "Capacidad de Contratación"
6. Rediseñar tarjetas de empresas en página principal

### 🟡 IMPORTANTES (Hacer segundo)
7. Reorganizar proyectos por tipo
8. Crear sección "Nuestros Clientes"
9. Mejorar redacción de Misión y Visión
10. Agregar topografía especializada
11. Reemplazar franjas azules por imágenes
12. Justificar todos los textos largos

### 🟢 COMPLEMENTARIAS (Hacer tercero)
13. Agregar organigrama
14. Optimizar imágenes
15. Mejorar SEO
16. Testing completo
17. Validación de accesibilidad

---

## 📊 RECURSOS NECESARIOS

### Del Cliente
- ✅ Dirección actualizada
- ✅ Correo corporativo (info@kabsa.pe)
- ⏳ Imágenes de fondo para heroes (6-8 imágenes)
- ⏳ Logos de clientes principales
- ⏳ Imagen pendiente para sección de noticias
- ⏳ Información de organigrama
- ⏳ Lista de cargos principales
- ⏳ Proyectos destacados de topografía
- ⏳ Validación de textos de Misión y Visión

### Desarrollo
- Editor de código (VS Code)
- Navegadores para testing
- Herramientas de optimización de imágenes
- Acceso a repositorio Git
- Hosting/servidor de pruebas

---

## 🚀 PLAN DE DESPLIEGUE

### Pre-Deploy
1. Backup completo del sitio actual
2. Testing en ambiente de staging
3. Validación del cliente
4. Checklist de QA completado

### Deploy
1. Subir archivos al servidor
2. Verificar configuración de DNS
3. Validar certificado SSL
4. Probar formularios en producción

### Post-Deploy
1. Monitoreo de errores (24-48h)
2. Verificar Google Analytics
3. Indexación en Google Search Console
4. Notificar al cliente

---

## 📈 MÉTRICAS DE ÉXITO

### Técnicas
- [ ] PageSpeed Score >90
- [ ] Core Web Vitals en verde
- [ ] 0 errores de consola
- [ ] 100% de enlaces funcionales

### Contenido
- [ ] Toda la información actualizada
- [ ] Estructura clara y navegable
- [ ] Textos justificados correctamente
- [ ] Imágenes optimizadas

### UX
- [ ] Navegación intuitiva
- [ ] Formularios funcionales
- [ ] Responsive en todos los dispositivos
- [ ] Accesibilidad WCAG 2.1 AA

---

## 📝 NOTAS FINALES

### Dependencias Críticas
- Aprobación del cliente para cambios de contenido
- Recepción de imágenes y logos
- Validación de nueva estructura de servicios

### Riesgos Identificados
- Cambios estructurales pueden afectar SEO existente
- Requiere coordinación estrecha con cliente para contenidos
- Testing extensivo por cambios profundos

### Recomendaciones
1. Mantener versión de respaldo del sitio actual
2. Implementar cambios de forma incremental
3. Validar cada fase antes de continuar
4. Documentar todos los cambios realizados

---

**Documento creado**: 31 de octubre de 2025
**Última actualización**: 31 de octubre de 2025
**Responsable**: Equipo de Desarrollo Web
**Cliente**: KABSA GROUP - Martin Delgado Herrera

