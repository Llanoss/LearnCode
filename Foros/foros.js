// =================== Variables Globales =================== //
let forums = []; // Almacena todos los foros cargados
let forumsListData = []; // Almacena los foros que se han cargado del backend

// =================== Funciones Auxiliares =================== //

// Obtener el nombre del creador desde el token JWT
function getCreatorName() {
    const token = localStorage.getItem('token');
    if (!token) return 'Usuario'; // Valor por defecto si no hay token

    try {
        const decodedToken = jwt_decode(token);
        return decodedToken.name || decodedToken.username || 'Usuario';
    } catch (error) {
        console.error('Error al decodificar el token:', error);
        return 'Usuario';
    }
}

// =================== Funciones de Modal =================== //

// Abrir el modal para crear un foro
function openModal() {
    const creatorName = getCreatorName();
    document.getElementById('creatorNameDisplay').textContent = creatorName;
    document.getElementById("myModal").style.display = "block";
}

// Cerrar el modal para crear un foro
function closeModal() {
    document.getElementById("myModal").style.display = "none";
}

// Cerrar modal si el usuario hace clic fuera del modal
window.onclick = function (event) {
    const modal = document.getElementById("myModal");
    if (event.target === modal) closeModal();
};

// =================== Crear Foro =================== //

// Crear un nuevo foro
function createForum() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Debes iniciar sesión para crear un foro.');
        window.location.href = '/Frontend/InicioDeSesion/login.html';
        return;
    }

    const forumTitle = document.getElementById('forumTitle').value.trim();
    const forumDescription = document.getElementById('forumDescription').value.trim();
    const creatorName = getCreatorName();

    if (forumTitle && forumDescription) {
        const forumId = Date.now().toString(); // Generar un ID único

        fetch('http://localhost:5000/api/forums', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ forumId, creatorName, forumTitle, forumDescription })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Foro creado con éxito');
                    renderForum({ creatorName, forumTitle, forumDescription, forumId });
                    document.getElementById('forumTitle').value = '';
                    document.getElementById('forumDescription').value = '';
                    closeModal();
                } else {
                    alert(data.message || 'Error al crear el foro');
                }
            })
            .catch(error => {
                console.error('Error al crear el foro:', error);
                alert('Hubo un problema al crear el foro');
            });
    } else {
        alert('Por favor, completa todos los campos.');
    }
}

// =================== Cargar y Renderizar Foros =================== //

// Cargar foros desde el backend
function loadForums() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Debes iniciar sesión para ver los foros.');
        return;
    }

    fetch('http://localhost:5000/api/forums', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                forumsListData = data.forums;
                renderAllForums(forumsListData);
            } else {
                alert('No se pudieron cargar los foros');
            }
        })
        .catch(error => {
            console.error('Error al cargar los foros:', error);
            alert('Hubo un problema al cargar los foros');
        });
}

// Renderizar un foro individual
function renderForum(forum) {
    const forumItem = document.createElement('div');
    forumItem.classList.add('forum-topic');
    forumItem.innerHTML = `
        <div class="forum-header">
            <p style="color: #02d9ff; font-weight: bold;">${forum.creatorName}</p>
            <p>ID del Foro: ${forum.forumId}</p>
            <p>${forum.createdAt ? new Date(forum.createdAt).toLocaleString() : 'Fecha inválida'}</p>
            <h2>${forum.forumTitle}</h2>
            <p>${forum.forumDescription}</p>
            <button class="reply-button" onclick="toggleReplyInput('replyInput${forum.forumId}')">Responder</button>
        </div>
        <div id="replyInput${forum.forumId}" class="reply-input" style="display:none;">
            <textarea placeholder="Escribe tu respuesta..."></textarea>
            <button class="reply-button" onclick="submitComment('replyInput${forum.forumId}', 'commentsSection${forum.forumId}', '${forum.forumId}')">Enviar</button>
        </div>
        <div id="commentsSection${forum.forumId}" class="comments-section"></div>
    `;

    document.getElementById('forumsList').appendChild(forumItem);
    loadComments(forum.forumId); // Cargar comentarios asociados
}

// Renderizar todos los foros
function renderAllForums(forums) {
    const forumsList = document.getElementById('forumsList');
    forumsList.innerHTML = ''; // Limpiar lista antes de renderizar
    forums.forEach(forum => renderForum(forum));
}

// =================== Comentarios =================== //

// Mostrar u ocultar el input de respuesta
function toggleReplyInput(inputId) {
    const inputSection = document.getElementById(inputId);
    if (inputSection) {
        inputSection.style.display = inputSection.style.display === 'none' ? 'block' : 'none';
    } else {
        console.error(`No se encontró el elemento con ID: ${inputId}`);
    }
}

// =================== FUNCIONES DE COMENTARIOS =================== //

