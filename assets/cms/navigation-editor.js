/**
 * Editor de Navegación para CMS KABSA GROUP
 * Permite editar la estructura y contenido del navbar
 */

window.CMSNavigation = (function() {
    'use strict';

    let navigationData = {
        logo: {
            url: 'contexto/LOGO KABSA PNG.png',
            link: 'index.html#inicio',
            alt: 'KABSA GROUP'
        },
        menus: [],
        whatsapp: {
            text: 'WhatsApp',
            url: 'https://wa.me/51991690103'
        }
    };

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
     * Carga la estructura de navegación desde navbar.html
     */
    async function loadNavigation() {
        try {
            const response = await fetch('partials/navbar.html');
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Parsear logo
            const logoLink = doc.querySelector('a[href*="index"]');
            const logoImg = doc.querySelector('img[alt*="KABSA"]');
            if (logoImg) {
                navigationData.logo.url = logoImg.src || logoImg.getAttribute('src') || '';
                navigationData.logo.alt = logoImg.alt || 'KABSA GROUP';
            }
            if (logoLink) {
                navigationData.logo.link = logoLink.href || logoLink.getAttribute('href') || '';
            }

            // Parsear menús principales
            const desktopMenus = doc.querySelectorAll('[data-dropdown]');
            navigationData.menus = [];
            
            desktopMenus.forEach((menuContainer, index) => {
                const button = menuContainer.querySelector('[data-dropdown-toggle]');
                const panel = menuContainer.querySelector('[data-dropdown-panel]');
                
                if (button && panel) {
                    const menuName = button.textContent.trim();
                    const menuId = menuContainer.getAttribute('data-dropdown') || `menu-${index}`;
                    const items = [];
                    
                    // Parsear items del dropdown
                    const links = panel.querySelectorAll('a');
                    links.forEach(link => {
                        items.push({
                            text: link.textContent.trim(),
                            url: link.href || link.getAttribute('href') || '',
                            id: `item-${items.length}`
                        });
                    });
                    
                    navigationData.menus.push({
                        id: menuId,
                        name: menuName,
                        items: items,
                        isDropdown: true
                    });
                }
            });

            // Parsear menú simple "Inicio"
            const inicioLink = doc.querySelector('a[href*="inicio"]:not([data-dropdown])');
            if (inicioLink && !inicioLink.closest('[data-dropdown]')) {
                navigationData.menus.unshift({
                    id: 'inicio',
                    name: 'Inicio',
                    items: [],
                    isDropdown: false,
                    url: inicioLink.href || inicioLink.getAttribute('href') || ''
                });
            }

            // Parsear WhatsApp
            const whatsappLink = doc.querySelector('a[href*="wa.me"]');
            if (whatsappLink) {
                navigationData.whatsapp.url = whatsappLink.href || whatsappLink.getAttribute('href') || '';
                navigationData.whatsapp.text = whatsappLink.textContent.trim() || 'WhatsApp';
            }

            // Cargar desde localStorage si existe
            const saved = localStorage.getItem('cms_navigation_data');
            if (saved) {
                try {
                    const savedData = JSON.parse(saved);
                    // Preservar estructura pero usar datos guardados
                    navigationData = {
                        logo: savedData.logo || navigationData.logo,
                        menus: savedData.menus && savedData.menus.length > 0 ? savedData.menus : navigationData.menus,
                        whatsapp: savedData.whatsapp || navigationData.whatsapp
                    };
                } catch (e) {
                    console.warn('Error al cargar navegación guardada:', e);
                }
            }

            return navigationData;
        } catch (error) {
            console.error('Error al cargar navegación:', error);
            // Si hay error, intentar cargar desde localStorage
            const saved = localStorage.getItem('cms_navigation_data');
            if (saved) {
                try {
                    navigationData = JSON.parse(saved);
                } catch (e) {
                    console.warn('Error al cargar desde localStorage:', e);
                }
            }
            return navigationData;
        }
    }

    /**
     * Crea el editor de navegación
     */
    async function createEditor() {
        try {
            await loadNavigation();
        } catch (error) {
            console.warn('Error al cargar navegación, usando datos por defecto:', error);
            // Continuar con los datos que tenemos
        }

        // Si no hay menús cargados, crear estructura básica
        if (!navigationData.menus || navigationData.menus.length === 0) {
            navigationData.menus = [
                {
                    id: 'inicio',
                    name: 'Inicio',
                    items: [],
                    isDropdown: false,
                    url: 'index.html#inicio'
                }
            ];
        }

        let html = `
            <div class="space-y-6">
                <!-- Logo -->
                <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">📷 Logo</h3>
                    <div class="space-y-4">
                        <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">URL de la Imagen</label>
                                <input type="text" id="nav-logo-url" class="w-full px-3 py-2 border rounded-lg" value="${escapeHtml(navigationData.logo.url || '')}" placeholder="ruta/al/logo.png">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Enlace del Logo</label>
                            <input type="text" id="nav-logo-link" class="w-full px-3 py-2 border rounded-lg" value="${escapeHtml(navigationData.logo.link || '')}" placeholder="index.html#inicio">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Texto Alternativo</label>
                            <input type="text" id="nav-logo-alt" class="w-full px-3 py-2 border rounded-lg" value="${escapeHtml(navigationData.logo.alt || '')}" placeholder="KABSA GROUP">
                        </div>
                    </div>
                </div>

                <!-- Menús -->
                <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-gray-800">📋 Menús de Navegación</h3>
                        <button onclick="CMSNavigation.addMenu()" class="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors">
                            <i class="fas fa-plus mr-1"></i> Agregar Menú
                        </button>
                    </div>
                    <div id="menus-list" class="space-y-4">
        `;

        navigationData.menus.forEach((menu, index) => {
            html += createMenuEditor(menu, index);
        });

        html += `
                    </div>
                </div>

                <!-- WhatsApp -->
                <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">💬 Botón WhatsApp</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Texto del Botón</label>
                            <input type="text" id="nav-whatsapp-text" class="w-full px-3 py-2 border rounded-lg" value="${escapeHtml(navigationData.whatsapp.text || '')}" placeholder="WhatsApp">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">URL de WhatsApp</label>
                            <input type="text" id="nav-whatsapp-url" class="w-full px-3 py-2 border rounded-lg" value="${escapeHtml(navigationData.whatsapp.url || '')}" placeholder="https://wa.me/51991690103">
                        </div>
                    </div>
                </div>

                <!-- Botones de Acción -->
                <div class="flex gap-4 justify-end pt-4 border-t border-gray-200">
                    <button onclick="CMSNavigation.previewNavigation()" class="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                        <i class="fas fa-eye mr-2"></i> Vista Previa
                    </button>
                    <button onclick="CMSNavigation.saveNavigation()" class="bg-[#040872] text-white px-6 py-2 rounded-lg hover:bg-[#030561] transition-colors">
                        <i class="fas fa-save mr-2"></i> Guardar Cambios
                    </button>
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Crea el editor para un menú individual
     */
    function createMenuEditor(menu, index) {
        let html = `
            <div class="bg-white p-4 rounded-lg border-2 border-gray-300" data-menu-index="${index}">
                <div class="flex justify-between items-start mb-3">
                    <h4 class="font-semibold text-gray-800">${menu.isDropdown ? '📂 ' : '🔗 '}${escapeHtml(menu.name || 'Menú sin nombre')}</h4>
                    <div class="flex gap-2">
                        <button onclick="CMSNavigation.moveMenu(${index}, 'up')" class="text-gray-600 hover:text-gray-800" title="Mover arriba">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button onclick="CMSNavigation.moveMenu(${index}, 'down')" class="text-gray-600 hover:text-gray-800" title="Mover abajo">
                            <i class="fas fa-arrow-down"></i>
                        </button>
                        <button onclick="CMSNavigation.deleteMenu(${index})" class="text-red-600 hover:text-red-800" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>

                <div class="space-y-3">
                    <div class="flex items-center gap-4">
                        <label class="text-sm font-semibold text-gray-700 w-24">Tipo:</label>
                        <select id="menu-type-${index}" class="px-3 py-2 border rounded-lg text-sm" onchange="CMSNavigation.updateMenuType(${index}, this.value)">
                            <option value="simple" ${!menu.isDropdown ? 'selected' : ''}>Enlace Simple</option>
                            <option value="dropdown" ${menu.isDropdown ? 'selected' : ''}>Dropdown</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre del Menú</label>
                        <input type="text" id="menu-name-${index}" class="w-full px-3 py-2 border rounded-lg" value="${escapeHtml(menu.name || '')}" placeholder="Nombre del menú" onchange="CMSNavigation.updateMenuName(${index}, this.value)">
                    </div>

                    ${menu.isDropdown ? `
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Items del Dropdown</label>
                            <div id="menu-items-${index}" class="space-y-2">
                    ` : `
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">URL</label>
                            <input type="text" id="menu-url-${index}" class="w-full px-3 py-2 border rounded-lg" value="${escapeHtml(menu.url || '')}" placeholder="pagina.html">
                        </div>
                    `}

                    ${menu.isDropdown ? menu.items.map((item, itemIndex) => `
                        <div class="flex gap-2 items-center bg-gray-50 p-2 rounded">
                            <input type="text" class="flex-1 px-2 py-1 border rounded text-sm" value="${escapeHtml(item.text || '')}" placeholder="Texto" onchange="CMSNavigation.updateMenuItem(${index}, ${itemIndex}, 'text', this.value)">
                            <input type="text" class="flex-1 px-2 py-1 border rounded text-sm" value="${escapeHtml(item.url || '')}" placeholder="URL" onchange="CMSNavigation.updateMenuItem(${index}, ${itemIndex}, 'url', this.value)">
                            <button onclick="CMSNavigation.deleteMenuItem(${index}, ${itemIndex})" class="text-red-600 hover:text-red-800 px-2" title="Eliminar">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('') : ''}

                    ${menu.isDropdown ? `
                            </div>
                            <button onclick="CMSNavigation.addMenuItem(${index})" class="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                                <i class="fas fa-plus mr-1"></i> Agregar Item
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Actualiza el nombre de un menú
     */
    function updateMenuName(index, name) {
        if (navigationData.menus[index]) {
            navigationData.menus[index].name = name;
            saveToLocalStorage();
        }
    }

    /**
     * Actualiza el tipo de un menú
     */
    function updateMenuType(index, type) {
        if (navigationData.menus[index]) {
            const menu = navigationData.menus[index];
            menu.isDropdown = type === 'dropdown';
            if (!menu.isDropdown) {
                menu.url = menu.items[0]?.url || '';
                menu.items = [];
            } else if (!menu.items || menu.items.length === 0) {
                menu.items = [{ id: 'item-0', text: '', url: '' }];
            }
            renderEditor();
        }
    }

    /**
     * Agrega un nuevo menú
     */
    function addMenu() {
        navigationData.menus.push({
            id: `menu-${Date.now()}`,
            name: 'Nuevo Menú',
            items: [],
            isDropdown: false,
            url: ''
        });
        renderEditor();
    }

    /**
     * Elimina un menú
     */
    function deleteMenu(index) {
        if (confirm('¿Estás seguro de eliminar este menú?')) {
            navigationData.menus.splice(index, 1);
            renderEditor();
        }
    }

    /**
     * Mueve un menú arriba o abajo
     */
    function moveMenu(index, direction) {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < navigationData.menus.length) {
            [navigationData.menus[index], navigationData.menus[newIndex]] = [navigationData.menus[newIndex], navigationData.menus[index]];
            renderEditor();
        }
    }

    /**
     * Agrega un item a un menú dropdown
     */
    function addMenuItem(menuIndex) {
        if (navigationData.menus[menuIndex] && navigationData.menus[menuIndex].isDropdown) {
            if (!navigationData.menus[menuIndex].items) {
                navigationData.menus[menuIndex].items = [];
            }
            navigationData.menus[menuIndex].items.push({
                id: `item-${Date.now()}`,
                text: '',
                url: ''
            });
            renderEditor();
        }
    }

    /**
     * Actualiza un item de menú
     */
    function updateMenuItem(menuIndex, itemIndex, field, value) {
        if (navigationData.menus[menuIndex] && navigationData.menus[menuIndex].items[itemIndex]) {
            navigationData.menus[menuIndex].items[itemIndex][field] = value;
            saveToLocalStorage();
        }
    }

    /**
     * Elimina un item de menú
     */
    function deleteMenuItem(menuIndex, itemIndex) {
        if (navigationData.menus[menuIndex] && navigationData.menus[menuIndex].items[itemIndex]) {
            navigationData.menus[menuIndex].items.splice(itemIndex, 1);
            renderEditor();
        }
    }

    /**
     * Guarda la navegación
     */
    async function saveNavigation() {
        // Obtener valores del formulario
        navigationData.logo.url = document.getElementById('nav-logo-url')?.value || '';
        navigationData.logo.link = document.getElementById('nav-logo-link')?.value || '';
        navigationData.logo.alt = document.getElementById('nav-logo-alt')?.value || '';
        navigationData.whatsapp.text = document.getElementById('nav-whatsapp-text')?.value || '';
        navigationData.whatsapp.url = document.getElementById('nav-whatsapp-url')?.value || '';

        // Guardar en localStorage
        saveToLocalStorage();

        // Aquí se debería guardar en el servidor o generar el HTML
        // Por ahora solo guardamos en localStorage
        alert('¡Navegación guardada exitosamente!\n\nNota: Los cambios se aplicarán después de regenerar navbar.html');
    }

    /**
     * Guarda en localStorage
     */
    function saveToLocalStorage() {
        localStorage.setItem('cms_navigation_data', JSON.stringify(navigationData));
    }

    /**
     * Renderiza el editor
     */
    async function renderEditor() {
        const container = document.getElementById('navigationEditor');
        if (container) {
            container.innerHTML = '<div class="text-center py-4"><i class="fas fa-spinner fa-spin text-2xl text-[#040872]"></i></div>';
            try {
                const html = await createEditor();
                container.innerHTML = html;
            } catch (error) {
                console.error('Error al renderizar editor de navegación:', error);
                container.innerHTML = `
                    <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <p class="text-red-700">Error al cargar el editor: ${error.message}</p>
                        <button onclick="CMSNavigation.renderEditor()" class="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                            Reintentar
                        </button>
                    </div>
                `;
            }
        }
    }

    /**
     * Vista previa de la navegación
     */
    function previewNavigation() {
        // Abrir una ventana nueva con vista previa
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Vista Previa - Navegación</title>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-gray-100 p-8">
                <div class="bg-white p-6 rounded-lg shadow">
                    <h2 class="text-2xl font-bold mb-4">Vista Previa de la Navegación</h2>
                    <p class="text-gray-600 mb-4">Aquí se mostraría el navbar actualizado.</p>
                    <pre class="bg-gray-50 p-4 rounded overflow-auto">${JSON.stringify(navigationData, null, 2)}</pre>
                </div>
            </body>
            </html>
        `);
    }

    return {
        loadNavigation,
        createEditor,
        addMenu,
        deleteMenu,
        moveMenu,
        updateMenuName,
        updateMenuType,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        saveNavigation,
        previewNavigation,
        renderEditor
    };
})();

