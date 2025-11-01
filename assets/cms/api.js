/**
 * API de comunicación para guardar/cargar contenido
 * En producción, esto debería comunicarse con un backend real
 */

window.CMSAPI = (function() {
    'use strict';

    const CONTENT_STORAGE_KEY = 'cms_content_data';
    
    /**
     * Limpia imágenes base64 grandes que excedan el límite
     */
    function cleanLargeBase64Images(contentEdits) {
        const MAX_BASE64_SIZE = 100000; // ~100KB en caracteres base64
        const cleaned = {};
        let removedCount = 0;
        
        for (const [key, value] of Object.entries(contentEdits)) {
            if (value && typeof value === 'object' && value.value) {
                const val = value.value;
                // Detectar si es una imagen base64 grande
                if (typeof val === 'string' && val.startsWith('data:image') && val.length > MAX_BASE64_SIZE) {
                    console.warn(`⚠️ Imagen base64 demasiado grande ignorada: ${key} (${Math.round(val.length / 1024)}KB)`);
                    removedCount++;
                    // No guardar esta imagen
                    continue;
                }
            }
            cleaned[key] = value;
        }
        
        if (removedCount > 0) {
            console.log(`🧹 Se removieron ${removedCount} imagen(es) base64 grande(s) para evitar exceder el límite de almacenamiento`);
        }
        
        return cleaned;
    }
    
    /**
     * Limpia contenido antiguo para liberar espacio
     */
    function cleanOldContent(allContent) {
        const MAX_AGE_DAYS = 90; // Mantener contenido de los últimos 90 días
        const now = Date.now();
        const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
        const cleaned = {};
        
        for (const [pagePath, pageContent] of Object.entries(allContent)) {
            if (pageContent && pageContent.lastModified) {
                const lastModified = new Date(pageContent.lastModified).getTime();
                const age = now - lastModified;
                
                if (age < maxAge) {
                    cleaned[pagePath] = pageContent;
                } else {
                    console.log(`🗑️ Limpiando contenido antiguo de: ${pagePath}`);
                }
            } else {
                // Si no tiene fecha, mantenerlo (puede ser nuevo)
                cleaned[pagePath] = pageContent;
            }
        }
        
        return cleaned;
    }
    
    /**
     * Calcula el tamaño aproximado de un objeto en bytes
     */
    function getStorageSize(obj) {
        return new Blob([JSON.stringify(obj)]).size;
    }
    
    /**
     * Obtiene el espacio disponible en localStorage (estimación)
     */
    function getAvailableStorage() {
        try {
            // Calcular el espacio usado actualmente
            let usedSize = 0;
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key) {
                        const value = localStorage.getItem(key);
                        if (value) {
                            usedSize += key.length + value.length;
                        }
                    }
                }
            } catch (e) {
                console.warn('Error calculando espacio usado:', e);
            }
            
            // localStorage típicamente tiene ~5-10MB de espacio
            // Usar 4MB como límite seguro para dejar margen
            const estimatedTotal = 4 * 1024 * 1024; // 4MB seguro
            const available = Math.max(0, estimatedTotal - usedSize);
            
            return available;
        } catch (e) {
            return 0;
        }
    }
    
    /**
     * Guarda el contenido de una página
     */
    async function savePageContent(pagePath, contentEdits) {
        return new Promise((resolve, reject) => {
            try {
                console.log('💾 savePageContent: Guardando para', pagePath);
                console.log('📦 Contenido a guardar:', Object.keys(contentEdits).length, 'elementos');
                
                // Limpiar imágenes base64 grandes
                const cleanedEdits = cleanLargeBase64Images(contentEdits);
                const removedImages = Object.keys(contentEdits).length - Object.keys(cleanedEdits).length;
                if (removedImages > 0) {
                    console.warn(`⚠️ Se removieron ${removedImages} imagen(es) base64 grande(s). Usa URLs de imágenes externas en su lugar.`);
                }
                
                // Obtener contenido actual
                let allContent = getAllContent();
                
                // Limpiar contenido antiguo antes de guardar
                allContent = cleanOldContent(allContent);
                
                // Actualizar o crear entrada para esta página
                if (!allContent[pagePath]) {
                    allContent[pagePath] = {};
                }
                
                // Fusionar el contenido existente con las nuevas ediciones
                allContent[pagePath] = {
                    ...allContent[pagePath],
                    ...cleanedEdits,
                    lastModified: new Date().toISOString()
                };
                
                // Verificar el tamaño antes de guardar
                const jsonData = JSON.stringify(allContent);
                const dataSize = new Blob([jsonData]).size;
                const availableSpace = getAvailableStorage();
                
                console.log(`📊 Tamaño de datos: ${Math.round(dataSize / 1024)}KB`);
                console.log(`📊 Espacio disponible estimado: ${Math.round(availableSpace / 1024)}KB`);
                
                // Si los datos son demasiado grandes, intentar limpiar más
                if (dataSize > availableSpace && dataSize > 3 * 1024 * 1024) { // Si es mayor a 3MB
                    console.warn('⚠️ Datos muy grandes. Limpiando contenido no esencial...');
                    
                    // Remover todas las imágenes base64 de todas las páginas
                    for (const [page, content] of Object.entries(allContent)) {
                        if (page === pagePath) continue; // No limpiar la página actual
                        
                        for (const [key, value] of Object.entries(content)) {
                            if (key === 'lastModified') continue;
                            if (value && typeof value === 'object' && value.value) {
                                const val = value.value;
                                if (typeof val === 'string' && val.startsWith('data:image')) {
                                    delete allContent[page][key];
                                }
                            }
                        }
                    }
                }
                
                // Intentar guardar
                try {
                    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(allContent));
                } catch (quotaError) {
                    if (quotaError.name === 'QuotaExceededError') {
                        // Si aún falla, intentar limpiar más espacio
                        console.error('❌ Cuota excedida. Limpiando espacio adicional...');
                        
                        // Limpiar todas las imágenes base64 de todas las páginas
                        let totalCleaned = 0;
                        for (const [page, content] of Object.entries(allContent)) {
                            const beforeCount = Object.keys(content).length;
                            for (const [key, value] of Object.entries(content)) {
                                if (key === 'lastModified') continue;
                                if (value && typeof value === 'object' && value.value) {
                                    const val = value.value;
                                    if (typeof val === 'string' && val.startsWith('data:image')) {
                                        delete allContent[page][key];
                                        totalCleaned++;
                                    }
                                }
                            }
                        }
                        
                        console.log(`🧹 Limpiadas ${totalCleaned} imágenes base64 adicionales`);
                        
                        // Intentar guardar de nuevo
                        try {
                            localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(allContent));
                            console.log('✅ Guardado exitoso después de limpieza');
                        } catch (retryError) {
                            // Si aún falla, rechazar con mensaje claro
                            reject(new Error(
                                `No se pudo guardar: el almacenamiento local está lleno.\n\n` +
                                `Solución: Elimina imágenes base64 grandes o exporta/limpia contenido antiguo.\n\n` +
                                `Error: ${retryError.message}`
                            ));
                            return;
                        }
                    } else {
                        throw quotaError;
                    }
                }
                
                // Verificar que se guardó correctamente
                const verify = localStorage.getItem(CONTENT_STORAGE_KEY);
                const verifyData = verify ? JSON.parse(verify) : {};
                const savedCount = verifyData[pagePath] ? Object.keys(verifyData[pagePath]).filter(k => k !== 'lastModified').length : 0;
                
                console.log('✅ savePageContent: Guardado exitoso. Elementos guardados:', savedCount);
                
                // Actualizar estadísticas
                updateStats();
                
                resolve({ 
                    success: true, 
                    savedElements: savedCount,
                    pagePath: pagePath,
                    removedImages: removedImages
                });
            } catch (error) {
                console.error('❌ savePageContent: Error al guardar:', error);
                reject(error);
            }
        });
    }

    /**
     * Obtiene todo el contenido guardado
     */
    function getAllContent() {
        const stored = localStorage.getItem(CONTENT_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    }

    /**
     * Exporta todo el contenido como JSON
     */
    async function exportContent() {
        const content = getAllContent();
        const mediaLibrary = window.CMSMedia ? window.CMSMedia.getMediaLibrary() : [];
        
        const exportData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            content: content,
            media: mediaLibrary
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        return blob;
    }

    /**
     * Importa contenido desde un JSON
     */
    async function importContent(data) {
        if (data.content) {
            localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(data.content));
        }
        
        if (data.media && window.CMSMedia) {
            localStorage.setItem('cms_media_library', JSON.stringify(data.media));
        }
        
        return { success: true };
    }

    /**
     * Aplica el contenido guardado al DOM de una página
     */
    function applyContentToPage(pagePath) {
        const allContent = getAllContent();
        const pageContent = allContent[pagePath];
        
        if (!pageContent || Object.keys(pageContent).length === 0) {
            return false;
        }
        
        let appliedCount = 0;
        
        // Aplicar cada edición
        Object.keys(pageContent).forEach(elementId => {
            if (elementId === 'lastModified') return; // Saltar metadatos
            
            const edit = pageContent[elementId];
            
            // Si es un string simple (formato antiguo), convertir a formato nuevo
            let selector, value, type;
            if (typeof edit === 'string') {
                // Formato antiguo: solo valor
                selector = null;
                value = edit;
                type = 'text';
            } else {
                // Formato nuevo: objeto con selector y valor
                selector = edit.selector;
                type = edit.type || 'text';
                
                if (type === 'link') {
                    // Para enlaces, aplicar texto y href
                    if (edit.selector) {
                        try {
                            const linkElement = document.querySelector(edit.selector);
                            if (linkElement && linkElement.tagName === 'A') {
                                if (edit.text) linkElement.textContent = edit.text;
                                if (edit.href) linkElement.href = edit.href;
                                appliedCount++;
                            }
                        } catch (e) {
                            console.warn('Error aplicando edición de enlace:', elementId, e);
                        }
                    }
                    return; // Ya se procesó el enlace
                } else {
                    value = edit.value || edit;
                }
            }
            
            if (!selector) {
                console.warn('No hay selector para elemento:', elementId);
                return;
            }
            
            try {
                // Intentar encontrar el elemento por selector
                const element = document.querySelector(selector);
                
                if (element) {
                    if (type === 'data-bg-image') {
                        // Para atributos data-bg-image, actualizar el atributo
                        if (value) {
                            element.setAttribute('data-bg-image', value);
                            appliedCount++;
                        }
                    } else if (type === 'inline-bg-image') {
                        // Para imágenes de fondo inline, actualizar el estilo
                        if (value && value.trim() !== '') {
                            const currentStyle = element.getAttribute('style') || '';
                            let newStyle = currentStyle.replace(/background-image\s*:\s*url\([^)]+\)/gi, '');
                            newStyle = newStyle.trim();
                            if (newStyle && !newStyle.endsWith(';')) {
                                newStyle += ';';
                            }
                            newStyle += ` background-image: url('${value}');`;
                            element.setAttribute('style', newStyle.trim());
                            appliedCount++;
                        }
                    } else if (type === 'image') {
                        // Para imágenes, actualizar el src
                        element.src = value;
                        if (element.getAttribute('srcset')) {
                            element.removeAttribute('srcset');
                        }
                        appliedCount++;
                    } else if (type === 'text' || type === 'auto-text') {
                        // Para texto, actualizar el contenido
                        element.textContent = value;
                        appliedCount++;
                    } else if (type === 'list') {
                        // Para listas, dividir por líneas y crear items
                        if (element.tagName === 'UL' || element.tagName === 'OL') {
                            const items = value.split('\n').filter(line => line.trim().length > 0);
                            element.innerHTML = items.map(item => `<li>${escapeHtml(item.trim())}</li>`).join('');
                            appliedCount++;
                        }
                    }
                } else {
                    console.warn('Elemento no encontrado con selector:', selector);
                }
            } catch (e) {
                console.warn('Error aplicando edición:', elementId, selector, e);
            }
        });
        
        return appliedCount > 0;
    }
    
    /**
     * Escapa HTML para prevenir XSS
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Actualiza las estadísticas del dashboard
     */
    function updateStats() {
        const allContent = getAllContent();
        const pages = Object.keys(allContent);
        
        // Encontrar la última edición más reciente
        let lastEdit = null;
        let lastEditPage = null;
        pages.forEach(page => {
            const pageData = allContent[page];
            if (pageData && pageData.lastModified) {
                const editDate = new Date(pageData.lastModified);
                if (!lastEdit || editDate > lastEdit) {
                    lastEdit = editDate;
                    lastEditPage = page;
                }
            }
        });
        
        // Actualizar UI de última edición
        const lastEditEl = document.getElementById('lastEdit');
        if (lastEditEl) {
            if (lastEdit) {
                const date = new Date(lastEdit);
                const now = new Date();
                const diffMs = now - date;
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMs / 3600000);
                const diffDays = Math.floor(diffMs / 86400000);
                
                let timeText = '';
                if (diffMins < 1) {
                    timeText = 'Hace un momento';
                } else if (diffMins < 60) {
                    timeText = `Hace ${diffMins} min`;
                } else if (diffHours < 24) {
                    timeText = `Hace ${diffHours} h`;
                } else if (diffDays < 7) {
                    timeText = `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
                } else {
                    timeText = date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
                }
                
                lastEditEl.textContent = timeText;
                lastEditEl.title = `Última edición: ${date.toLocaleString('es-PE')} - ${lastEditPage}`;
            } else {
                lastEditEl.textContent = 'Nunca';
            }
        }
        
        // Calcular total de elementos editados
        let totalEdits = 0;
        pages.forEach(page => {
            const pageData = allContent[page];
            if (pageData) {
                totalEdits += Object.keys(pageData).filter(k => k !== 'lastModified').length;
            }
        });
        
        const totalEditsEl = document.getElementById('totalEdits');
        if (totalEditsEl) {
            totalEditsEl.textContent = totalEdits;
        }
        
        // Calcular espacio usado
        try {
            let usedSize = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('cms_')) {
                    const value = localStorage.getItem(key);
                    if (value) {
                        usedSize += key.length + value.length;
                    }
                }
            }
            const usedKB = Math.round(usedSize / 1024);
            const storageUsedEl = document.getElementById('storageUsed');
            if (storageUsedEl) {
                storageUsedEl.textContent = usedKB > 1024 ? `${(usedKB / 1024).toFixed(1)} MB` : `${usedKB} KB`;
                storageUsedEl.style.color = usedKB > 3000 ? '#dc2626' : usedKB > 2000 ? '#f59e0b' : '#059669';
            }
        } catch (e) {
            console.warn('Error calculando espacio usado:', e);
        }
        
        // Actualizar noticias
        try {
            if (window.CMSNews) {
                window.CMSNews.loadNews().then(news => {
                    const totalNewsEl = document.getElementById('totalNews');
                    if (totalNewsEl && news) {
                        totalNewsEl.textContent = news.length;
                    }
                }).catch(() => {});
            }
        } catch (e) {
            console.warn('Error cargando noticias:', e);
        }
        
        // Actualizar medios
        try {
            if (window.CMSMedia && window.CMSMedia.getMediaLibrary) {
                const media = window.CMSMedia.getMediaLibrary();
                const totalMediaEl = document.getElementById('totalMedia');
                if (totalMediaEl) {
                    totalMediaEl.textContent = media.length;
                }
            }
        } catch (e) {
            console.warn('Error cargando medios:', e);
        }
        
        // Mostrar páginas más editadas
        updateMostEditedPages(allContent);
    }
    
    /**
     * Actualiza la lista de páginas más editadas
     */
    function updateMostEditedPages(allContent) {
        const pagesList = [];
        
        Object.keys(allContent).forEach(pagePath => {
            const pageData = allContent[pagePath];
            if (pageData) {
                const editCount = Object.keys(pageData).filter(k => k !== 'lastModified').length;
                if (editCount > 0) {
                    pagesList.push({
                        path: pagePath,
                        count: editCount,
                        lastModified: pageData.lastModified
                    });
                }
            }
        });
        
        // Ordenar por cantidad de ediciones
        pagesList.sort((a, b) => b.count - a.count);
        
        const container = document.getElementById('mostEditedPages');
        if (container) {
            if (pagesList.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-sm">Aún no hay ediciones</p>';
            } else {
                container.innerHTML = pagesList.slice(0, 5).map((page, index) => {
                    const pageName = page.path.replace('.html', '').replace('index', 'Inicio');
                    return `
                        <div class="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors cursor-pointer" onclick="window.showSection('pages'); window.editPage('${page.path}')">
                            <div class="flex items-center gap-2">
                                <span class="text-sm font-semibold text-gray-600 w-6">${index + 1}.</span>
                                <span class="text-sm text-gray-800">${pageName}</span>
                            </div>
                            <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">${page.count} edit.</span>
                        </div>
                    `;
                }).join('');
            }
        }
    }

    /**
     * Inicializa las estadísticas
     */
    function initStats() {
        const totalPagesEl = document.getElementById('totalPages');
        if (totalPagesEl) {
            totalPagesEl.textContent = '14'; // Número total de páginas
        }
        
        const totalMediaEl = document.getElementById('totalMedia');
        if (totalMediaEl && window.CMSMedia) {
            const media = window.CMSMedia.getMediaLibrary();
            totalMediaEl.textContent = media.length;
        }
        
        updateStats();
    }

    // Inicializar al cargar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStats);
    } else {
        initStats();
    }

    return {
        savePageContent,
        getAllContent,
        exportContent,
        importContent,
        applyContentToPage,
        updateStats,
        updateMostEditedPages
    };
})();

// La función getMediaLibrary ya está expuesta en media-manager.js

