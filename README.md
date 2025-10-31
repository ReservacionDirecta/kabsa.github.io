## KABSA Group — Contexto del Proyecto Web

### Descripción general
Proyecto de sitio institucional corporativo para KABSA Group (conglomerado peruano de construcción e infraestructura) que integra empresas especializadas bajo una misma marca matriz. El enfoque es B2B + B2G, con objetivo de comunicar solidez, experiencia y facilitar el contacto/comercial.

### Objetivos
- **Presentación corporativa**: historia, misión, visión, valores y pilares.
- **Mostrar portafolio**: empresas del grupo y proyectos realizados.
- **Generación de confianza**: casos/proyectos, noticias y actividad.
- **Conversión**: contacto directo (formulario y WhatsApp), SEO inicial y analítica.

### Alcance funcional (versión preliminar)
- **Formato**: Multipágina (inspirado en arquitectura de Grupo Gloria), con navegación clara por secciones.
- **Secciones**: Inicio, El Grupo KABSA, Empresas del Grupo, Proyectos, Noticias, Contacto.
- **Duración estimada**: 7 días hábiles para versión preliminar.

### Arquitectura de contenido
- **Inicio**
  - Hero con claim “Construimos confianza. Construimos futuro.”
  - Presentación rápida del grupo y sus empresas especializadas.
  - Logos de entidades/aliados (genéricos si no hay permisos de marca).
  - CTA a conocer el grupo y contacto por WhatsApp.
- **El Grupo KABSA**
  - Historia, Misión, Visión, Valores.
  - Pilares estratégicos: cumplimiento/calidad, innovación/sostenibilidad, compromiso social/ambiental.
- **Empresas del Grupo** (3 cards con subanclas internas)
  - KABSA Ingeniería y Construcción: obras civiles, infraestructura vial, saneamiento, edificaciones.
  - KABSA Proyectos & Servicios: consultoría técnica, diseño estructural, supervisión.
  - KABSA Equipos & Logística: maquinaria pesada, transporte, suministro de materiales.
- **Proyectos Realizados**
  - Galería tipo masonry con ficha breve: nombre, ubicación, cliente, inversión (opcional), estado.
- **Noticias y Actualidad**
  - Cards estilo blog: adjudicaciones, avances, participación en licitaciones/ferias, compromisos sociales/ambientales.
- **Contacto**
  - Formulario, botón WhatsApp fijo, datos de contacto y mapa (Google Maps embed).

### Identidad visual sugerida
- **Colores**: azul oscuro + gris cemento + blanco.
- **Tipografía**: Poppins o Montserrat (sans-serif modernas).
- **Estilo**: corporativo, sobrio, con fotografías reales de obras y equipo técnico.

### Requisitos técnicos y de optimización
- **SEO inicial**: meta titles, meta descriptions, URLs limpias.
- **Analítica**: Google Analytics.
- **Visibilidad local**: Google My Business.
- **Mensajería**: enlace a WhatsApp API (botón fijo).
- **Rendimiento**: imágenes optimizadas, carga rápida.
- **UX/UI**: header sticky, animaciones sutiles on-scroll, responsive.

### Wireframe textual (home)
1. Header fijo: logo, navegación, botón WhatsApp.
2. Hero: video/imagen panorámica + título/subtítulo + CTAs.
3. Sobre el grupo: quiénes somos, datos rápidos (+10 años, +50 proyectos, cobertura nacional).
4. Empresas del grupo: 3 cards con hover y CTA “Ver más”.
5. Proyectos destacados: grilla/masonry con apertura a detalle.
6. Noticias y actualidad: 3 cards estilo blog + “Ver todas”.
7. CTA final: bloque en azul oscuro “¿Listo para iniciar tu próximo proyecto?”
8. Footer: 3 columnas (acerca, enlaces rápidos, contacto) + leyenda legal.

### Entregables esperados
- Maquetado HTML/CSS/JS base multipágina.
- Páginas: `index.html` (Home), `grupo.html`, `empresas.html`, `proyectos.html`, `noticias.html`, `contacto.html`.
- Componentes reutilizables (cards, galerías, CTA, header/footer).
- Configuración de SEO on-page y analítica.

