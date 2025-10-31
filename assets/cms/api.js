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
                // Obtener contenido actual
                const allContent = getAllContent();
                
                // Actualizar o crear entrada para esta página
                if (!allContent[pagePath]) {
                    allContent[pagePath] = {};
                }
                
                allContent[pagePath] = {
                    ...allContent[pagePath],
                    ...contentEdits,
                    lastModified: new Date().toISOString()
                };
                
                // Guardar en localStorage (en producción, sería una petición al servidor)
                localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(allContent));
                
                // Actualizar estadísticas
                updateStats();
                
                resolve({ success: true });
            } catch (error) {
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
     * Aplica el contenido guardado a una página
     */
    function applyContentToPage(pagePath, originalHTML) {
        const allContent = getAllContent();
        const pageContent = allContent[pagePath];
        
        if (!pageContent || Object.keys(pageContent).length === 0) {
            return originalHTML;
        }
        
        // Aquí se aplicaría el contenido guardado al HTML
        // Por simplicidad, retornamos el HTML original
        // En producción, esto requeriría un sistema más sofisticado
        return originalHTML;
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

