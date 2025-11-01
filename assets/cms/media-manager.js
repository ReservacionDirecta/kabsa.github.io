/**
 * Gestor de Medios (Imágenes y Videos)
 */

// Inicializar inmediatamente y asegurar disponibilidad
(function() {
    'use strict';

    const MEDIA_STORAGE_KEY = 'cms_media_library';
    let currentMediaTab = 'images';

    /**
     * Carga la galería de medios
     */
    function loadMedia(type) {
        currentMediaTab = type;
        const gallery = document.getElementById('mediaGallery');
        if (!gallery) return;
        
        gallery.innerHTML = '<div class="col-span-full text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-[#040872] mb-4"></i><p>Cargando...</p></div>';
        
        const mediaLibrary = getMediaLibrary();
        const filteredMedia = mediaLibrary.filter(item => item.type === type);
        
        // Si es imágenes, también incluir las locales
        let allMedia = [...filteredMedia];
        if (type === 'images') {
            const localImages = getLocalImages();
            localImages.forEach(img => {
                // Verificar si ya está en la biblioteca
                const exists = allMedia.some(item => item.url === img.url);
                if (!exists) {
                    allMedia.push({
                        ...img,
                        id: img.url, // Usar URL como ID para imágenes locales
                        size: 0
                    });
                } else {
                    // Marcar como local si existe
                    const existing = allMedia.find(item => item.url === img.url);
                    if (existing) {
                        existing.isLocal = true;
                    }
                }
            });
        }
        
        if (allMedia.length === 0) {
            gallery.innerHTML = `
                <div class="col-span-full text-center py-8 text-gray-500">
                    <i class="fas fa-folder-open text-4xl mb-4"></i>
                    <p>No hay ${type === 'images' ? 'imágenes' : 'videos'} en la biblioteca</p>
                    ${type === 'images' ? '<p class="text-sm mt-2">Haz clic en "Importar de Assets" para cargar imágenes locales</p>' : ''}
                </div>
            `;
            return;
        }
        
        let html = '';
        allMedia.forEach((media, index) => {
            html += createMediaCard(media, index);
        });
        
        gallery.innerHTML = html;
    }

    /**
     * Crea una tarjeta de medio
     */
    function createMediaCard(media, index) {
        const isImage = media.type === 'images';
        const isLocal = media.isLocal || false;
        const preview = isImage 
            ? `<img src="${media.url}" alt="${media.name}" class="w-full h-full object-cover rounded" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%27 height=%27100%27%3E%3Crect fill=%27%23ddd%27 width=%27100%27 height=%27100%27/%3E%3Ctext x=%2750%27 y=%2750%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%23999%27%3EError%3C/text%3E%3C/svg%3E'">`
            : `<div class="w-full h-full flex items-center justify-center bg-gray-900 rounded">
                <i class="fas fa-play-circle text-white text-4xl"></i>
               </div>`;
        
        const sizeText = media.size > 0 ? formatFileSize(media.size) : (isLocal ? 'Local' : 'N/A');
        
        return `
            <div class="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow relative" data-media-index="${index}">
                ${isLocal ? `<div class="absolute top-1 right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded z-10">Local</div>` : ''}
                <div class="aspect-square bg-gray-100 relative group">
                    ${preview}
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                        ${!isLocal ? `<button onclick="window.CMSMedia.deleteMedia(${index})" class="bg-red-500 text-white px-3 py-1 rounded mr-2">
                            <i class="fas fa-trash"></i>
                        </button>` : ''}
                        <button onclick="window.CMSMedia.copyUrl('${media.url}')" class="bg-blue-500 text-white px-3 py-1 rounded">
                            <i class="fas fa-copy"></i> URL
                        </button>
                    </div>
                </div>
                <div class="p-2 bg-white">
                    <p class="text-xs text-gray-600 truncate" title="${media.name}">${media.name}</p>
                    <p class="text-xs text-gray-400">${sizeText}</p>
                </div>
            </div>
        `;
    }

    /**
     * Sube un nuevo archivo
     */
    function uploadMedia() {
        const input = document.getElementById('mediaUpload');
        const file = input.files[0];
        
        if (!file) {
            alert('Por favor selecciona un archivo');
            return;
        }
        
        const type = file.type.startsWith('image/') ? 'images' : 'videos';
        
        // En producción, esto debería subir al servidor
        // Por ahora, usamos FileReader para crear una URL local
        const reader = new FileReader();
        reader.onload = function(e) {
            const mediaItem = {
                id: Date.now(),
                name: file.name,
                type: type,
                url: e.target.result, // En producción, sería la URL del servidor
                size: file.size,
                uploadedAt: new Date().toISOString()
            };
            
            addToMediaLibrary(mediaItem);
            loadMedia(currentMediaTab);
            input.value = ''; // Limpiar input
            alert('Archivo agregado a la biblioteca');
        };
        
        reader.readAsDataURL(file);
    }

    /**
     * Elimina un medio de la biblioteca
     */
    function deleteMedia(index) {
        const mediaLibrary = getMediaLibrary();
        const filtered = mediaLibrary.filter(item => item.type === currentMediaTab);
        const itemToDelete = filtered[index];
        
        if (!itemToDelete) return;
        
        // No permitir eliminar imágenes locales
        if (itemToDelete.isLocal) {
            alert('No se pueden eliminar imágenes locales. Solo se pueden eliminar imágenes subidas.');
            return;
        }
        
        if (!confirm('¿Estás seguro de eliminar este archivo de la biblioteca?')) return;
        
        const updated = mediaLibrary.filter(item => item.id !== itemToDelete.id);
        saveMediaLibrary(updated);
        loadMedia(currentMediaTab);
    }

    /**
     * Copia la URL al portapapeles
     */
    function copyUrl(url) {
        navigator.clipboard.writeText(url).then(() => {
            alert('URL copiada al portapapeles');
        });
    }

    /**
     * Selecciona una imagen para usar en el editor (con modal visual)
     */
    function selectImage(elementId) {
        // Obtener todas las imágenes disponibles (locales + biblioteca)
        const images = getAllAvailableImages();
        
        // Crear modal visual para seleccionar imagen
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        modal.id = 'image-selector-modal';
        
        let imagesHTML = '';
        if (images.length > 0) {
            imagesHTML = images.map((img, index) => {
                const isLocal = img.isLocal || false;
                const sizeText = img.size > 0 ? formatFileSize(img.size) : (isLocal ? 'Local' : '');
                return `
                <div class="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative" onclick="window.CMSMedia.confirmImageSelection('${elementId}', '${img.url}')">
                    ${isLocal ? `<div class="absolute top-1 right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded z-10">Local</div>` : ''}
                    <div class="aspect-square bg-gray-100 relative">
                        <img src="${img.url}" alt="${img.name}" class="w-full h-full object-cover" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%27 height=%27100%27%3E%3Crect fill=%27%23ddd%27 width=%27100%27 height=%27100%27/%3E%3Ctext x=%2750%27 y=%2750%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%23999%27%3EError%3C/text%3E%3C/svg%3E'">
                    </div>
                    <div class="p-2 bg-white">
                        <p class="text-sm font-semibold text-gray-800 truncate" title="${img.name}">${img.name}</p>
                        <p class="text-xs text-gray-500">${sizeText}</p>
                    </div>
                </div>
            `;
            }).join('');
        } else {
            imagesHTML = `
                <div class="col-span-full text-center py-8 text-gray-500">
                    <i class="fas fa-folder-open text-4xl mb-4"></i>
                    <p>No hay imágenes en la biblioteca</p>
                    <p class="text-sm mt-2">Sube imágenes desde la sección "Medios" o importa desde Assets</p>
                </div>
            `;
        }
        
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div class="p-4 border-b flex justify-between items-center">
                    <h3 class="text-xl font-bold text-[#040872]">
                        <i class="fas fa-image mr-2"></i>
                        Seleccionar Imagen
                    </h3>
                    <button onclick="window.CMSMedia.closeImageModal()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                </div>
                
                <div class="p-4 overflow-y-auto flex-1">
                    <div class="mb-4">
                        <label class="block text-sm font-semibold mb-2">O ingresar URL manualmente:</label>
                        <div class="flex gap-2">
                            <input 
                                type="text" 
                                id="manual-image-url" 
                                class="flex-1 border rounded px-3 py-2" 
                                placeholder="https://ejemplo.com/imagen.jpg"
                            >
                            <button onclick="window.CMSMedia.useManualUrl('${elementId}')" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                Usar URL
                            </button>
                        </div>
                    </div>
                    
                    <div class="mb-2 text-sm text-gray-600">
                        ${images.length > 0 ? `Biblioteca de imágenes (${images.length}):` : ''}
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        ${imagesHTML}
                    </div>
                </div>
                
                <div class="p-4 border-t bg-gray-50">
                    <button onclick="window.CMSMedia.closeImageModal()" class="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                        Cancelar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Cerrar al hacer clic fuera del modal
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeImageModal();
            }
        });
        
        // Cerrar con ESC
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeImageModal();
                document.removeEventListener('keydown', escHandler);
            }
        });
    }
    
    /**
     * Confirma la selección de una imagen
     */
    function confirmImageSelection(elementId, imageUrl) {
        const input = document.querySelector(`[data-editor="${elementId}"]`);
        if (input) {
            input.value = imageUrl;
            // Disparar evento change para actualizar el preview
            input.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Actualizar preview si existe (buscando de forma más robusta)
            const preview = document.querySelector(`[data-preview="${elementId}"]`);
            if (preview) {
                // Si es un div con background-image
                if (preview.tagName === 'DIV') {
                    preview.style.backgroundImage = `url('${imageUrl}')`;
                } else {
                    // Si es una img
                    preview.src = imageUrl;
                }
            } else {
                // Buscar preview por ID
                const previewById = document.getElementById(`preview-${elementId}`);
                if (previewById) {
                    if (previewById.tagName === 'DIV') {
                        previewById.style.backgroundImage = `url('${imageUrl}')`;
                    } else {
                        previewById.src = imageUrl;
                    }
                } else {
                    // Buscar en el contenedor padre
                    const container = input.closest('.space-y-2, .flex');
                    if (container) {
                        const imgPreview = container.querySelector('img, [data-preview]');
                        if (imgPreview) {
                            if (imgPreview.tagName === 'DIV') {
                                imgPreview.style.backgroundImage = `url('${imageUrl}')`;
                            } else {
                                imgPreview.src = imageUrl;
                            }
                        }
                    }
                }
            }
        }
        closeImageModal();
    }
    
    /**
     * Usa una URL manual
     */
    function useManualUrl(elementId) {
        const urlInput = document.getElementById('manual-image-url');
        if (urlInput && urlInput.value.trim()) {
            confirmImageSelection(elementId, urlInput.value.trim());
        } else {
            alert('Por favor ingresa una URL válida');
        }
    }
    
    /**
     * Cierra el modal de selección de imágenes
     */
    function closeImageModal() {
        const modal = document.getElementById('image-selector-modal');
        if (modal) {
            modal.remove();
        }
    }

    /**
     * Obtiene la biblioteca de medios
     */
    function getMediaLibrary() {
        const stored = localStorage.getItem(MEDIA_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Guarda la biblioteca de medios
     */
    function saveMediaLibrary(library) {
        localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(library));
    }

    /**
     * Añade un item a la biblioteca
     */
    function addToMediaLibrary(item) {
        const library = getMediaLibrary();
        library.push(item);
        saveMediaLibrary(library);
    }

    /**
     * Formatea el tamaño del archivo
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    /**
     * Obtiene todas las imágenes locales disponibles
     */
    function getLocalImages() {
        return [
            { name: 'Logo Katsumoto', url: 'assets/logokatsumoto.png', isLocal: true },
            { name: 'Logo Brontes', url: 'contexto/logo brontes - 2025.png', isLocal: true },
            { name: 'Logo Argos', url: 'assets/logo argos.png', isLocal: true },
            { name: 'Fondo Empresa 1', url: 'assets/bg-empresa1.svg', isLocal: true },
            { name: 'Fondo Empresa 2', url: 'assets/bg-empresa2.svg', isLocal: true },
            { name: 'Fondo Empresa 3', url: 'assets/bg-empresa3.svg', isLocal: true },
            { name: 'Fondo 1 PNG', url: 'assets/bg1.png', isLocal: true },
            { name: 'Fondo 2 PNG', url: 'assets/bg2.png', isLocal: true }
        ];
    }

    /**
     * Importa imágenes locales desde la carpeta assets
     */
    function importLocalAssets() {
        const localImages = getLocalImages();
        const library = getMediaLibrary();
        let imported = 0;
        
        localImages.forEach(img => {
            // Verificar si ya existe en la biblioteca
            const exists = library.some(item => item.url === img.url);
            if (!exists) {
                library.push({
                    id: Date.now() + Math.random(),
                    name: img.name,
                    type: 'images',
                    url: img.url,
                    size: 0,
                    uploadedAt: new Date().toISOString(),
                    isLocal: true
                });
                imported++;
            }
        });
        
        if (imported > 0) {
            saveMediaLibrary(library);
            if (currentMediaTab === 'images') {
                loadMedia('images');
            }
            return imported;
        }
        
        return 0;
    }
    
    /**
     * Obtiene todas las imágenes disponibles (locales + biblioteca)
     */
    function getAllAvailableImages() {
        const library = getMediaLibrary();
        const localImages = getLocalImages();
        
        // Combinar y eliminar duplicados
        const allImages = [...localImages];
        library.forEach(item => {
            if (item.type === 'images' && !allImages.some(img => img.url === item.url)) {
                allImages.push(item);
            }
        });
        
        return allImages;
    }

    // Exponer el módulo globalmente
    const module = {
        loadMedia,
        uploadMedia,
        deleteMedia,
        copyUrl,
        selectImage,
        confirmImageSelection,
        useManualUrl,
        closeImageModal,
        importLocalAssets,
        getAllAvailableImages,
        getLocalImages,
        getMediaLibrary
    };
    
    // Asignar al objeto window INMEDIATAMENTE
    window.CMSMedia = module;
    
    // Log para debugging
    console.log('✅ CMSMedia módulo inicializado correctamente', module);
})();

// Auto-cargar imágenes al mostrar la sección
document.addEventListener('DOMContentLoaded', function() {
    if (window.CMSMedia) {
        // Importar imágenes locales automáticamente
        window.CMSMedia.importLocalAssets();
        window.CMSMedia.loadMedia('images');
    }
});

