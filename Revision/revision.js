const forums = []; // Arreglo para almacenar foros

        function openModal() {
            document.getElementById("myModal").style.display = "block";
        }

        function closeModal() {
            document.getElementById("myModal").style.display = "none";
        }

        window.onclick = function(event) {
            const modal = document.getElementById("myModal");
            if (event.target === modal) {
                closeModal();
            }
        };

        function createForum() {
            const creatorName = document.getElementById('creatorName').value.trim();
            const forumTitle = document.getElementById('forumTitle').value.trim();
            const forumDescription = document.getElementById('forumDescription').value.trim();
            const postCode = document.getElementById('postCode').value.trim();

            if (creatorName && forumTitle && forumDescription && postCode) {
                const forumId = Date.now(); // ID único para cada foro
                forums.push({ creatorName, forumTitle, forumDescription, postCode, forumId }); // Almacenar el foro

                // Crear el elemento del foro y agregarlo al DOM
                renderForum({ creatorName, forumTitle, forumDescription, postCode, forumId });

                // Limpiar el formulario y cerrar el modal
                document.getElementById('creatorName').value = '';
                document.getElementById('forumTitle').value = '';
                document.getElementById('forumDescription').value = '';
                document.getElementById('postCode').value = '';
                closeModal(); // Cerrar el modal después de crear el foro
            } else {
                alert('Por favor, completa todos los campos.');
            }
        }

        function renderForum({ creatorName, forumTitle, forumDescription, postCode, forumId }) {
    const forumItem = document.createElement('div');
    forumItem.classList.add('forum-topic');
    forumItem.innerHTML = `
        <div class="forum-header">
            <p style="color: #02d9ff; font-weight: bold;">${creatorName}</p>
            <p>ID del Foro: ${forumId}</p> <!-- Mostrar el ID del foro -->
            <p>${new Date().toLocaleString()}</p>
            <h2>${forumTitle}</h2>
            <p>${forumDescription}</p>
            <pre class="code-box"><code>${postCode}</code></pre> <!-- Solo el código tiene el estilo de cuadro -->
            <button class="reply-button" onclick="toggleReplyInput('replyInput${forumId}')">Responder</button>
        </div>
        <div id="replyInput${forumId}" class="reply-input" style="display:none;">
            <textarea placeholder="Escribe tu comentario..."></textarea>
            <button class="reply-button" onclick="submitComment('replyInput${forumId}', 'commentsSection${forumId}')">Comentar</button>
        </div>
        <div id="commentsSection${forumId}" class="comments-section"></div>
    `;

    // Establece el contenido de `postCode` dentro del `<code>` usando `textContent`
        forumItem.querySelector("pre.code-box code").textContent = postCode;

            const commentsSection = document.createElement('div');
            commentsSection.id = `commentsSection${forumId}`;
            commentsSection.classList.add('comments-section');

    forumItem.appendChild(commentsSection);
    document.getElementById('forumsList').insertBefore(forumItem, document.getElementById('forumsList').firstChild);
    }

    function searchForums() {
        const searchQuery = document.querySelector('.search-input').value.toLowerCase();
    
    // Filtrar foros por título, nombre del creador o ID
    const filteredForums = forums.filter(forum => 
        forum.forumTitle.toLowerCase().includes(searchQuery) || 
        forum.creatorName.toLowerCase().includes(searchQuery) ||
        forum.forumId.toString().includes(searchQuery) // Búsqueda por ID
    );

    // Limpiar la lista de foros y volver a renderizar con los resultados filtrados
        document.getElementById('forumsList').innerHTML = '';
        filteredForums.forEach(renderForum);
    }


        function toggleReplyInput(inputId) {
            const inputSection = document.getElementById(inputId);
            inputSection.style.display = inputSection.style.display === 'none' ? 'block' : 'none';
        }

        function submitComment(replyInputId, commentsSectionId) {
    const replyInput = document.getElementById(replyInputId);
    const commentText = replyInput.querySelector('textarea').value.trim();

    if (commentText) {
        const commentItem = document.createElement('div');
        commentItem.classList.add('comment');
        commentItem.innerHTML = `
            <hr> <!-- Línea horizontal entre comentarios -->
            <div class="comment-header">Usuario</div>
            <div class="comment-time">${new Date().toLocaleString()}</div>
            <div class="comment-text">${commentText}</div>
            <button class="comment-reply-button" onclick="toggleReplyInput('replyInputReply${Date.now()}')">Responder</button>
            <div id="replyInputReply${Date.now()}" class="reply-input" style="display:none;">
                <textarea placeholder="Escribe tu respuesta..."></textarea>
                <button class="reply-button" onclick="submitReply('replyInputReply${Date.now()}', 'repliesSection${Date.now()}')">Comentar</button>
            </div>
            <div id="repliesSection${Date.now()}" class="replies-section"></div>
        `;

        document.getElementById(commentsSectionId).appendChild(commentItem);
        replyInput.querySelector('textarea').value = ''; // Limpiar textarea después de enviar
        replyInput.style.display = 'none'; // Ocultar sección de respuesta
    } else {
        alert('Por favor, escribe un comentario antes de enviar.');
    }
}


function submitReply(replyInputId, repliesSectionId) {
    const replyInput = document.getElementById(replyInputId);
    const replyText = replyInput.querySelector('textarea').value.trim();

    if (replyText) {
        const replyItem = document.createElement('div');
        replyItem.classList.add('reply');
        replyItem.innerHTML = `
            <div class="comment-header">Respuesta</div>
            <div class="comment-time">${new Date().toLocaleString()}</div>
            <div class="comment-text">${replyText}</div>
        `;
        document.getElementById(repliesSectionId).appendChild(replyItem);
        replyInput.querySelector('textarea').value = ''; // Limpiar textarea después de enviar
        replyInput.style.display = 'none'; // Ocultar sección de respuesta
    } else {
        alert('Por favor, escribe una respuesta antes de enviar.');
    }
}