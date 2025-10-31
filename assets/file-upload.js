// Configuración de límites de carga de archivos
const FILE_LIMITS = {
    maxFiles: 5,
    maxSizeMB: 15,
    maxSizeBytes: 15 * 1024 * 1024 // 15MB en bytes
};

// Función para validar archivos
function validateFiles(input, allowedTypes = []) {
    const files = input.files;
    const errors = [];
    
    // Validar número de archivos
    if (files.length > FILE_LIMITS.maxFiles) {
        errors.push(`Máximo ${FILE_LIMITS.maxFiles} archivos permitidos. Has seleccionado ${files.length}.`);
        return errors;
    }
    
    // Validar cada archivo
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validar tamaño
        if (file.size > FILE_LIMITS.maxSizeBytes) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            errors.push(`El archivo "${file.name}" (${sizeMB}MB) excede el tamaño máximo de ${FILE_LIMITS.maxSizeMB}MB.`);
        }
        
        // Validar tipo (si se especifica)
        if (allowedTypes.length > 0) {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (!allowedTypes.includes(fileExtension)) {
                errors.push(`El archivo "${file.name}" no tiene un formato válido. Formatos permitidos: ${allowedTypes.join(', ')}.`);
            }
        }
    }
    
    return errors;
}

// Función para mostrar errores de validación
function showFileErrors(errors, errorContainerId) {
    const errorContainer = document.getElementById(errorContainerId);
    if (!errorContainer) return;
    
    if (errors.length > 0) {
        errorContainer.innerHTML = errors.map(err => 
            `<div class="flex items-start mb-2">
                <svg class="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                </svg>
                <span>${err}</span>
            </div>`
        ).join('');
        errorContainer.classList.remove('hidden');
        return false;
    } else {
        errorContainer.classList.add('hidden');
        errorContainer.innerHTML = '';
        return true;
    }
}

// Función para mostrar lista de archivos seleccionados
function displaySelectedFiles(input, fileListId) {
    const fileList = document.getElementById(fileListId);
    if (!fileList) return;
    
    const files = input.files;
    
    if (files.length === 0) {
        fileList.classList.add('hidden');
        return;
    }
    
    let html = '<div class="mt-3 space-y-2">';
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        html += `
            <div class="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                <div class="flex items-center">
                    <svg class="w-5 h-5 text-gray-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-sm text-gray-700">${file.name}</span>
                </div>
                <span class="text-xs text-gray-500">${sizeMB} MB</span>
            </div>
        `;
    }
    html += '</div>';
    
    fileList.innerHTML = html;
    fileList.classList.remove('hidden');
}

// Configurar validación para formulario de proveedores
function setupProveedorFileUpload() {
    const fileInput = document.getElementById('proveedor-files');
    const errorContainer = document.getElementById('proveedor-file-error');
    const fileList = document.getElementById('proveedor-file-list');
    
    if (!fileInput) return;
    
    fileInput.addEventListener('change', function() {
        const errors = validateFiles(this, ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']);
        const isValid = showFileErrors(errors, 'proveedor-file-error');
        
        if (isValid) {
            displaySelectedFiles(this, 'proveedor-file-list');
        } else {
            this.value = ''; // Limpiar selección si hay errores
            fileList.classList.add('hidden');
        }
    });
}

// Configurar validación para formulario de empleo
function setupEmpleoFileUpload() {
    const fileInput = document.getElementById('empleo-cv');
    const errorContainer = document.getElementById('empleo-file-error');
    const fileList = document.getElementById('empleo-file-list');
    
    if (!fileInput) return;
    
    fileInput.addEventListener('change', function() {
        const errors = validateFiles(this, ['pdf']);
        const isValid = showFileErrors(errors, 'empleo-file-error');
        
        if (isValid) {
            displaySelectedFiles(this, 'empleo-file-list');
        } else {
            this.value = ''; // Limpiar selección si hay errores
            fileList.classList.add('hidden');
        }
    });
}

// Configurar validación para formulario de reclamaciones
function setupReclamacionesFileUpload() {
    const fileInput = document.getElementById('reclamaciones-files');
    const errorContainer = document.getElementById('reclamaciones-file-error');
    const fileList = document.getElementById('reclamaciones-file-list');
    
    if (!fileInput) return;
    
    fileInput.addEventListener('change', function() {
        const errors = validateFiles(this, ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']);
        const isValid = showFileErrors(errors, 'reclamaciones-file-error');
        
        if (isValid) {
            displaySelectedFiles(this, 'reclamaciones-file-list');
        } else {
            this.value = ''; // Limpiar selección si hay errores
            fileList.classList.add('hidden');
        }
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    setupProveedorFileUpload();
    setupEmpleoFileUpload();
    setupReclamacionesFileUpload();
});

// Agregar información de organización de carpetas en el backend
// Los archivos se organizarán en:
// /uploads/proveedores/{RUC}_{timestamp}/
// /uploads/empleos/{DNI}_{timestamp}/
// /uploads/reclamaciones/{documento}_{timestamp}/