### Activos y referencias en el repositorio
- `assets/`: fondos, imágenes, efectos hover.
- `contexto/`: documentos de referencia (brochures, fichas RUC, propuestas, imágenes, logotipos) y `contexto.txt`/`grupogloria.txt` (inspiración de arquitectura y contenidos).
- `index.html`, `grupo.html`, `empresas.html`, `proyectos.html`, `noticias.html`, `contacto.html`.

### Información proporcionada por el cliente (Formulario)
- **Representante**: Martin Delgado Herrera (Administrador)
- **Contacto**: `info@kabsagroup.com` · WhatsApp: `+51 991 690 103`
- **Inicio previsto**: 28-OCT-2025
- **Dominio**: sin dominio actual; preferencia TLD: `.pe`
- **Hosting**: requiere provisión por Chamba Digital
- **Correos corporativos**: 1000 cuentas estimadas

### KABSA Group (matriz)
- **Nombre**: KABSA GROUP
- **Año de fundación**: 2025
- **Sector**: Construcción
- **Historia / Misión / Visión / Valores**: por definir (cliente indicó “CREAR”).

### Empresas del grupo (según Formulario)
- **Empresa 1: CORPORACION KATSUMOTO S.A.C.**
  - Fundada: 22/05/2023
  - Descripción: Arquitectura e ingeniería y actividades conexas de consultoría técnica
  - Servicios: por detallar
  - Proyectos destacados:
    - Reparación integral Aeródromo de Yurimaguas (Loreto) – en ejecución
    - Mejoramiento capacidad resolutiva EESS Monsefú (Chiclayo, Lambayeque) – en ejecución
  - Socios estratégicos: Grupo Bucer (CONSORCIO ARGOS), Sainc Ingenieros (CONSORCIO BRONTES)
  - Cobertura: Lima – nivel nacional
  - Slogan: no definido
  - Responsable: Martin Delgado
  - Web/Redes: sin sitio web

- **Empresa 2: ARGOS CORPORATION S.A.C. (antes AGS)**
  - Fundada: 19/01/2015
  - Descripción: ver brochure
  - Servicios: bienes y servicios – construcción (ver brochure)
  - Slogan: “CONSTRUCCIONES QUE MEJORAN VIDAS”
  - Proyectos: ver brochure
  - Cobertura: Lima – nivel nacional
  - Responsable: Martin Delgado
  - Web/Redes: sin sitio web

- **Empresa 3: BRONTES CONSTRUCTORA S.A.**
  - Fundada: 10/06/2014
  - Descripción: ver brochure
  - Servicios: consultoría de proyectos integrales, financiamiento y dirección técnica de obras y proyectos
  - Slogan: “Diseñamos tus ideas Construimos tus sueños”
  - Proyectos: por completar
  - Cobertura: Lima – nivel nacional
  - Responsable: Martin Delgado
  - Web/Redes: sin sitio web

### Materiales y documentación de soporte
- En `contexto/` se encuentran los documentos de respaldo (fichas RUC de cada empresa, brochures, logotipos e imágenes). Ejemplos relevantes:
  - Fichas RUC: `3. FICHA RUC KATSUMOTO (6).pdf`, `BRONTES - reporteec_ficharuc_20562895699_20250708142135.pdf`, `29AGO2025 - reporteec_ficharuc_20600212070_20250829150205 (1).pdf`
  - Brochures: `BROCHURE CONSTRUCTORA BRONTES 2025 (1).pdf`, `BROCHURE AGS -2023.pdf`
  - Logo: `LOGO KABSA PNG.png`

### Próximos pasos sugeridos
1. Consolidar branding (paleta final, tipografías, logos definitivos) y contenidos (textos y fotografías reales).
2. Completar contenidos de cada página (copys finales, imágenes reales, proyectos/noticias dinámicos si aplica).
3. Unificar scripts y estilos en archivos en `assets/` y eliminar JS inline progresivamente.
4. Integrar WhatsApp y formulario funcional (backend o servicio de correo).
5. Ajustes SEO (metas por página, sitemap/robots) y despliegue con HTTPS.

---

Este README resume el contexto y la arquitectura de contenido para la web de KABSA Group, basado en la documentación ubicada en `contexto/contexto.txt`.


