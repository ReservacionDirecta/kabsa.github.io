/**
 * Gestor de Noticias para CMS KABSA GROUP
 * Permite crear, editar y eliminar noticias
 */

window.CMSNews = (function() {
    'use strict';

    const STORAGE_KEY = 'cms_news_data';
    let newsData = [];

    /**
     * Carga las noticias desde localStorage y desde noticias.html si existen
     */
    async function loadNews() {
        // Primero intentar cargar desde localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                newsData = JSON.parse(saved);
                // Ordenar por fecha (más recientes primero)
                newsData.sort((a, b) => new Date(b.date) - new Date(a.date));
                return newsData;
            } catch (e) {
                console.error('Error al cargar noticias:', e);
                newsData = [];
            }
        }
        
        // Si no hay noticias guardadas, intentar parsear desde noticias.html
        if (newsData.length === 0) {
            try {
                const response = await fetch('noticias.html');
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                const articles = doc.querySelectorAll('#news-container article, article');
                articles.forEach((article, index) => {
                    const img = article.querySelector('img');
                    const title = article.querySelector('h3');
                    const dateText = article.querySelector('.text-sm.text-gray-600, .text-sm');
                    const description = article.querySelector('p.text-gray-700, article p:not(.text-sm)');
                    
                    if (title && description) {
                        // Parsear fecha
                        let date = new Date().toISOString().split('T')[0];
                        if (dateText) {
                            const dateMatch = dateText.textContent.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
                            if (dateMatch) {
                                const months = {
                                    'Ene': '01', 'Feb': '02', 'Mar': '03', 'Abr': '04',
                                    'May': '05', 'Jun': '06', 'Jul': '07', 'Ago': '08',
                                    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dic': '12'
                                };
                                const day = dateMatch[1].padStart(2, '0');
                                const month = months[dateMatch[2]] || '01';
                                const year = dateMatch[3];
                                date = `${year}-${month}-${day}`;
                            }
                        }
                        
                        newsData.push({
                            id: `news-${Date.now()}-${index}`,
                            title: title.textContent.trim(),
                            date: date,
                            image: img ? (img.src || img.getAttribute('src') || '') : '',
                            description: description.textContent.trim(),
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        });
                    }
                });
                
                // Guardar las noticias parseadas
                if (newsData.length > 0) {
                    saveNews();
                }
            } catch (error) {
                console.warn('No se pudieron cargar noticias desde noticias.html:', error);
            }
        }
        
        // Ordenar por fecha (más recientes primero)
        newsData.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return newsData;
    }

    /**
     * Guarda las noticias en localStorage
     */
    function saveNews() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newsData));
    }

    /**
     * Crea el editor de noticias
     */
    async function createEditor() {
        await loadNews();

        let html = `
            <div class="space-y-6">
                <!-- Botón para agregar nueva noticia -->
                <div class="flex justify-between items-center">
                    <h3 class="text-xl font-semibold text-gray-800">📰 Gestión de Noticias</h3>
                    <button onclick="CMSNews.showNewsForm()" class="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
                        <i class="fas fa-plus mr-2"></i> Nueva Noticia
                    </button>
                </div>

                <!-- Lista de noticias -->
                <div id="news-list" class="grid grid-cols-1 gap-4">
        `;

        if (newsData.length === 0) {
            html += `
                <div class="bg-gray-50 p-8 rounded-lg text-center border-2 border-dashed border-gray-300">
                    <i class="fas fa-newspaper text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600">No hay noticias aún. Crea la primera noticia.</p>
                </div>
            `;
        } else {
            newsData.forEach((news, index) => {
                html += createNewsCard(news, index);
            });
        }

        html += `
                </div>
            </div>

            <!-- Modal para crear/editar noticia -->
            <div id="news-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-2xl font-bold text-gray-800" id="news-modal-title">Nueva Noticia</h3>
                            <button onclick="CMSNews.closeNewsForm()" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        </div>

                        <form id="news-form" class="space-y-4">
                            <input type="hidden" id="news-id" value="">
                            
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Título *</label>
                                <input type="text" id="news-title" required class="w-full px-3 py-2 border rounded-lg focus:border-[#040872] focus:outline-none" placeholder="Título de la noticia">
                            </div>

                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Fecha *</label>
                                <input type="date" id="news-date" required class="w-full px-3 py-2 border rounded-lg focus:border-[#040872] focus:outline-none">
                            </div>

                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Imagen *</label>
                                <div class="flex gap-3">
                                    <input type="text" id="news-image" required class="flex-1 px-3 py-2 border rounded-lg focus:border-[#040872] focus:outline-none" placeholder="URL de la imagen">
                                    <button type="button" onclick="CMSNews.selectImageFromLibrary('news-image')" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                                        <i class="fas fa-image mr-1"></i> Biblioteca
                                    </button>
                                </div>
                                <img id="news-image-preview" src="" alt="Preview" class="mt-2 w-full h-48 object-cover rounded-lg border hidden">
                            </div>

                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Descripción *</label>
                                <textarea id="news-description" required rows="4" class="w-full px-3 py-2 border rounded-lg focus:border-[#040872] focus:outline-none" placeholder="Descripción breve de la noticia"></textarea>
                            </div>

                            <div class="flex gap-3 justify-end pt-4 border-t">
                                <button type="button" onclick="CMSNews.closeNewsForm()" class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400">
                                    Cancelar
                                </button>
                                <button type="submit" class="bg-[#040872] text-white px-6 py-2 rounded-lg hover:bg-[#030561]">
                                    <i class="fas fa-save mr-2"></i> Guardar Noticia
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Crea una tarjeta de noticia
     */
    function createNewsCard(news, index) {
        const date = new Date(news.date);
        const formattedDate = date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });

        return `
            <div class="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div class="flex">
                    <img src="${news.image || ''}" alt="${news.title || ''}" class="w-32 h-32 object-cover flex-shrink-0" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%27 height=%27100%27%3E%3Crect fill=%27%23ddd%27 width=%27100%27 height=%27100%27/%3E%3Ctext x=%2750%27 y=%2750%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%23999%27%3ESin imagen%3C/text%3E%3C/svg%3E'">
                    <div class="flex-1 p-4">
                        <div class="flex justify-between items-start mb-2">
                            <h4 class="font-semibold text-[#040872] text-lg">${escapeHtml(news.title || 'Sin título')}</h4>
                            <div class="flex gap-2">
                                <button onclick="CMSNews.editNews(${index})" class="text-blue-600 hover:text-blue-800" title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="CMSNews.deleteNews(${index})" class="text-red-600 hover:text-red-800" title="Eliminar">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <p class="text-sm text-gray-600 mb-2">${formattedDate}</p>
                        <p class="text-gray-700 text-sm line-clamp-2">${escapeHtml(news.description || '')}</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Muestra el formulario para crear nueva noticia
     */
    function showNewsForm() {
        const modal = document.getElementById('news-modal');
        const form = document.getElementById('news-form');
        const title = document.getElementById('news-modal-title');
        
        if (modal && form && title) {
            title.textContent = 'Nueva Noticia';
            form.reset();
            document.getElementById('news-id').value = '';
            document.getElementById('news-date').value = new Date().toISOString().split('T')[0];
            document.getElementById('news-image-preview').classList.add('hidden');
            modal.classList.remove('hidden');

            // Previsualización de imagen
            const imageInput = document.getElementById('news-image');
            const imagePreview = document.getElementById('news-image-preview');
            if (imageInput && imagePreview) {
                imageInput.addEventListener('input', function() {
                    if (this.value) {
                        imagePreview.src = this.value;
                        imagePreview.classList.remove('hidden');
                    } else {
                        imagePreview.classList.add('hidden');
                    }
                });
            }
        }
    }

    /**
     * Edita una noticia existente
     */
    function editNews(index) {
        const news = newsData[index];
        if (!news) return;

        const modal = document.getElementById('news-modal');
        const form = document.getElementById('news-form');
        const title = document.getElementById('news-modal-title');
        
        if (modal && form && title) {
            title.textContent = 'Editar Noticia';
            document.getElementById('news-id').value = index;
            document.getElementById('news-title').value = news.title || '';
            document.getElementById('news-date').value = news.date || '';
            document.getElementById('news-image').value = news.image || '';
            document.getElementById('news-description').value = news.description || '';

            const imagePreview = document.getElementById('news-image-preview');
            if (news.image && imagePreview) {
                imagePreview.src = news.image;
                imagePreview.classList.remove('hidden');
            }

            modal.classList.remove('hidden');
        }
    }

    /**
     * Elimina una noticia
     */
    function deleteNews(index) {
        if (confirm('¿Estás seguro de eliminar esta noticia?')) {
            newsData.splice(index, 1);
            saveNews();
            renderEditor();
        }
    }

    /**
     * Cierra el formulario
     */
    function closeNewsForm() {
        const modal = document.getElementById('news-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /**
     * Guarda una noticia (crear o actualizar)
     */
    function saveNewsItem(e) {
        e.preventDefault();

        const id = document.getElementById('news-id').value;
        const title = document.getElementById('news-title').value.trim();
        const date = document.getElementById('news-date').value;
        const image = document.getElementById('news-image').value.trim();
        const description = document.getElementById('news-description').value.trim();

        if (!title || !date || !image || !description) {
            alert('Por favor completa todos los campos requeridos.');
            return;
        }

        const newsItem = {
            id: id ? newsData[parseInt(id)].id : `news-${Date.now()}`,
            title: title,
            date: date,
            image: image,
            description: description,
            createdAt: id ? newsData[parseInt(id)].createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (id) {
            // Actualizar noticia existente
            newsData[parseInt(id)] = newsItem;
        } else {
            // Crear nueva noticia
            newsData.unshift(newsItem);
        }

        saveNews();
        closeNewsForm();
        renderEditor();
        
        alert('¡Noticia guardada exitosamente!');
    }

    /**
     * Selecciona imagen de la biblioteca
     */
    function selectImageFromLibrary(inputId) {
        // Por ahora, simplemente mostrar un prompt
        // En el futuro, esto podría abrir un modal con la galería de medios
        const url = prompt('Ingresa la URL de la imagen:');
        if (url) {
            const input = document.getElementById(inputId);
            if (input) {
                input.value = url;
                input.dispatchEvent(new Event('input'));
            }
        }
    }

    /**
     * Renderiza el editor
     */
    async function renderEditor() {
        const container = document.getElementById('newsEditor');
        if (container) {
            container.innerHTML = await createEditor();
            
            // Agregar evento al formulario
            const form = document.getElementById('news-form');
            if (form) {
                form.addEventListener('submit', saveNewsItem);
            }
        }
    }

    /**
     * Genera el HTML de las noticias para noticias.html
     */
    async function generateNewsHTML() {
        await loadNews();
        
        if (newsData.length === 0) {
            return '';
        }

        let html = '';
        newsData.forEach(news => {
            const date = new Date(news.date);
            const formattedDate = date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
            
            html += `
                <article class="bg-[#F8FAFC] rounded-xl overflow-hidden">
                    <img src="${escapeHtml(news.image)}" alt="${escapeHtml(news.title)}" class="w-full h-44 object-cover">
                    <div class="p-5">
                        <h3 class="font-semibold text-[#040872]">${escapeHtml(news.title)}</h3>
                        <p class="text-sm text-gray-600 mt-1">${formattedDate}</p>
                        <p class="text-gray-700 mt-2">${escapeHtml(news.description)}</p>
                    </div>
                </article>
            `;
        });

        return html;
    }

    /**
     * Escapa HTML
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Inicializar cuando se carga
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            loadNews().catch(err => console.warn('Error al inicializar noticias:', err));
        });
    } else {
        loadNews().catch(err => console.warn('Error al inicializar noticias:', err));
    }

    return {
        createEditor,
        showNewsForm,
        editNews,
        deleteNews,
        closeNewsForm,
        saveNewsItem,
        selectImageFromLibrary,
        renderEditor,
        generateNewsHTML,
        loadNews,
        saveNews
    };
})();

