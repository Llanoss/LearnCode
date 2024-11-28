document.querySelector('.login-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Evita que la página se recargue al enviar el formulario.

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Validaciones
    if (!email || !password) {
        alert('Por favor, rellena todos los campos.');
        return;
    }

    try {
        // Enviar los datos al backend para iniciar sesión
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        console.log("Respuesta del servidor:", data);  // Verifica lo que está llegando desde el backend

        if (response.ok) {
            // Verificar que el token se reciba correctamente
            console.log('Token recibido:', data.token);  // Verifica que el token esté llegando

            if (data.token) {
                // Almacenar el token JWT en el localStorage
                localStorage.setItem('token', data.token);

                // Verificar que el token se guarda correctamente en localStorage
                console.log('Token almacenado en localStorage:', data.token);

                alert('Inicio de sesión exitoso');
                // Redirige a la página de LearnCode o al área de usuario después de iniciar sesión
                window.location.href = '/Frontend/Pages/Inicio/home.html';
            } else {
                console.log('El token no se recibió correctamente');
                alert('Hubo un error al iniciar sesión.');
            }
        } else {
            alert(data.message || 'Error al iniciar sesión');
        }
    } catch (error) {
        console.error('Error al conectar con el backend:', error);
        alert('Ocurrió un error al iniciar sesión. Inténtalo de nuevo más tarde.');
    }
});
