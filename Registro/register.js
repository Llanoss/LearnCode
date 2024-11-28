document.querySelector('.register-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Evita que la página se recargue al enviar el formulario

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validaciones
    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden.');
        return;
    }

    if (!name || !email || !password || !confirmPassword) {
        alert('Por favor, rellena todos los campos.');
        return;
    }

    try {
        // Enviar datos al backend
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
            window.location.href = '/Frontend/InicioDeSesion/login.html'; // Redirige al login después de registrarse
        } else {
            alert(`Error: ${data.message || 'No se pudo registrar el usuario'}`);
        }
    } catch (error) {
        console.error('Error al conectar con el backend:', error);
        alert('Ocurrió un error en el registro. Inténtalo de nuevo más tarde.');
    }
});
