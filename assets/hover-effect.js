// Efecto de cambio de fondo al hacer hover en las tarjetas de empresas
document.addEventListener('DOMContentLoaded', function() {
    console.log("Script de hover cargado");
    
    // Seleccionar la sección del grupo y las tarjetas de empresas
    const empresaSection = document.getElementById('empresas');
    if (!empresaSection) {
        console.warn("Sección 'empresas' no encontrada");
        return;
    }
    
    empresaSection.style.transition = 'background-image 0.5s ease-in-out';
    const empresaCards = document.querySelectorAll('#empresas .grid > div.company-card, #empresas .grid > div[data-bg-image]');
    
    console.log("Sección empresa:", empresaSection);
    console.log("Tarjetas de empresas encontradas:", empresaCards.length);
    
    if (empresaSection && empresaCards.length > 0) {
        // Añadir eventos de hover a las tarjetas de empresas
        empresaCards.forEach((card, index) => {
            // Obtener la imagen de fondo del atributo data-bg-image
            const bgImage = card.getAttribute('data-bg-image');
            
            if (bgImage) {
                console.log(`Añadiendo evento a tarjeta ${index} con imagen:`, bgImage);
                
                card.addEventListener('mouseenter', () => {
                    console.log("Hover en tarjeta", index, "Imagen:", bgImage);
                    // Usar la URL directamente del atributo data-bg-image
                    empresaSection.style.backgroundImage = `url("${bgImage}")`;
                    empresaSection.style.backgroundSize = 'cover';
                    empresaSection.style.backgroundPosition = 'center';
                    empresaSection.style.backgroundRepeat = 'no-repeat';
                    // Agregar overlay oscuro para mejor legibilidad
                    const overlay = empresaSection.querySelector('#section-overlay');
                    if (overlay) {
                        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
                    }
                });
                
                card.addEventListener('mouseleave', () => {
                    console.log("Salida de tarjeta", index);
                    empresaSection.style.backgroundImage = 'none';
                    // Quitar overlay
                    const overlay = empresaSection.querySelector('#section-overlay');
                    if (overlay) {
                        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                    }
                });
            } else {
                console.warn(`Tarjeta ${index} no tiene atributo data-bg-image`);
            }
        });
    } else {
        console.warn("No se encontraron tarjetas con data-bg-image");
    }
});