/**
 * Aplicador de Contenido CMS
 * Este script se ejecuta en cada página para aplicar los cambios guardados desde el CMS
 */

(function() {
    'use strict';
    
    /**
     * Obtiene el nombre de la página actual
     */
    function getCurrentPagePath() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        return filename;
    }
    
    /**
     * Obtiene todo el contenido guardado desde localStorage
     */
    function getAllContent() {
        const CONTENT_STORAGE_KEY = 'cms_content_data';
        const stored = localStorage.getItem(CONTENT_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
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
     * Aplica el contenido guardado al DOM
     */
    function applyContent() {
        const pagePath = getCurrentPagePath();
        const allContent = getAllContent();
        const pageContent = allContent[pagePath];
        
        console.log('🔄 applyContent: Aplicando contenido para', pagePath);
        
        if (!pageContent || Object.keys(pageContent).length === 0) {
            console.log('ℹ️ applyContent: No hay contenido guardado para', pagePath);
            return;
        }
        
        const totalElements = Object.keys(pageContent).filter(k => k !== 'lastModified').length;
        console.log('📋 applyContent: Elementos a aplicar:', totalElements);
        
        let appliedCount = 0;
        let failedCount = 0;
        
        // Esperar a que el DOM esté completamente cargado
        const applyChanges = () => {
            Object.keys(pageContent).forEach((elementId, index) => {
                if (elementId === 'lastModified') return; // Saltar metadatos
                
                if (index < 3) {
                    console.log(`🔄 Aplicando elemento ${index + 1}/${totalElements}:`, elementId);
                }
                
                const edit = pageContent[elementId];
                
                // Si es un string simple (formato antiguo), convertir a formato nuevo
                let selector, value, type;
                if (typeof edit === 'string') {
                    // Formato antiguo: solo valor - no podemos aplicarlo sin selector
                    console.warn('Edición en formato antiguo encontrada (sin selector):', elementId);
                    return;
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
                                    if (edit.text !== undefined && edit.text !== null) {
                                        linkElement.textContent = edit.text;
                                    }
                                    if (edit.href !== undefined && edit.href !== null) {
                                        linkElement.href = edit.href;
                                    }
                                    appliedCount++;
                                }
                            } catch (e) {
                                console.warn('Error aplicando edición de enlace:', elementId, e);
                            }
                        }
                        return; // Ya se procesó el enlace
                    } else {
                        value = edit.value !== undefined ? edit.value : edit;
                    }
                }
                
                if (!selector || selector.trim() === '') {
                    console.warn('No hay selector para elemento:', elementId);
                    return;
                }
                
                try {
                    // Intentar encontrar el elemento por selector
                    const element = document.querySelector(selector);
                    
                    if (element) {
                        if (type === 'data-bg-image') {
                            // Para atributos data-bg-image, actualizar el atributo
                            if (value !== undefined && value !== null) {
                                element.setAttribute('data-bg-image', value);
                                appliedCount++;
                            }
                        } else if (type === 'inline-bg-image') {
                            // Para imágenes de fondo inline, actualizar el estilo
                            if (value !== undefined && value !== null && value.trim() !== '') {
                                // Obtener el estilo actual
                                const currentStyle = element.getAttribute('style') || '';
                                // Reemplazar o agregar background-image
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
                            if (value) {
                                element.src = value;
                                // Actualizar también srcset si existe
                                if (element.hasAttribute('srcset')) {
                                    element.removeAttribute('srcset');
                                }
                                appliedCount++;
                            }
                        } else if (type === 'text' || type === 'auto-text') {
                            // Para texto, actualizar el contenido
                            if (value !== undefined && value !== null) {
                                const oldText = element.textContent;
                                element.textContent = value;
                                appliedCount++;
                                if (index < 3) {
                                    console.log(`✅ Texto aplicado: "${oldText.substring(0, 30)}..." -> "${value.substring(0, 30)}..."`);
                                }
                            } else {
                                if (index < 3) {
                                    console.warn(`⚠️ Valor nulo o undefined para elemento:`, elementId);
                                }
                            }
                        } else if (type === 'list') {
                            // Para listas, dividir por líneas y crear items
                            if (element.tagName === 'UL' || element.tagName === 'OL') {
                                if (value) {
                                    const items = value.split('\n').filter(line => line.trim().length > 0);
                                    element.innerHTML = items.map(item => `<li>${escapeHtml(item.trim())}</li>`).join('');
                                    appliedCount++;
                                }
                            }
                        }
                    } else {
                        failedCount++;
                        console.warn(`❌ Elemento no encontrado con selector:`, {
                            elementId: elementId,
                            selector: selector,
                            pagePath: pagePath
                        });
                    }
                } catch (e) {
                    failedCount++;
                    console.error(`❌ Error aplicando edición:`, {
                        elementId: elementId,
                        selector: selector,
                        error: e.message,
                        stack: e.stack
                    });
                }
            });
            
            console.log(`📊 applyContent: Resultado final para ${pagePath}:`, {
                aplicados: appliedCount,
                fallidos: failedCount,
                total: totalElements
            });
            
            if (appliedCount > 0) {
                console.log(`✅ CMS: Aplicados ${appliedCount} cambios de contenido a ${pagePath}`);
            }
            
            if (failedCount > 0) {
                console.warn(`⚠️ CMS: ${failedCount} elementos no se pudieron aplicar en ${pagePath}`);
            }
        };
        
        // Aplicar cambios cuando el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', applyChanges);
        } else {
            // Si ya está cargado, aplicar inmediatamente
            // Pero esperar un poco para que los partials se carguen
            setTimeout(applyChanges, 100);
        }
        
        // También intentar aplicar después de que se carguen los partials (navbar, footer)
        setTimeout(applyChanges, 500);
        setTimeout(applyChanges, 1000);
    }
    
    // Inicializar aplicación de contenido
    applyContent();
})();

