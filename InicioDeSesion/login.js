document.querySelector('.login-form').addEventListener('submit', function(event) {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email === '' || password === '') {
        alert('Por favor, rellena todos los campos.');
        event.preventDefault(); // Evita que se envíe el formulario si faltan campos
    }
});
