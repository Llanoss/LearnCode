// =================== Variables Globales =================== //
let revisions = []; // Almacena todas las revisiones cargadas
let revisionsListData = []; // Almacena las revisiones que se han cargado del backend

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

// Abrir el modal para crear una revisión
function openModal() {
    const creatorName = getCreatorName();
    document.getElementById('creatorNameDisplay').textContent = creatorName;
    document.getElementById("revisionModal").style.display = "block";
}

// Cerrar el modal para crear una revisión
function closeModal() {
    document.getElementById("revisionModal").style.display = "none";
}

// Cerrar modal si el usuario hace clic fuera del modal
window.onclick = function (event) {
    const modal = document.getElementById("revisionModal");
    if (event.target === modal) closeModal();
};

// =================== Crear Revisión =================== //

// Crear una nueva revisión
function createRevision() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Debes iniciar sesión para crear una revisión.');
        window.location.href = '/Frontend/InicioDeSesion/login.html';
        return;
    }

    // Obtener valores del formulario
    const revisionTitle = document.getElementById('revisionTitle')?.value.trim();
    const revisionDescription = document.getElementById('revisionDescription')?.value.trim();
    const revisionCode = document.getElementById('revisionCode')?.value.trim();
    const creatorName = getCreatorName();

    if (!revisionTitle || !revisionDescription || !revisionCode) {
        alert('Por favor, completa todos los campos antes de enviar.');
        return;
    }

    // Generar un revisionId único, similar al forumId
    const revisionId = Date.now().toString();  // Generar un ID único basado en el tiempo

    // Preparar los datos para enviar
    const payload = {
        revisionId,        // Incluir el revisionId generado
        revisionTitle,
        revisionDescription,
        revisionCode,
        creatorName,
    };

    console.log('Datos enviados:', payload); // Depuración

    // Enviar solicitud al servidor
    fetch('http://localhost:5000/api/revisions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    console.error('Error del servidor:', errorData);
                    throw new Error(errorData.message || 'Error en la solicitud.');
                });
            }
            return response.json();
        })
        .then(data => {
            alert('Revisión creada con éxito.');
            // Limpiar campos y cerrar modal
            document.getElementById('revisionTitle').value = '';
            document.getElementById('revisionDescription').value = '';
            document.getElementById('revisionCode').value = '';
            closeModal();
        })
        .catch(error => {
            console.error('Error al crear la revisión:', error.message);
            alert('Hubo un problema al crear la revisión.');
        });
}

// =================== Cargar y Renderizar Revisiones =================== //

// Cargar revisiones desde el backend
function loadRevisions() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Debes iniciar sesión para ver las revisiones.');
        return;
    }

    fetch('http://localhost:5000/api/revisions', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                revisionsListData = data.revisions;
                renderAllRevisions(revisionsListData);
            } else {
                alert('No se pudieron cargar las revisiones');
            }
        })
        .catch(error => {
            console.error('Error al cargar las revisiones:', error);
            alert('Hubo un problema al cargar las revisiones');
        });
}

// Renderizar una revisión individual
function renderRevision(revision) {
    const revisionItem = document.createElement('div');
    revisionItem.classList.add('revision-topic');
    revisionItem.innerHTML = `
        <div class="revision-header">
            <p style="color: #02d9ff; font-weight: bold;">${revision.creatorName}</p>
            <p>ID de la Revisión: ${revision.revisionId}</p>
            <p>${revision.createdAt ? new Date(revision.createdAt).toLocaleString() : 'Fecha inválida'}</p>
            <h2>${revision.revisionTitle}</h2>
            <p>${revision.revisionDescription}</p>
            <pre><code>${revision.revisionCode}</code></pre>
            <button class="reply-button" onclick="toggleReplyInput('replyInput${revision.revisionId}')">Comentar</button>
        </div>
        <div id="replyInput${revision.revisionId}" class="reply-input" style="display:none;">
            <textarea placeholder="Escribe tu comentario..."></textarea>
            <button class="reply-button" onclick="submitComment('replyInput${revision.revisionId}', 'commentsSection${revision.revisionId}', '${revision.revisionId}')">Enviar</button>
        </div>
        <div id="commentsSection${revision.revisionId}" class="comments-section"></div>
    `;

    document.getElementById('revisionsList').appendChild(revisionItem);
    loadComments(revision.revisionId); // Cargar comentarios asociados
}

// Renderizar todas las revisiones
function renderAllRevisions(revisions) {
    const revisionsList = document.getElementById('revisionsList');
    revisionsList.innerHTML = ''; // Limpiar lista antes de renderizar
    revisions.forEach(revision => renderRevision(revision));
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

function submitComment(replyInputId, commentsSectionId, revisionId) {
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

    fetch('http://localhost:5000/api/revisions/add-comment', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ revisionId, commentText, userName })
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
                        <button class="delete-button" onclick="deleteItem('comment', '${data.commentId}', '${revisionId}')">Eliminar</button>
                    </div>
                    <div id="replyInputComment${data.commentId}" class="reply-input" style="display: none;">
                        <textarea placeholder="Escribe tu respuesta aquí"></textarea>
                        <button class="reply-button" onclick="submitReply('${data.commentId}', '${revisionId}')">Enviar Respuesta</button>
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

function submitReply(commentId, revisionId) {
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

    fetch('http://localhost:5000/api/revisions/add-reply', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            revisionId,
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
                    <button class="delete-button" onclick="deleteItem('reply', '${data.replyId}', '${revisionId}')">Eliminar</button>
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

function loadComments(revisionId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Debes iniciar sesión para ver los comentarios.');
        return;
    }

    fetch(`http://localhost:5000/api/revisions/${revisionId}/comments`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.comments) {
                const commentsSection = document.getElementById(`commentsSection${revisionId}`);
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
                            <button class="delete-button" onclick="deleteItem('comment', '${comment._id}', '${revisionId}')">Eliminar</button>
                        </div>
                        <div id="replyInputComment${comment._id}" class="reply-input" style="display: none;">
                            <textarea placeholder="Escribe tu respuesta aquí"></textarea>
                            <button class="reply-button" onclick="submitReply('${comment._id}', '${revisionId}')">Enviar Respuesta</button>
                        </div>
                        <div class="replies-section">
                            ${comment.replies ? comment.replies.map(reply => `
                                <div class="reply" id="reply-${reply._id}">
                                    <hr>
                                    <div class="reply-header">${reply.userName}</div>
                                    <div class="reply-time">${new Date(reply.createdAt).toLocaleString()}</div>
                                    <div class="reply-text">${reply.commentText}</div>
                                    <button class="delete-button" onclick="deleteItem('reply', '${reply._id}', '${revisionId}')">Eliminar</button>
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

function deleteItem(itemType, itemId, revisionId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Debes iniciar sesión para eliminar comentarios o respuestas.');
        return;
    }

    const confirmDelete = confirm('¿Estás seguro de que quieres eliminarlo?');
    if (!confirmDelete) return;

    fetch(`http://localhost:5000/api/revisions/${itemType}/${itemId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Se eliminó correctamente.');
                location.reload(); // Recargar la página después de eliminar el comentario o respuesta
            } else {
                alert('Error al eliminar el elemento.');
            }
        })
        .catch(error => {
            console.error('Error al eliminar el elemento:', error);
            alert('Hubo un problema al intentar eliminar el elemento.');
        });
}

// =================== Inicialización =================== //
window.onload = loadRevisions;



