document.querySelector('.register-form').addEventListener('submit', function(event) {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden.');
        event.preventDefault(); // Evita que se envíe el formulario si las contraseñas no coinciden
    }

    if (password === '' || confirmPassword === '') {
        alert('Por favor, rellena todos los campos.');
        event.preventDefault(); // Evita que se envíe el formulario si faltan campos
    }
});
