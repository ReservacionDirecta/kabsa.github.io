/**
 * Lógica principal del Panel de Administración
 */

// Declarar funciones globalmente desde el inicio
window.showSection = function(sectionName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(`section-${sectionName}`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // Actualizar navegación activa
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('bg-[#040872]', 'text-white');
        item.classList.add('text-gray-700');
    });
    
    const clickedItem = event?.target?.closest('.nav-item');
    if (clickedItem) {
        clickedItem.classList.add('bg-[#040872]', 'text-white');
        clickedItem.classList.remove('text-gray-700');
    }
    
    // Cerrar menú móvil si está abierto
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.remove('open');
    }
    
    // Cargar editores específicos cuando se muestren sus secciones
    if (sectionName === 'navigation' && window.CMSNavigation) {
        const editorContainer = document.getElementById('navigationEditor');
        if (editorContainer && editorContainer.innerHTML.includes('Cargando')) {
            window.CMSNavigation.renderEditor();
        }
    }
    
    if (sectionName === 'news' && window.CMSNews) {
        const editorContainer = document.getElementById('newsEditor');
        if (editorContainer && editorContainer.innerHTML.includes('Cargando')) {
            window.CMSNews.renderEditor();
        }
    }
};

// También exportar como función normal para compatibilidad
var showSection = window.showSection;

// Editar una página específica
window.editPage = function(pagePath) {
    window.showSection('pages');
    const selector = document.getElementById('pageSelector');
    if (selector) {
        selector.value = pagePath;
    }
    window.loadPageEditor(pagePath);
}

