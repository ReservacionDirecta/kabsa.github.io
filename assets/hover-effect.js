// Efecto de cambio de fondo al hacer hover en las tarjetas de empresas
document.addEventListener('DOMContentLoaded', function() {
    console.log("Script de hover cargado");
    
    // Seleccionar la sección del grupo y las tarjetas de empresas
    const empresaSection = document.getElementById('empresas');
    empresaSection.style.transition = 'background-image 0.5s ease-in-out';
    const empresaCards = document.querySelectorAll('#empresas .grid > div');
    
    console.log("Sección empresa:", empresaSection);
    console.log("Tarjetas de empresas encontradas:", empresaCards.length);
    
    if (empresaSection && empresaCards.length > 0) {
        // Configuración de fondos para cada empresa usando imágenes de stock de ejemplo
        const empresaBackgrounds = [
            'url("assets/bg1.png")',
            'url("assets/bg2.png")',
            'url("assets/bg-empresa3.svg")'
        ];
        
        // Añadir eventos de hover a las tarjetas de empresas
        empresaCards.forEach((card, index) => {
            if (index < empresaBackgrounds.length) {
                console.log("Añadiendo evento a tarjeta", index);
                
                card.addEventListener('mouseenter', () => {
                    console.log("Hover en tarjeta", index);
                    empresaSection.style.backgroundImage = empresaBackgrounds[index];
                    empresaSection.style.backgroundSize = 'cover';
                    empresaSection.style.backgroundPosition = 'center';
                    empresaSection.style.backgroundRepeat = 'no-repeat';

                });
                
                card.addEventListener('mouseleave', () => {
                    console.log("Salida de tarjeta", index);
                    empresaSection.style.backgroundImage = 'none';
                });
            }
        });
    }
});