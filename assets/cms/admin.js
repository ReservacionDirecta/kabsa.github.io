/**
 * Lógica principal del Panel de Administración
 */

// Manejo de secciones
function showSection(sectionName) {
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
}

// Editar una página específica
function editPage(pagePath) {
    showSection('pages');
    document.getElementById('pageSelector').value = pagePath;
    loadPageEditor(pagePath);
}

// Cargar editor de página
async function loadPageEditor(pagePath) {
    const container = document.getElementById('pageEditorContainer');
    container.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-[#040872] mb-4"></i><p>Cargando editor...</p></div>';
    
    try {
        // Cargar el contenido de la página
        const response = await fetch(pagePath);
        const html = await response.text();
        
        // Crear el editor
        container.innerHTML = `
            <div class="mb-4 flex justify-between items-center">
                <h3 class="text-xl font-semibold">Editando: ${pagePath}</h3>
                <div class="flex gap-2">
                    <button onclick="previewPage('${pagePath}')" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                        <i class="fas fa-eye mr-2"></i>
                        Vista Previa
                    </button>
                    <button onclick="savePage('${pagePath}')" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                        <i class="fas fa-save mr-2"></i>
                        Guardar Cambios
                    </button>
                </div>
            </div>
            <div id="pageEditor" class="border rounded-lg p-4 bg-gray-50" style="max-height: 80vh; overflow-y: auto;">
                ${await window.CMSEditor.createEditor(html, pagePath)}
            </div>
        `;
        
    } catch (error) {
        container.innerHTML = `
            <div class="bg-red-50 border-l-4 border-red-500 p-4">
                <p class="text-red-700">Error al cargar la página: ${error.message}</p>
            </div>
        `;
    }
}

// Vista previa de página
function previewPage(pagePath) {
    window.open(pagePath, '_blank');
}

// Guardar cambios de página
async function savePage(pagePath) {
    const editor = document.getElementById('pageEditor');
    if (!editor) return;
    
    const updatedContent = await window.CMSEditor.getContent(editor);
    
    try {
        await window.CMSAPI.savePageContent(pagePath, updatedContent);
        alert('¡Cambios guardados exitosamente!');
    } catch (error) {
        alert('Error al guardar: ' + error.message);
    }
}

// Manejo de selector de páginas
document.addEventListener('DOMContentLoaded', function() {
    const selector = document.getElementById('pageSelector');
    if (selector) {
        selector.addEventListener('change', function(e) {
            if (e.target.value) {
                loadPageEditor(e.target.value);
            }
        });
    }
});

// Tabs de medios
function showMediaTab(tab) {
    document.querySelectorAll('.media-tab').forEach(t => {
        t.classList.remove('active', 'border-b-2', 'border-[#040872]', 'text-[#040872]');
        t.classList.add('text-gray-600');
    });
    
    event.target.classList.add('active', 'border-b-2', 'border-[#040872]', 'text-[#040872]');
    event.target.classList.remove('text-gray-600');
    
    // Cargar contenido del tab
    if (window.CMSMedia) {
        window.CMSMedia.loadMedia(tab);
    }
}

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

