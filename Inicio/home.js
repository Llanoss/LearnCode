// Cambia el texto dinámico en la sección hero
const dynamicText = document.getElementById('dynamic-text');
const typingIndicator = document.querySelector('.typing-indicator');
let words = ['Bienvenido','LearnCode', 'HolaMundo', 'Descubre', 'CodigoFacil', 'GuiaRapida'];
let index = 0;
let charIndex = 0;
let currentWord = '';
let isDeleting = false;

function typeEffect() {
    // Determina si estamos eliminando o escribiendo
    if (isDeleting) {
        currentWord = words[index].substring(0, charIndex--);
    } else {
        currentWord = words[index].substring(0, charIndex++);
    }

    dynamicText.textContent = currentWord;

    // Mostrar indicador de escritura
    if (!isDeleting && charIndex === words[index].length) {
        typingIndicator.style.display = 'inline'; // Mostrar indicador al finalizar
        setTimeout(() => {
            isDeleting = true; // Cambiar a eliminar
        }, 1000); // Esperar 1 segundo antes de comenzar a eliminar
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false; // Cambiar a escribir
        index = (index + 1) % words.length; // Cambiar a la siguiente palabra
        typingIndicator.style.display = 'inline'; // Mostrar indicador al cambiar de palabra
    }

    setTimeout(typeEffect, isDeleting ? 100 : 200);
}

// Para el parpadeo del indicador
setInterval(() => {
    typingIndicator.style.opacity = typingIndicator.style.opacity === '1' ? '0' : '1';
}, 500);

typeEffect();
