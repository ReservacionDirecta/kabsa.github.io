/**
 * API de comunicación para guardar/cargar contenido
 * En producción, esto debería comunicarse con un backend real
 */

window.CMSAPI = (function() {
    'use strict';

    const CONTENT_STORAGE_KEY = 'cms_content_data';
    
    /**
     * Guarda el contenido de una página
     */
    async function savePageContent(pagePath, contentEdits) {
        return new Promise((resolve, reject) => {
            try {
                console.log('💾 savePageContent: Guardando para', pagePath);
                console.log('📦 Contenido a guardar:', Object.keys(contentEdits).length, 'elementos');
                
                // Obtener contenido actual
                const allContent = getAllContent();
                
                // Actualizar o crear entrada para esta página
                if (!allContent[pagePath]) {
                    allContent[pagePath] = {};
                }
                
                // Fusionar el contenido existente con las nuevas ediciones
                allContent[pagePath] = {
                    ...allContent[pagePath],
                    ...contentEdits,
                    lastModified: new Date().toISOString()
                };
                
                // Guardar en localStorage (en producción, sería una petición al servidor)
                const jsonData = JSON.stringify(allContent);
                localStorage.setItem(CONTENT_STORAGE_KEY, jsonData);
                
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
                    pagePath: pagePath
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
        const lastEdit = pages.length > 0 
            ? allContent[pages[pages.length - 1]].lastModified 
            : null;
        
        // Actualizar UI si existe
        const lastEditEl = document.getElementById('lastEdit');
        if (lastEditEl && lastEdit) {
            const date = new Date(lastEdit);
            lastEditEl.textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
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
        updateStats
    };
})();

// La función getMediaLibrary ya está expuesta en media-manager.js

