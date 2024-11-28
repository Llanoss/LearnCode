function openModal(title, description, year, imageUrl) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <h2>${title} (${year})</h2>
            <p>${description}</p>
            <img src="${imageUrl}" alt="${title}" class="modal-image">
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.style.display = 'none';
        modal.remove();
    }
}

// Cerrar el modal si el usuario hace clic fuera del modal
window.onclick = function(event) {
    if (event.target == document.getElementById("myModal")) {
        closeModal();
    }
}