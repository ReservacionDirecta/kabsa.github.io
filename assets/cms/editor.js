/**
 * Editor de Contenido WYSIWYG
 */

window.CMSEditor = (function() {
    'use strict';

    /**
     * Crea el editor interactivo para una página
     */
    async function createEditor(html, pagePath) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Mapear elementos editables
        const editableElements = findEditableElements(doc, pagePath);
        
        // Agrupar elementos por sección
        const elementsBySection = groupElementsBySection(editableElements, doc);
        
        // Crear UI con acordeones por sección
        return createAccordionEditor(elementsBySection);
    }

    /**
     * Agrupa elementos editables por su sección padre
     */
    function groupElementsBySection(elements, doc) {
        const sections = {};
        const ungrouped = [];
        
        elements.forEach(element => {
            // Intentar encontrar la sección padre más cercana
            let sectionElement = null;
            let current = element.node;
            
            // Buscar sección padre (section, main, article, o div con ID/clase de sección)
            while (current && current !== doc.body) {
                const tagName = current.tagName?.toLowerCase();
                const id = current.id || '';
                const classes = current.className || '';
                
                // Verificar si es una sección
                if (tagName === 'section' || 
                    tagName === 'article' ||
                    tagName === 'main' ||
                    (tagName === 'div' && (id.includes('section') || id.includes('seccion') || classes.includes('section'))) ||
                    id) {
                    sectionElement = current;
                    break;
                }
                
                current = current.parentElement;
            }
            
            if (sectionElement) {
                // Obtener nombre de la sección
                const sectionId = sectionElement.id || '';
                const sectionName = getSectionName(sectionElement, sectionId);
                // Crear key único basado en ID o nombre
                const sectionKey = sectionId || `section-${sectionName.replace(/[^a-zA-Z0-9]/g, '-')}`;
                
                if (!sections[sectionKey]) {
                    sections[sectionKey] = {
                        name: sectionName,
                        id: sectionId,
                        elements: []
                    };
                }
                
                sections[sectionKey].elements.push(element);
            } else {
                // Si no tiene sección padre clara, buscar por contexto
                const contextSection = findSectionByContext(element.node);
                if (contextSection) {
                    const sectionKey = contextSection.id || `section-${contextSection.name.replace(/[^a-zA-Z0-9]/g, '-')}`;
                    if (!sections[sectionKey]) {
                        sections[sectionKey] = {
                            name: contextSection.name,
                            id: contextSection.id,
                            elements: []
                    };
                    }
                    sections[sectionKey].elements.push(element);
                } else {
                    ungrouped.push(element);
                }
            }
        });
        
        // Si hay elementos sin agrupar, crear una sección "Otros"
        if (ungrouped.length > 0) {
            sections['otros'] = {
                name: '📄 Otros',
                id: '',
                elements: ungrouped
            };
        }
        
        return sections;
    }

    /**
     * Obtiene un nombre legible y corto para una sección
     */
    function getSectionName(sectionElement, sectionId) {
        // Intentar obtener nombre del ID
        if (sectionId) {
            const nameMap = {
                'inicio': '🎯 Hero',
                'hero': '🎯 Hero',
                'grupo': '📋 Quiénes Somos',
                'empresas': '🏢 Servicios',
                'mision': '🎯 Misión',
                'vision': '👁️ Visión',
                'mision-vision': '🎯 Misión y Visión',
                'valores': '💎 Valores',
                'quienes-somos': '📋 Quiénes Somos',
                'modelo-operacion': '⚙️ Modelo de Operación',
                'ambitos': '🔧 Ámbitos de Trabajo',
                'ambitos-trabajo': '🔧 Ámbitos de Trabajo',
                'organigrama': '📊 Organigrama',
                'ejecucion': '🏗️ Ejecución de Obras',
                'consultoria': '📐 Consultoría',
                'bienes': '📦 Bienes',
                'topografia': '📍 Topografía',
                'proyectos': '📁 Proyectos',
                'noticias': '📰 Noticias',
                'contacto': '📞 Contacto',
                'servicios': '⚙️ Servicios',
                'descripcion': '📝 Descripción',
                'datos': '📋 Datos',
                'arquitectura': '🏛️ Arquitectura',
                'noticias-grupo': '📰 Noticias',
                'certificaciones': '🏆 Certificaciones',
                'staff': '👥 Staff',
                'proveedor': '📝 Registro Proveedor',
                'empleo': '💼 Trabajo',
                'reclamaciones': '📋 Reclamaciones'
            };
            
            if (nameMap[sectionId]) {
                return nameMap[sectionId];
            }
            
            // Convertir ID a nombre legible (sin emoji para IDs no conocidos)
            const words = sectionId.split('-');
            if (words.length > 0) {
                return words.map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ').substring(0, 30);
            }
        }
        
        // Intentar obtener nombre del título de la sección (limitar longitud)
        const heading = sectionElement.querySelector('h1, h2, h3, h4');
        if (heading && heading.textContent) {
            const text = heading.textContent.trim();
            // Limitar a 30 caracteres
            return text.length > 30 ? text.substring(0, 27) + '...' : text;
        }
        
        // Intentar obtener nombre de una clase o atributo data
        const classes = sectionElement.className || '';
        if (classes.includes('hero')) return '🎯 Hero';
        if (classes.includes('contact')) return '📞 Contacto';
        if (classes.includes('about')) return '📋 Acerca';
        if (classes.includes('services')) return '⚙️ Servicios';
        
        // Nombre por defecto basado en la etiqueta
        const tagName = sectionElement.tagName?.toLowerCase();
        const tagNames = {
            'section': '📄 Sección',
            'article': '📰 Artículo',
            'main': '📄 Principal'
        };
        
        return tagNames[tagName] || '📄 Sección';
    }

    /**
     * Encuentra la sección por contexto del elemento
     */
    function findSectionByContext(element) {
        let current = element.parentElement;
        let depth = 0;
        
        while (current && depth < 10) {
            depth++;
            const tagName = current.tagName?.toLowerCase();
            
            if (tagName === 'section' || tagName === 'article') {
                return {
                    id: current.id || '',
                    name: getSectionName(current, current.id || '')
                };
            }
            
            current = current.parentElement;
        }
        
        return null;
    }

    /**
     * Crea la UI del editor con acordeones por sección
     */
    function createAccordionEditor(sectionsByKey) {
        let html = '<div class="space-y-3">';
        
        // Ordenar secciones (Hero primero, luego por orden de aparición)
        const sectionOrder = [
            'inicio', 'hero', 'quienes-somos', 'grupo', 'empresas',
            'mision-vision', 'mision', 'vision', 'valores',
            'modelo-operacion', 'ambitos', 'ambitos-trabajo',
            'servicios', 'descripcion', 'datos', 'proyectos',
            'ejecucion', 'consultoria', 'bienes', 'topografia',
            'arquitectura', 'noticias', 'noticias-grupo', 'contacto',
            'organigrama', 'otros'
        ];
        
        const sortedSections = Object.keys(sectionsByKey).sort((a, b) => {
            const indexA = sectionOrder.indexOf(a);
            const indexB = sectionOrder.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });
        
        sortedSections.forEach((key, index) => {
            const section = sectionsByKey[key];
            const isFirst = index === 0; // Primera sección expandida por defecto
            
            html += `
                <div class="border border-gray-300 rounded-lg overflow-hidden">
                    <button 
                        type="button"
                        class="w-full px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-left font-semibold text-gray-800 flex items-center justify-between transition-colors duration-200"
                        onclick="toggleSection('section-${key}')"
                        id="btn-section-${key}"
                    >
                        <span class="flex items-center gap-2 flex-1 min-w-0">
                            <i class="fas fa-chevron-${isFirst ? 'down' : 'right'} transition-transform duration-200 text-xs flex-shrink-0" id="icon-section-${key}"></i>
                            <span class="text-sm truncate">${escapeHtml(section.name)}</span>
                            <span class="text-xs font-normal text-gray-500 bg-gray-300 px-2 py-0.5 rounded-full flex-shrink-0">
                                ${section.elements.length}
                            </span>
                        </span>
                    </button>
                    <div 
                        id="section-${key}" 
                        class="transition-all duration-300 ${isFirst ? 'max-h-[10000px]' : 'max-h-0'} overflow-hidden"
                        style="${isFirst ? '' : 'display: none;'}"
                    >
                        <div class="p-4 bg-white space-y-3 border-t border-gray-200">
            `;
            
            section.elements.forEach(element => {
                html += createElementEditor(element);
            });
            
            html += `
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        // No agregar script aquí, se manejará globalmente
        
        return html;
    }

    /**
     * Encuentra elementos editables en el documento
     */
    function findEditableElements(doc, pagePath) {
        const elements = [];
        const usedIds = new Set();
        
        // 1. Primero aplicar mapeo específico por página (elementos importantes)
        const pageMap = getPageMap(pagePath);
        
        pageMap.sections.forEach(section => {
            const selector = section.selector;
            const type = section.type; // 'text', 'image', 'video', 'list'
            
            try {
                // Validar y limpiar selector antes de usarlo
                const cleanSelector = sanitizeSelector(selector);
                if (!cleanSelector) {
                    console.warn('Selector no válido después de limpieza:', selector);
                    return;
                }
                
                const nodes = doc.querySelectorAll(cleanSelector);
                nodes.forEach((node, index) => {
                    const elementId = `${section.id}-${index}`;
                    if (!usedIds.has(elementId) && (node.textContent && node.textContent.trim())) {
                        // Generar selector único para este elemento específico
                        const uniqueSelector = generateUniqueSelector(node);
                        
                        elements.push({
                            id: elementId,
                            type: type,
                            selector: uniqueSelector, // Usar selector único en lugar del original
                            index: index,
                            originalHTML: node.outerHTML,
                            label: section.label || `${section.id} ${index + 1}`,
                            node: node
                        });
                        usedIds.add(elementId);
                    }
                });
            } catch (e) {
                console.warn('Error con selector:', selector, e);
                // Intentar con una estrategia alternativa
                try {
                    const altSelector = selector.replace(/[.:!\[\]()]/g, '').trim();
                    if (altSelector) {
                        const nodes = doc.querySelectorAll(altSelector);
                        console.info(`Selector alternativo usado para "${section.label}":`, altSelector);
                    }
                } catch (e2) {
                    console.warn('También falló el selector alternativo:', e2);
                }
            }
        });
        
        // 2. Detección automática de TODOS los elementos de texto
        const autoElements = autoDetectTextElements(doc, usedIds);
        elements.push(...autoElements);
        
        return elements;
    }

    /**
     * Detecta automáticamente todos los elementos de texto editables
     */
    function autoDetectTextElements(doc, usedIds) {
        const elements = [];
        let counter = 0;
        
        // Selectores para elementos de texto editables
        const textSelectors = [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p',
            'span:not(script):not(style):not(noscript)',
            'div:not(script):not(style):not(noscript)',
            'label',
            'a',
            'strong', 'b', 'em', 'i',
            'small',
            'blockquote',
            'td', 'th'
        ];
        
        // Excluir elementos que no deben editarse
        const excludeSelectors = [
            'script',
            'style',
            'noscript',
            '[data-include]', // Elementos parciales (navbar, footer)
            '[data-dropdown]',
            '.hidden',
            'meta',
            'title',
            'link'
        ];
        
        // Crear selector combinado
        const allTextSelector = textSelectors.join(', ');
        
        const allNodes = doc.querySelectorAll(allTextSelector);
        
        allNodes.forEach(node => {
            // Verificar que no esté excluido
            let shouldExclude = false;
            excludeSelectors.forEach(exclude => {
                if (node.matches && node.matches(exclude)) {
                    shouldExclude = true;
                }
                if (node.closest && node.closest(exclude)) {
                    shouldExclude = true;
                }
            });
            
            // Verificar que tenga texto y no esté vacío
            const text = node.textContent ? node.textContent.trim() : '';
            const hasText = text.length > 0;
            const hasOnlyWhitespace = !hasText;
            
            // Verificar que no sea solo un contenedor sin texto directo
            const hasDirectText = Array.from(node.childNodes).some(child => 
                child.nodeType === 3 && child.textContent.trim().length > 0
            );
            
            // Verificar que no esté dentro de un partial o elemento dinámico
            const isInPartial = node.closest('[data-include]') || 
                               node.closest('header') && node.closest('header').querySelector('[data-include]') ||
                               node.closest('footer') && node.closest('footer').querySelector('[data-include]');
            
            // Verificar que no sea hijo de un elemento ya editado
            const isChildOfEdited = Array.from(node.parentElement?.children || []).some(child => {
                return usedIds.has(child.id) || elements.some(el => el.node === child);
            });
            
            if (!shouldExclude && hasText && !isInPartial && !isChildOfEdited) {
                // Determinar tipo de elemento
                let type = 'text';
                let label = '';
                
                if (node.tagName && node.tagName.match(/^H[1-6]$/)) {
                    type = 'text';
                    label = `Título ${node.tagName} - "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`;
                } else if (node.tagName === 'P') {
                    type = 'text';
                    label = `Párrafo - "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`;
                } else if (node.tagName === 'A') {
                    type = 'link';
                    label = `Enlace - "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`;
                } else if (node.tagName === 'LABEL') {
                    type = 'text';
                    label = `Label - "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`;
                } else if (node.tagName === 'LI') {
                    type = 'text';
                    label = `Item de lista - "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`;
                } else if (node.tagName === 'SPAN' || node.tagName === 'DIV') {
                    // Solo incluir si tiene texto directo o es un elemento importante
                    if (hasDirectText || node.classList.contains('font-bold') || 
                        node.classList.contains('font-semibold') || 
                        node.getAttribute('data-aos')) {
                        type = 'text';
                        label = `Texto - "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`;
                    } else {
                        return; // Saltar elementos contenedores sin texto directo
                    }
                } else {
                    type = 'text';
                    label = `${node.tagName || 'Texto'} - "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`;
                }
                
                // Crear ID único
                const elementId = `auto-text-${counter++}`;
                
                // Crear selector único para este elemento
                const uniqueSelector = generateUniqueSelector(node);
                
                elements.push({
                    id: elementId,
                    type: type,
                    selector: uniqueSelector,
                    index: 0,
                    originalHTML: node.outerHTML,
                    label: label,
                    node: node
                });
                
                usedIds.add(elementId);
            }
        });
        
        // También detectar imágenes automáticamente
        const images = doc.querySelectorAll('img:not([data-include]):not(script img):not(style img)');
        images.forEach((img, index) => {
            const imgId = `auto-img-${index}`;
            if (!usedIds.has(imgId)) {
                const alt = img.alt || 'Imagen sin descripción';
                elements.push({
                    id: imgId,
                    type: 'image',
                    selector: generateUniqueSelector(img),
                    index: 0,
                    originalHTML: img.outerHTML,
                    label: `Imagen - "${alt}"`,
                    node: img
                });
                usedIds.add(imgId);
            }
        });
        
        return elements;
    }

    /**
     * Limpia y valida un selector CSS
     */
    function sanitizeSelector(selector) {
        if (!selector) return null;
        
        // Si el selector contiene clases de Tailwind con caracteres especiales,
        // intentar simplificarlo
        if (selector.includes(':') || selector.includes('!') || selector.includes('[')) {
            // Extraer solo la etiqueta y clases simples
            const parts = selector.split(' ');
            const simpleParts = parts.map(part => {
                // Si es un ID, mantenerlo
                if (part.startsWith('#')) {
                    return part;
                }
                // Si es una clase simple (sin caracteres especiales), mantenerla
                if (part.startsWith('.')) {
                    const className = part.substring(1);
                    if (!className.includes(':') && !className.includes('!') && !className.includes('[')) {
                        return part;
                    }
                    // Extraer solo la parte antes del primer carácter especial
                    const simplePart = className.split(/[:!\[\]]/)[0];
                    return simplePart ? '.' + simplePart : null;
                }
                // Si es una etiqueta, mantenerla
                if (/^[a-zA-Z][a-zA-Z0-9]*$/.test(part)) {
                    return part;
                }
                return null;
            }).filter(p => p !== null);
            
            return simpleParts.length > 0 ? simpleParts.join(' ') : null;
        }
        
        return selector;
    }

    /**
     * Escapa caracteres especiales en clases CSS para selectores
     */
    function escapeCssClass(className) {
        // Escapar caracteres especiales de CSS: : ! [ ] ( ) etc.
        return className.replace(/([:!\[\]()])/g, '\\$1');
    }

    /**
     * Genera un selector único para un elemento
     */
    function generateUniqueSelector(element) {
        if (element.id) {
            return `#${element.id}`;
        }
        
        // Intentar con clases únicas (solo clases simples sin caracteres especiales)
        if (element.className && typeof element.className === 'string') {
            const classes = element.className.split(' ')
                .filter(c => c.length > 0)
                .filter(c => !c.includes(':') && !c.includes('!') && !c.includes('[') && !c.includes(']'))
                .slice(0, 3); // Limitar a 3 clases para evitar selectores muy largos
            
            if (classes.length > 0) {
                // Escapar cada clase y crear selector
                const escapedClasses = classes.map(c => '.' + escapeCssClass(c));
                const classSelector = escapedClasses.join('');
                
                try {
                    // Verificar que solo seleccione este elemento
                    const matches = element.ownerDocument.querySelectorAll(classSelector);
                    if (matches.length === 1 && matches[0] === element) {
                        return classSelector;
                    }
                } catch (e) {
                    // Si el selector es inválido, continuar con otra estrategia
                    console.warn('Selector inválido:', classSelector, e);
                }
            }
        }
        
        // Usar path de nodos con atributos data- o posición
        const path = [];
        let current = element;
        let depth = 0;
        const maxDepth = 10; // Evitar bucles infinitos
        
        while (current && current !== current.ownerDocument.body && depth < maxDepth) {
            depth++;
            let selector = current.tagName.toLowerCase();
            
            // Preferir ID si existe
            if (current.id) {
                selector += `#${current.id}`;
                path.unshift(selector);
                break;
            }
            
            // Usar atributos data- si existen
            if (current.hasAttributes && current.hasAttributes()) {
                const attrs = Array.from(current.attributes);
                const dataAttr = attrs.find(a => a.name.startsWith('data-'));
                if (dataAttr) {
                    selector += `[${dataAttr.name}="${dataAttr.value}"]`;
                    path.unshift(selector);
                    break;
                }
            }
            
            // Usar clases simples (sin caracteres especiales)
            if (current.className && typeof current.className === 'string') {
                const simpleClasses = current.className.split(' ')
                    .filter(c => c.length > 0 && !c.includes(':') && !c.includes('!') && !c.includes('[') && !c.includes(']'))
                    .slice(0, 1); // Solo una clase simple
                
                if (simpleClasses.length > 0) {
                    selector += '.' + escapeCssClass(simpleClasses[0]);
                }
            }
            
            // Agregar índice para hacer único el selector
            const siblings = Array.from(current.parentElement?.children || []);
            const sameTagSiblings = siblings.filter(s => s.tagName === current.tagName);
            if (sameTagSiblings.length > 1) {
                const index = sameTagSiblings.indexOf(current);
                selector += `:nth-of-type(${index + 1})`;
            }
            
            path.unshift(selector);
            current = current.parentElement;
        }
        
        const finalSelector = path.join(' > ');
        
        // Validar que el selector sea válido
        try {
            element.ownerDocument.querySelector(finalSelector);
            return finalSelector;
        } catch (e) {
            // Si falla, usar un selector más simple basado en posición
            console.warn('Selector generado inválido, usando alternativa:', finalSelector, e);
            return generateFallbackSelector(element);
        }
    }

    /**
     * Genera un selector de respaldo basado en posición
     */
    function generateFallbackSelector(element) {
        const path = [];
        let current = element;
        let depth = 0;
        
        while (current && current !== current.ownerDocument.body && depth < 15) {
            depth++;
            const parent = current.parentElement;
            if (!parent) break;
            
            const siblings = Array.from(parent.children);
            const index = siblings.indexOf(current);
            
            path.unshift(`${current.tagName.toLowerCase()}:nth-child(${index + 1})`);
            current = parent;
        }
        
        return path.join(' > ');
    }

    /**
     * Crea el editor para un elemento específico
     */
    function createElementEditor(element) {
        // Mejorar la etiqueta para que sea más corta y descriptiva
        let shortLabel = element.label;
        
        // Simplificar etiquetas comunes
        shortLabel = shortLabel.replace(/^Título (H[1-6]) - /, 'Título: ');
        shortLabel = shortLabel.replace(/^Párrafo - /, 'Párrafo: ');
        shortLabel = shortLabel.replace(/^Enlace - /, 'Enlace: ');
        shortLabel = shortLabel.replace(/^Label - /, 'Label: ');
        shortLabel = shortLabel.replace(/^Item de lista - /, 'Lista: ');
        shortLabel = shortLabel.replace(/^Texto - /, 'Texto: ');
        
        // Si la etiqueta es muy larga, truncarla
        if (shortLabel.length > 60) {
            shortLabel = shortLabel.substring(0, 57) + '...';
        }
        
        // Extraer solo el selector más relevante (última parte)
        const selectorParts = element.selector.split('>').map(s => s.trim());
        const lastSelector = selectorParts[selectorParts.length - 1];
        const cleanSelector = lastSelector.length > 40 ? lastSelector.substring(0, 37) + '...' : lastSelector;
        
        let html = `
            <div class="border rounded-lg p-3 bg-white mb-2" data-element-id="${element.id}">
                <label class="block font-semibold text-gray-700 mb-1.5 text-xs">
                    ${escapeHtml(shortLabel)}
                </label>
                <p class="text-xs text-gray-400 mb-2 font-mono opacity-60">${escapeHtml(cleanSelector)}</p>
        `;
        
        if (element.type === 'text' || element.type === 'auto-text') {
            const text = getTextContent(element.originalHTML);
            const isLongText = text.length > 150;
            html += `
                <textarea 
                    class="w-full border rounded p-2 ${isLongText ? 'min-h-[150px]' : 'min-h-[80px]'}" 
                    data-editor="${element.id}"
                    data-type="text"
                    placeholder="Edita el texto aquí..."
                >${escapeHtml(text)}</textarea>
            `;
        } else if (element.type === 'link') {
            const text = getTextContent(element.originalHTML);
            const href = getLinkHref(element.originalHTML);
            html += `
                <div class="space-y-2">
                    <label class="text-xs text-gray-600">Texto del enlace:</label>
                    <input 
                        type="text" 
                        class="w-full border rounded p-2" 
                        data-editor="${element.id}-text"
                        data-type="link-text"
                        value="${escapeHtml(text)}"
                        placeholder="Texto del enlace"
                    >
                    <label class="text-xs text-gray-600">URL (href):</label>
                    <input 
                        type="text" 
                        class="w-full border rounded p-2" 
                        data-editor="${element.id}-href"
                        data-type="link-href"
                        value="${escapeHtml(href)}"
                        placeholder="URL del enlace"
                    >
                </div>
            `;
        } else if (element.type === 'image') {
            const src = getImageSrc(element.originalHTML);
            html += `
                <div class="flex gap-4">
                    <img src="${src}" alt="Preview" class="w-32 h-32 object-cover rounded border" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%27 height=%27100%27%3E%3Crect fill=%27%23ddd%27 width=%27100%27 height=%27100%27/%3E%3Ctext x=%2750%27 y=%2750%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%23999%27%3EImagen%3C/text%3E%3C/svg%3E'">
                    <div class="flex-1">
                        <input 
                            type="text" 
                            class="w-full border rounded p-2 mb-2" 
                            data-editor="${element.id}"
                            data-type="image"
                            value="${escapeHtml(src)}"
                            placeholder="URL de la imagen o selecciona de la biblioteca"
                        >
                        <button onclick="window.CMSMedia.selectImage('${element.id}')" class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                            <i class="fas fa-image mr-1"></i> Seleccionar de Biblioteca
                        </button>
                    </div>
                </div>
            `;
        } else if (element.type === 'list') {
            html += `
                <textarea 
                    class="w-full border rounded p-2 min-h-[150px]" 
                    data-editor="${element.id}"
                    data-type="list"
                    placeholder="Cada línea será un elemento de la lista"
                >${escapeHtml(getListContent(element.originalHTML))}</textarea>
            `;
        }
        
        html += '</div>';
        return html;
    }

    /**
     * Escapa HTML para mostrar en inputs
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Obtiene el href de un enlace
     */
    function getLinkHref(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const link = doc.querySelector('a');
        return link ? (link.href || link.getAttribute('href') || '') : '';
    }

    /**
     * Obtiene el contenido actual del editor
     */
    function getContent(container) {
        const edits = {};
        container.querySelectorAll('[data-editor]').forEach(input => {
            const elementId = input.getAttribute('data-editor');
            const type = input.getAttribute('data-type') || 'text';
            
            if (type === 'link-text' || type === 'link-href') {
                // Para enlaces, combinar texto y href
                const baseId = elementId.replace('-text', '').replace('-href', '');
                if (!edits[baseId]) {
                    edits[baseId] = { type: 'link', text: '', href: '' };
                }
                if (type === 'link-text') {
                    edits[baseId].text = input.value;
                } else {
                    edits[baseId].href = input.value;
                }
            } else {
                edits[elementId] = input.value;
            }
        });
        return edits;
    }

    /**
     * Extrae el texto de un elemento HTML
     */
    function getTextContent(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    }

    /**
     * Extrae el src de una imagen
     */
    function getImageSrc(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const img = doc.querySelector('img');
        return img ? img.src : '';
    }

    /**
     * Extrae el contenido de una lista
     */
    function getListContent(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const list = doc.querySelector('ul, ol');
        if (!list) return '';
        
        return Array.from(list.querySelectorAll('li'))
            .map(li => li.textContent.trim())
            .join('\n');
    }

    /**
     * Obtiene el mapeo de secciones editables por página
     */
    function getPageMap(pagePath) {
        const maps = {
            'index.html': {
                sections: [
                    { id: 'hero-title', selector: '#inicio h1', type: 'text', label: 'Título Principal (Hero)' },
                    { id: 'hero-subtitle', selector: '#inicio p.text-lg', type: 'text', label: 'Subtítulo (Hero)' },
                    { id: 'hero-images', selector: '#hero-slider img', type: 'image', label: 'Imágenes del Hero' },
                    { id: 'quienes-somos-title', selector: '#grupo h2', type: 'text', label: 'Título Quiénes Somos' },
                    { id: 'quienes-somos-text', selector: '#grupo p.text-lg', type: 'text', label: 'Texto Quiénes Somos' },
                    { id: 'servicios-titles', selector: '#empresas h3', type: 'text', label: 'Títulos de Servicios' },
                    { id: 'servicios-images', selector: '#empresas .img-hover img', type: 'image', label: 'Imágenes de Servicios' },
                ]
            },
            'grupo.html': {
                sections: [
                    { id: 'hero-title', selector: 'section.relative h1', type: 'text', label: 'Título Hero' },
                    { id: 'hero-subtitle', selector: 'section.relative p.text-lg', type: 'text', label: 'Subtítulo Hero' },
                    { id: 'quienes-somos-title', selector: '#quienes-somos h2', type: 'text', label: 'Título Quiénes Somos' },
                    { id: 'quienes-somos-text', selector: '#quienes-somos p.text-lg', type: 'text', label: 'Texto Quiénes Somos' },
                    { id: 'mision-title', selector: '#mision-vision h3:first-of-type', type: 'text', label: 'Título Misión' },
                    { id: 'mision-text', selector: '#mision-vision .group:first-of-type p', type: 'text', label: 'Texto Misión' },
                    { id: 'vision-title', selector: '#mision-vision h3:nth-of-type(2)', type: 'text', label: 'Título Visión' },
                    { id: 'vision-text', selector: '#mision-vision .group:nth-of-type(2) p', type: 'text', label: 'Texto Visión' },
                    { id: 'valores-titles', selector: '#valores h4', type: 'text', label: 'Títulos de Valores' },
                    { id: 'valores-text', selector: '#valores p.text-gray-700', type: 'text', label: 'Textos de Valores' },
                    { id: 'modelo-titles', selector: '#modelo-operacion h2, #modelo-operacion h3', type: 'text', label: 'Títulos Modelo de Operación' },
                    { id: 'modelo-text', selector: '#modelo-operacion p', type: 'text', label: 'Textos Modelo de Operación' },
                    { id: 'ambitos-titles', selector: '#ambitos h3, #ambitos h4', type: 'text', label: 'Títulos Ámbitos de Trabajo' },
                    { id: 'ambitos-text', selector: '#ambitos p', type: 'text', label: 'Textos Ámbitos de Trabajo' },
                    { id: 'ambitos-images', selector: '#ambitos img', type: 'image', label: 'Imágenes Ámbitos de Trabajo' },
                ]
            },
            'empresas.html': {
                sections: [
                    { id: 'hero-title', selector: 'section.relative h1', type: 'text', label: 'Título Hero' },
                    { id: 'hero-subtitle', selector: 'section.relative p.text-lg', type: 'text', label: 'Subtítulo Hero' },
                    { id: 'quienes-somos-title', selector: '#quienes-somos h2', type: 'text', label: 'Título Quiénes Somos' },
                    { id: 'quienes-somos-text', selector: '#quienes-somos p', type: 'text', label: 'Texto Quiénes Somos' },
                    { id: 'empresa-titles', selector: 'section.bg-white h3, section.bg-\\[\\#F8FAFC\\] h3', type: 'text', label: 'Títulos de Empresas' },
                    { id: 'empresa-desc', selector: 'section.bg-white p.text-justify-all, section.bg-\\[\\#F8FAFC\\] p.text-justify-all', type: 'text', label: 'Descripciones de Empresas' },
                    { id: 'empresa-servicios', selector: 'section.bg-white ul li, section.bg-\\[\\#F8FAFC\\] ul li', type: 'text', label: 'Lista de Servicios de Empresas' },
                    { id: 'empresa-images', selector: 'section.bg-white img, section.bg-\\[\\#F8FAFC\\] img', type: 'image', label: 'Imágenes de Empresas' },
                    { id: 'arquitectura-titles', selector: '#arquitectura h3, #arquitectura h4', type: 'text', label: 'Títulos Arquitectura Empresarial' },
                    { id: 'arquitectura-text', selector: '#arquitectura p', type: 'text', label: 'Textos Arquitectura Empresarial' },
                    { id: 'noticias-titles', selector: 'article h3, article h4', type: 'text', label: 'Títulos de Noticias' },
                    { id: 'noticias-text', selector: 'article p', type: 'text', label: 'Textos de Noticias' },
                    { id: 'noticias-images', selector: 'article img', type: 'image', label: 'Imágenes de Noticias' },
                ]
            },
            'katsumoto.html': {
                sections: [
                    { id: 'hero-title', selector: 'section.relative h1', type: 'text', label: 'Título Hero' },
                    { id: 'hero-subtitle', selector: 'section.relative p.text-lg', type: 'text', label: 'Subtítulo Hero' },
                    { id: 'datos-empresa', selector: '#datos strong, #datos .font-semibold', type: 'text', label: 'Datos de la Empresa (Labels)' },
                    { id: 'datos-valores', selector: '#datos div:not(:has(strong))', type: 'text', label: 'Valores de Datos' },
                    { id: 'descripcion-title', selector: '#descripcion h2, #descripcion h3', type: 'text', label: 'Título Descripción' },
                    { id: 'descripcion', selector: '#descripcion p.text-justify-all, section p.text-justify-all', type: 'text', label: 'Descripción de la Empresa' },
                    { id: 'servicios-title', selector: '#servicios h2, #servicios h3', type: 'text', label: 'Título Servicios' },
                    { id: 'servicios-list', selector: '#servicios ul li, #servicios ol li', type: 'text', label: 'Lista de Servicios' },
                    { id: 'proyectos-titles', selector: '#proyectos h3, #proyectos h4', type: 'text', label: 'Títulos de Proyectos' },
                    { id: 'proyectos-text', selector: '#proyectos p', type: 'text', label: 'Textos de Proyectos' },
                    { id: 'proyectos-images', selector: '#proyectos img', type: 'image', label: 'Imágenes de Proyectos' },
                ]
            },
            'brontes.html': {
                sections: [
                    { id: 'hero-title', selector: 'section.relative h1', type: 'text', label: 'Título Hero' },
                    { id: 'hero-subtitle', selector: 'section.relative p.text-lg', type: 'text', label: 'Subtítulo Hero' },
                    { id: 'hero-slogan', selector: 'section.relative p.text-base', type: 'text', label: 'Slogan Hero' },
                    { id: 'datos-empresa', selector: '#datos strong, #datos .font-semibold', type: 'text', label: 'Datos de la Empresa (Labels)' },
                    { id: 'datos-valores', selector: '#datos div:not(:has(strong))', type: 'text', label: 'Valores de Datos' },
                    { id: 'descripcion-title', selector: '#descripcion h2, #descripcion h3', type: 'text', label: 'Título Descripción' },
                    { id: 'descripcion', selector: '#descripcion p.text-justify-all, section p.text-justify-all', type: 'text', label: 'Descripción de la Empresa' },
                    { id: 'servicios-title', selector: '#servicios h2, #servicios h3', type: 'text', label: 'Título Servicios' },
                    { id: 'servicios-list', selector: '#servicios ul li, #servicios ol li', type: 'text', label: 'Lista de Servicios' },
                    { id: 'proyectos-titles', selector: '#proyectos h3, #proyectos h4', type: 'text', label: 'Títulos de Proyectos' },
                    { id: 'proyectos-text', selector: '#proyectos p', type: 'text', label: 'Textos de Proyectos' },
                    { id: 'proyectos-images', selector: '#proyectos img', type: 'image', label: 'Imágenes de Proyectos' },
                ]
            },
            'argos.html': {
                sections: [
                    { id: 'hero-title', selector: 'section.relative h1', type: 'text', label: 'Título Hero' },
                    { id: 'hero-subtitle', selector: 'section.relative p.text-lg', type: 'text', label: 'Subtítulo Hero' },
                    { id: 'hero-slogan', selector: 'section.relative p.text-base', type: 'text', label: 'Slogan Hero' },
                    { id: 'datos-empresa', selector: '#datos strong, #datos .font-semibold', type: 'text', label: 'Datos de la Empresa (Labels)' },
                    { id: 'datos-valores', selector: '#datos div:not(:has(strong))', type: 'text', label: 'Valores de Datos' },
                    { id: 'descripcion-title', selector: '#descripcion h2, #descripcion h3', type: 'text', label: 'Título Descripción' },
                    { id: 'descripcion', selector: '#descripcion p.text-justify-all, section p.text-justify-all', type: 'text', label: 'Descripción de la Empresa' },
                    { id: 'servicios-title', selector: '#servicios h2, #servicios h3', type: 'text', label: 'Título Servicios' },
                    { id: 'servicios-list', selector: '#servicios ul li, #servicios ol li', type: 'text', label: 'Lista de Servicios' },
                    { id: 'proyectos-titles', selector: '#proyectos h3, #proyectos h4', type: 'text', label: 'Títulos de Proyectos' },
                    { id: 'proyectos-text', selector: '#proyectos p', type: 'text', label: 'Textos de Proyectos' },
                    { id: 'proyectos-images', selector: '#proyectos img', type: 'image', label: 'Imágenes de Proyectos' },
                ]
            },
            'proyectos.html': {
                sections: [
                    { id: 'hero-title', selector: 'section.relative h1', type: 'text', label: 'Título Hero' },
                    { id: 'hero-subtitle', selector: 'section.relative p.text-lg', type: 'text', label: 'Subtítulo Hero' },
                    { id: 'seccion-titles', selector: 'section h2', type: 'text', label: 'Títulos de Secciones' },
                    { id: 'seccion-subtitles', selector: 'section .inline-block, section .text-sm', type: 'text', label: 'Subtítulos/Badges de Secciones' },
                    { id: 'seccion-desc', selector: 'section p.text-gray-600', type: 'text', label: 'Descripciones de Secciones' },
                    { id: 'proyecto-titles', selector: '.font-semibold.text-\\[\\#040872\\].text-lg', type: 'text', label: 'Títulos de Proyectos' },
                    { id: 'proyecto-locations', selector: '.text-sm.text-gray-600', type: 'text', label: 'Ubicaciones de Proyectos' },
                    { id: 'proyecto-images', selector: '.rounded-xl img, .rounded-lg img', type: 'image', label: 'Imágenes de Proyectos' },
                    { id: 'modal-titles', selector: '#modal-proyecto h2, #modal-consultoria h2, #modal-bienes h2, #modal-topografia h2', type: 'text', label: 'Títulos en Modales' },
                    { id: 'modal-text', selector: '.modal p.text-gray-700', type: 'text', label: 'Textos en Modales' },
                    { id: 'modal-lists', selector: '.modal ul li', type: 'text', label: 'Items de Lista en Modales' },
                ]
            },
            'noticias.html': {
                sections: [
                    { id: 'hero-title', selector: 'section.relative h1', type: 'text', label: 'Título Hero' },
                    { id: 'hero-subtitle', selector: 'section.relative p.text-lg', type: 'text', label: 'Subtítulo Hero' },
                    { id: 'noticia-titles', selector: 'article h3, article h2, article .font-bold', type: 'text', label: 'Títulos de Noticias' },
                    { id: 'noticia-fechas', selector: 'article .text-sm.text-gray-500, article time', type: 'text', label: 'Fechas de Noticias' },
                    { id: 'noticia-text', selector: 'article p.text-gray-700, article p.text-gray-600', type: 'text', label: 'Texto de Noticias' },
                    { id: 'noticia-images', selector: 'article img', type: 'image', label: 'Imágenes de Noticias' },
                    { id: 'noticia-enlaces', selector: 'article a', type: 'link', label: 'Enlaces en Noticias' },
                ]
            },
            'contacto.html': {
                sections: [
                    { id: 'hero-title', selector: 'section.relative h1', type: 'text', label: 'Título Hero' },
                    { id: 'hero-subtitle', selector: 'section.relative p.text-lg', type: 'text', label: 'Subtítulo Hero' },
                    { id: 'contacto-section-title', selector: '#contacto h2, section h2', type: 'text', label: 'Título Sección Contacto' },
                    { id: 'direccion-label', selector: '*:has-text("Dirección") strong, *:has-text("Dirección") .font-semibold', type: 'text', label: 'Label Dirección' },
                    { id: 'direccion', selector: '*:has-text("Av."), *:has-text("Alejandro Velasco")', type: 'text', label: 'Valor Dirección' },
                    { id: 'telefono-label', selector: '*:has-text("Teléfono") strong, *:has-text("Teléfono") .font-semibold', type: 'text', label: 'Label Teléfono' },
                    { id: 'telefono', selector: '*:has-text("+51")', type: 'text', label: 'Valor Teléfono' },
                    { id: 'email-label', selector: '*:has-text("Email") strong, *:has-text("Email") .font-semibold', type: 'text', label: 'Label Email' },
                    { id: 'email', selector: '*:has-text("info@")', type: 'text', label: 'Valor Email' },
                    { id: 'horarios', selector: '*:has-text("Horario")', type: 'text', label: 'Horarios de Atención' },
                    { id: 'form-labels', selector: 'form label', type: 'text', label: 'Labels de Formulario' },
                    { id: 'form-placeholders', selector: 'input[placeholder], textarea[placeholder]', type: 'text', label: 'Placeholders de Formulario' },
                ]
            },
            'staff.html': {
                sections: [
                    { id: 'hero-title', selector: 'section.relative h1', type: 'text', label: 'Título Hero' },
                    { id: 'hero-subtitle', selector: 'section.relative p.text-lg', type: 'text', label: 'Subtítulo Hero' },
                    { id: 'section-titles', selector: 'section h2, section h3', type: 'text', label: 'Títulos de Secciones por Empresa' },
                    { id: 'staff-nombres', selector: '.staff-card h4, .staff-card h3', type: 'text', label: 'Nombres del Staff' },
                    { id: 'staff-cargos', selector: '.staff-card .text-sm.text-gray-600, .staff-card .text-gray-500', type: 'text', label: 'Cargos del Staff' },
                    { id: 'staff-desc', selector: '.staff-card p', type: 'text', label: 'Descripciones del Staff' },
                    { id: 'staff-images', selector: '.staff-card img', type: 'image', label: 'Fotos del Staff' },
                ]
            },
            'proveedor.html': {
                sections: [
                    { id: 'hero-title', selector: 'section.relative h1', type: 'text', label: 'Título Hero' },
                    { id: 'hero-subtitle', selector: 'section.relative p.text-lg', type: 'text', label: 'Subtítulo Hero' },
                    { id: 'form-section-title', selector: 'section h2, section h3', type: 'text', label: 'Título de Sección' },
                    { id: 'form-labels', selector: 'form label, .font-semibold', type: 'text', label: 'Labels de Formulario' },
                    { id: 'form-placeholders', selector: 'input[placeholder], textarea[placeholder], select', type: 'text', label: 'Placeholders de Formulario' },
                    { id: 'help-text', selector: '.text-sm.text-gray-600, .text-xs', type: 'text', label: 'Textos de Ayuda' },
                ]
            },
            'empleo.html': {
                sections: [
                    { id: 'hero-title', selector: 'section.relative h1', type: 'text', label: 'Título Hero' },
                    { id: 'hero-subtitle', selector: 'section.relative p.text-lg', type: 'text', label: 'Subtítulo Hero' },
                    { id: 'form-section-title', selector: 'section h2, section h3', type: 'text', label: 'Título de Sección' },
                    { id: 'form-labels', selector: 'form label, .font-semibold', type: 'text', label: 'Labels de Formulario' },
                    { id: 'form-placeholders', selector: 'input[placeholder], textarea[placeholder]', type: 'text', label: 'Placeholders de Formulario' },
                    { id: 'help-text', selector: '.text-sm.text-gray-600, .text-xs', type: 'text', label: 'Textos de Ayuda' },
                ]
            },
            'reclamaciones.html': {
                sections: [
                    { id: 'hero-title', selector: 'section.relative h1', type: 'text', label: 'Título Hero' },
                    { id: 'hero-subtitle', selector: 'section.relative p.text-lg', type: 'text', label: 'Subtítulo Hero' },
                    { id: 'form-section-title', selector: 'section h2, section h3', type: 'text', label: 'Título de Sección' },
                    { id: 'form-labels', selector: 'form label, .font-semibold', type: 'text', label: 'Labels de Formulario' },
                    { id: 'form-placeholders', selector: 'input[placeholder], textarea[placeholder]', type: 'text', label: 'Placeholders de Formulario' },
                    { id: 'help-text', selector: '.text-sm.text-gray-600, .text-xs', type: 'text', label: 'Textos de Ayuda' },
                ]
            },
        };
        
        // Para páginas no mapeadas, retornar mapeo vacío (la auto-detección se encargará)
        return maps[pagePath] || { sections: [] };
    }

    // Función global para toggle de secciones (disponible después de cargar)
    window.toggleSection = function(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        const icon = document.getElementById('icon-' + sectionId);
        if (!icon) return;
        
        const isHidden = section.style.display === 'none' || 
                         window.getComputedStyle(section).maxHeight === '0px' ||
                         (!section.style.display && section.classList.contains('max-h-0'));
        
        if (isHidden) {
            // Expandir
            section.style.display = 'block';
            // Forzar reflow
            void section.offsetHeight;
            section.style.maxHeight = '10000px';
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-down');
        } else {
            // Colapsar
            section.style.maxHeight = section.scrollHeight + 'px';
            // Forzar reflow
            void section.offsetHeight;
            section.style.maxHeight = '0';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-right');
            setTimeout(() => {
                if (section.style.maxHeight === '0px' || section.style.maxHeight === '0') {
                    section.style.display = 'none';
                }
            }, 300);
        }
    };

    return {
        createEditor,
        getContent
    };
})();