// Cargar editor de página
window.loadPageEditor = async function(pagePath) {
    const container = document.getElementById('pageEditorContainer');
    container.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-[#040872] mb-4"></i><p>Cargando editor...</p></div>';
    
    try {
        // Cargar el contenido de la página
        const response = await fetch(pagePath);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const html = await response.text();
        
        // Verificar que CMSEditor esté disponible
        if (!window.CMSEditor || !window.CMSEditor.createEditor) {
            throw new Error('CMSEditor no está disponible. Recarga la página.');
        }
        
        // Crear el editor
        const editorHTML = await window.CMSEditor.createEditor(html, pagePath);
        
        container.innerHTML = `
            <div class="mb-4 flex justify-between items-center">
                <h3 class="text-xl font-semibold">Editando: ${pagePath}</h3>
                <div class="flex gap-2">
                    <button onclick="window.previewPage('${pagePath}')" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                        <i class="fas fa-eye mr-2"></i>
                        Vista Previa
                    </button>
                    <button onclick="window.savePage('${pagePath}')" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                        <i class="fas fa-save mr-2"></i>
                        Guardar Cambios
                    </button>
                </div>
            </div>
            <div id="pageEditor" class="border rounded-lg p-4 bg-gray-50" style="max-height: 80vh; overflow-y: auto;">
                ${editorHTML}
            </div>
        `;
        
        console.log('Editor cargado exitosamente para:', pagePath);
        
    } catch (error) {
        console.error('Error al cargar editor:', error);
        container.innerHTML = `
            <div class="bg-red-50 border-l-4 border-red-500 p-4">
                <p class="text-red-700 font-semibold">Error al cargar la página</p>
                <p class="text-red-600 text-sm mt-2">${error.message}</p>
                <button onclick="loadPageEditor('${pagePath}')" class="mt-3 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                    Reintentar
                </button>
            </div>
        `;
    }
}

// Vista previa de página
window.previewPage = function(pagePath) {
    window.open(pagePath, '_blank');
}

// Guardar cambios de página
window.savePage = async function(pagePath) {
    console.log('Iniciando guardado de página:', pagePath);
    
    const editor = document.getElementById('pageEditor');
    if (!editor) {
        console.error('Editor no encontrado');
        alert('Error: Editor no encontrado. Asegúrate de haber seleccionado una página.');
        return;
    }
    
    // Verificar que CMSEditor esté disponible
    if (!window.CMSEditor || !window.CMSEditor.getContent) {
        console.error('CMSEditor.getContent no está disponible');
        alert('Error: El editor no está inicializado correctamente. Recarga la página.');
        return;
    }
    
    // Verificar que CMSAPI esté disponible
    if (!window.CMSAPI || !window.CMSAPI.savePageContent) {
        console.error('CMSAPI.savePageContent no está disponible');
        alert('Error: El sistema de guardado no está disponible. Recarga la página.');
        return;
    }
    
    try {
        console.log('═══════════════════════════════════════');
        console.log('💾 INICIANDO GUARDADO DE CONTENIDO');
        console.log('📄 Página:', pagePath);
        console.log('═══════════════════════════════════════');
        
        console.log('📝 Paso 1: Obteniendo contenido del editor...');
        const updatedContent = await window.CMSEditor.getContent(editor);
        console.log('✅ Contenido obtenido. Elementos:', Object.keys(updatedContent).length);
        
        // Mostrar preview del contenido (solo primeros elementos)
        const previewKeys = Object.keys(updatedContent).slice(0, 5);
        previewKeys.forEach(key => {
            const item = updatedContent[key];
            console.log(`  • ${key}:`, {
                type: item.type,
                hasSelector: !!item.selector,
                valuePreview: typeof item.value === 'string' ? item.value.substring(0, 40) + '...' : item.value
            });
        });
        
        // Verificar que hay cambios para guardar
        const changeCount = Object.keys(updatedContent).length;
        if (changeCount === 0) {
            alert('No hay cambios para guardar. Edita algunos campos primero.');
            return;
        }
        
        console.log(`💾 Paso 2: Guardando ${changeCount} elemento(s)...`);
        const result = await window.CMSAPI.savePageContent(pagePath, updatedContent);
        console.log('✅ Guardado completado:', result);
        
        // Verificar en localStorage que se guardó
        const stored = localStorage.getItem('cms_content_data');
        if (stored) {
            const data = JSON.parse(stored);
            const pageData = data[pagePath] || {};
            const savedElements = Object.keys(pageData).filter(k => k !== 'lastModified').length;
            console.log(`✅ Verificación: ${savedElements} elemento(s) guardado(s) en localStorage para ${pagePath}`);
        }
        
        console.log('═══════════════════════════════════════');
        console.log('✅ GUARDADO COMPLETADO EXITOSAMENTE');
        console.log('═══════════════════════════════════════');
        
        let message = `¡Cambios guardados exitosamente!\n\n` +
                       `✅ Se guardaron ${result.savedElements || changeCount} elemento(s) editado(s).\n\n`;
        
        // Si hubo imágenes removidas, informar al usuario
        if (result.removedImages && result.removedImages > 0) {
            message += `⚠️ NOTA: ${result.removedImages} imagen(es) base64 grande(s) no se guardaron.\n` +
                      `Usa URLs de imágenes externas (como Unsplash) en lugar de imágenes base64.\n\n`;
        }
        
        message += `Los cambios se aplicarán automáticamente al visitar:\n${pagePath}\n\n` +
                  `Recarga la página para ver los cambios aplicados.`;
        
        alert(message);
        
    } catch (error) {
        console.error('═══════════════════════════════════════');
        console.error('❌ ERROR AL GUARDAR');
        console.error('═══════════════════════════════════════');
        console.error('Mensaje:', error.message);
        console.error('Stack:', error.stack);
        console.error('Error completo:', error);
        alert('❌ Error al guardar: ' + error.message + '\n\nRevisa la consola para más detalles.');
    }
}

// Manejo de selector de páginas
document.addEventListener('DOMContentLoaded', function() {
    const selector = document.getElementById('pageSelector');
    if (selector) {
        selector.addEventListener('change', function(e) {
            if (e.target.value) {
                console.log('Página seleccionada:', e.target.value);
                window.loadPageEditor(e.target.value);
            } else {
                // Si no hay selección, limpiar el editor
                const container = document.getElementById('pageEditorContainer');
                if (container) {
                    container.innerHTML = '<p class="text-gray-500 text-center py-8">Selecciona una página para comenzar a editar</p>';
                }
            }
        });
    }
});

// Tabs de medios - función base
function showMediaTabBase(tab, eventTarget) {
    document.querySelectorAll('.media-tab').forEach(t => {
        t.classList.remove('active', 'border-b-2', 'border-[#040872]', 'text-[#040872]');
        t.classList.add('text-gray-600');
    });
    
    if (eventTarget) {
        eventTarget.classList.add('active', 'border-b-2', 'border-[#040872]', 'text-[#040872]');
        eventTarget.classList.remove('text-gray-600');
    }
    
    // Cargar contenido del tab
    if (window.CMSMedia && window.CMSMedia.loadMedia) {
        window.CMSMedia.loadMedia(tab);
    } else {
        console.warn('CMSMedia no disponible aún');
        // Intentar de nuevo después de un delay
        setTimeout(() => {
            if (window.CMSMedia && window.CMSMedia.loadMedia) {
                window.CMSMedia.loadMedia(tab);
            }
        }, 200);
    }
}

// Hacer función global - con verificación de módulo
window.showMediaTab = function(tab) {
    const eventTarget = event ? event.target : null;
    // Intentar esperar si el módulo no está disponible
    function tryShowMediaTab() {
        if (window.CMSMedia && window.CMSMedia.loadMedia) {
            showMediaTabBase(tab, eventTarget);
        } else {
            console.warn('CMSMedia no disponible, esperando...');
            setTimeout(tryShowMediaTab, 100);
        }
    }
    tryShowMediaTab();
};

window.uploadMedia = function() {
    // Intentar esperar si el módulo no está disponible
    function tryUploadMedia() {
        if (window.CMSMedia && window.CMSMedia.uploadMedia) {
            window.CMSMedia.uploadMedia();
        } else {
            console.warn('CMSMedia no disponible, esperando...');
            setTimeout(tryUploadMedia, 100);
        }
    }
    tryUploadMedia();
};

// Funciones de configuración
function changeCredentials() {
    const newUsername = prompt('Nuevo usuario:');
    const newPassword = prompt('Nueva contraseña:');
    if (newUsername && newPassword) {
        // En producción, esto debería actualizar en el backend
        alert('Credenciales actualizadas (Nota: En producción, esto se guarda en el servidor)');
    }
}

function exportContent() {
    window.CMSAPI.exportContent().then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kabsa-cms-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });
}

        function importContent() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    const text = await file.text();
                    try {
                        const data = JSON.parse(text);
                        await window.CMSAPI.importContent(data);
                        alert('Contenido importado exitosamente');
                        location.reload();
                    } catch (error) {
                        alert('Error al importar: ' + error.message);
                    }
                }
            };
            input.click();
        }
        
        // Las funciones ya están disponibles globalmente

