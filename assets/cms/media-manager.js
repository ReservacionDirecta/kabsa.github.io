/**
 * Gestor de Medios (Imágenes y Videos)
 */

window.CMSMedia = (function() {
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
        
        if (filteredMedia.length === 0) {
            gallery.innerHTML = `
                <div class="col-span-full text-center py-8 text-gray-500">
                    <i class="fas fa-folder-open text-4xl mb-4"></i>
                    <p>No hay ${type === 'images' ? 'imágenes' : 'videos'} en la biblioteca</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        filteredMedia.forEach((media, index) => {
            html += createMediaCard(media, index);
        });
        
        gallery.innerHTML = html;
    }

    /**
     * Crea una tarjeta de medio
     */
    function createMediaCard(media, index) {
        const isImage = media.type === 'images';
        const preview = isImage 
            ? `<img src="${media.url}" alt="${media.name}" class="w-full h-full object-cover rounded">`
            : `<div class="w-full h-full flex items-center justify-center bg-gray-900 rounded">
                <i class="fas fa-play-circle text-white text-4xl"></i>
               </div>`;
        
        return `
            <div class="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow" data-media-index="${index}">
                <div class="aspect-square bg-gray-100 relative group">
                    ${preview}
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button onclick="window.CMSMedia.deleteMedia(${index})" class="bg-red-500 text-white px-3 py-1 rounded mr-2">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button onclick="window.CMSMedia.copyUrl('${media.url}')" class="bg-blue-500 text-white px-3 py-1 rounded">
                            <i class="fas fa-copy"></i> URL
                        </button>
                    </div>
                </div>
                <div class="p-2 bg-white">
                    <p class="text-xs text-gray-600 truncate" title="${media.name}">${media.name}</p>
                    <p class="text-xs text-gray-400">${formatFileSize(media.size)}</p>
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
        if (!confirm('¿Estás seguro de eliminar este archivo?')) return;
        
        const mediaLibrary = getMediaLibrary();
        const filtered = mediaLibrary.filter(item => item.type === currentMediaTab);
        const itemToDelete = filtered[index];
        
        if (itemToDelete) {
            const updated = mediaLibrary.filter(item => item.id !== itemToDelete.id);
            saveMediaLibrary(updated);
            loadMedia(currentMediaTab);
        }
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
     * Selecciona una imagen para usar en el editor
     */
    function selectImage(elementId) {
        const mediaLibrary = getMediaLibrary();
        const images = mediaLibrary.filter(item => item.type === 'images');
        
        if (images.length === 0) {
            alert('No hay imágenes en la biblioteca. Por favor sube una primero.');
            return;
        }
        
        // Crear modal de selección
        let optionsHTML = images.map(img => 
            `<option value="${img.url}">${img.name}</option>`
        ).join('');
        
        const selectedUrl = prompt('Selecciona una imagen:\n' + images.map((img, i) => `${i+1}. ${img.name}`).join('\n') + '\n\nO ingresa una URL manualmente:', '');
        
        if (selectedUrl) {
            const input = document.querySelector(`[data-editor="${elementId}"]`);
            if (input) {
                input.value = selectedUrl;
            }
        }
    }

    /**
     * Obtiene la biblioteca de medios
     */
    function getMediaLibrary() {
        const stored = localStorage.getItem(MEDIA_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    // Exponer función para uso externo
    window.CMSMedia.getMediaLibrary = getMediaLibrary;

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

    return {
        loadMedia,
        uploadMedia,
        deleteMedia,
        copyUrl,
        selectImage
    };
})();

// Auto-cargar imágenes al mostrar la sección
document.addEventListener('DOMContentLoaded', function() {
    if (window.CMSMedia) {
        window.CMSMedia.loadMedia('images');
    }
});