function submitComment(replyInputId, commentsSectionId, forumId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Debes iniciar sesión para comentar.');
        window.location.href = '/Frontend/InicioDeSesion/login.html';
        return;
    }

    const replyInput = document.getElementById(replyInputId);
    const commentsSection = document.getElementById(commentsSectionId);
    const commentText = replyInput.querySelector('textarea')?.value.trim();
    const userName = getCreatorName();

    if (!commentText) {
        alert('Por favor, escribe un comentario antes de enviar.');
        return;
    }

    fetch('http://localhost:5000/api/forums/add-comment', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ forumId, commentText, userName })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const commentItem = document.createElement('div');
                commentItem.classList.add('comment');
                commentItem.id = `comment-${data.commentId}`;
                commentItem.innerHTML = `
                    <hr>
                    <div class="comment-header">${userName}</div>
                    <div class="comment-time">${new Date().toLocaleString()}</div>
                    <div class="comment-text">${commentText}</div>
                    <div class="button-container">
                        <button class="reply-button" onclick="toggleReplyInput('replyInputComment${data.commentId}')">Responder</button>
                        <button class="delete-button" onclick="deleteItem('comment', '${data.commentId}', '${forumId}')">Eliminar</button>
                    </div>
                    <div id="replyInputComment${data.commentId}" class="reply-input" style="display: none;">
                        <textarea placeholder="Escribe tu respuesta aquí"></textarea>
                        <button class="reply-button" onclick="submitReply('${data.commentId}', '${forumId}')">Enviar Respuesta</button>
                    </div>
                `;
                commentsSection.appendChild(commentItem);
                replyInput.querySelector('textarea').value = '';
                replyInput.style.display = 'none';
                location.reload(); // Recargar la página después de agregar el comentario
            } else {
                alert('Error al guardar el comentario.');
            }
        })
        .catch(error => {
            console.error('Error al enviar el comentario:', error);
            alert('Hubo un problema al guardar el comentario.');
        });
}

// =================== FUNCIONES DE RESPUESTAS =================== //

function submitReply(commentId, forumId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Debes iniciar sesión para responder.');
        window.location.href = '/Frontend/InicioDeSesion/login.html';
        return;
    }

    const replyInput = document.getElementById(`replyInputComment${commentId}`);
    const commentText = replyInput.querySelector('textarea')?.value.trim();
    const userName = getCreatorName();

    if (!commentText) {
        alert('Por favor, escribe una respuesta antes de enviar.');
        return;
    }

    fetch('http://localhost:5000/api/forums/add-reply', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            forumId,
            commentId,
            replyText: commentText,
            userName
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const commentItem = document.getElementById(`comment-${commentId}`);
                const repliesSection = commentItem.querySelector('.replies-section');
                const replyItem = document.createElement('div');
                replyItem.classList.add('reply');
                replyItem.id = `reply-${data.replyId}`;
                replyItem.innerHTML = `
                    <hr>
                    <div class="reply-header">${userName}</div>
                    <div class="reply-time">${new Date().toLocaleString()}</div>
                    <div class="reply-text">${commentText}</div>
                    <button class="delete-button" onclick="deleteItem('reply', '${data.replyId}', '${forumId}')">Eliminar</button>
                `;
                repliesSection.appendChild(replyItem);
                replyInput.querySelector('textarea').value = '';
                replyInput.style.display = 'none';
                location.reload(); // Recargar la página después de agregar la respuesta
            } else {
                alert('Error al enviar la respuesta.');
            }
        })
        .catch(error => {
            console.error('Error al enviar la respuesta:', error);
            alert('Hubo un problema al enviar la respuesta.');
        });
}

// =================== FUNCION PARA CARGAR COMENTARIOS Y RESPUESTAS =================== //

function loadComments(forumId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Debes iniciar sesión para ver los comentarios.');
        return;
    }

    fetch(`http://localhost:5000/api/forums/${forumId}/comments`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.comments) {
                const commentsSection = document.getElementById(`commentsSection${forumId}`);
                if (!commentsSection) return;

                commentsSection.innerHTML = ''; // Limpiar antes de renderizar
                data.comments.forEach(comment => {
                    const commentItem = document.createElement('div');
                    commentItem.classList.add('comment');
                    commentItem.id = `comment-${comment._id}`;
                    commentItem.innerHTML = `
                        <hr>
                        <div class="comment-header">${comment.userName}</div>
                        <div class="comment-time">${new Date(comment.createdAt).toLocaleString()}</div>
                        <div class="comment-text">${comment.commentText}</div>
                        <div class="button-container">
                            <button class="reply-button" onclick="toggleReplyInput('replyInputComment${comment._id}')">Responder</button>
                            <button class="delete-button" onclick="deleteItem('comment', '${comment._id}', '${forumId}')">Eliminar</button>
                        </div>
                        <div id="replyInputComment${comment._id}" class="reply-input" style="display: none;">
                            <textarea placeholder="Escribe tu respuesta aquí"></textarea>
                            <button class="reply-button" onclick="submitReply('${comment._id}', '${forumId}')">Enviar Respuesta</button>
                        </div>
                        <div class="replies-section">
                            ${comment.replies ? comment.replies.map(reply => `
                                <div class="reply" id="reply-${reply._id}">
                                    <hr>
                                    <div class="reply-header">${reply.userName}</div>
                                    <div class="reply-time">${new Date(reply.createdAt).toLocaleString()}</div>
                                    <div class="reply-text">${reply.commentText}</div>
                                    <button class="delete-button" onclick="deleteItem('reply', '${reply._id}', '${forumId}')">Eliminar</button>
                                </div>
                            `).join('') : ''}
                        </div>
                    `;
                    commentsSection.appendChild(commentItem);
                });
            }
        })
        .catch(error => console.error('Error al cargar comentarios:', error));
}

// =================== FUNCION PARA ELIMINAR ITEM (COMENTARIO O RESPUESTA) =================== //

function deleteItem(itemType, itemId, forumId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Debes iniciar sesión para eliminar comentarios o respuestas.');
        return;
    }

    const confirmDelete = confirm('¿Estás seguro de que quieres eliminarlo?');
    if (!confirmDelete) return;

    fetch(`http://localhost:5000/api/forums/${itemType}/${itemId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Se elimino correctamente');
                location.reload(); // Recargar la página después de eliminar el comentario o respuesta
            } else {
                alert('Error al eliminar el item');
            }
        })
        .catch(error => {
            console.error('Error al eliminar el item:', error);
            alert('Hubo un problema al intentar eliminar el item');
        });
}

// =================== Inicialización =================== //
window.onload = loadForums;
