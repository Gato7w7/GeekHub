document.getElementById('register-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    alert(data.message);
});

document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
        // Ocultar el formulario de login y mostrar el de MFA
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('mfa-section').style.display = 'block';

        // Guardar el email temporalmente para usarlo en la verificación MFA
        localStorage.setItem('pendingEmail', email);
    } else {
        alert(data.message);
    }

    if (response.ok) {
        localStorage.setItem('token', data.token);
        alert('Inicio de sesion exitoso');
        window.location.href = 'home.html';
    } else {
        alert(data.message);
    }
});

// Verificación del código MFA
document.getElementById('mfa-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = localStorage.getItem('pendingEmail'); // Recuperamos el email del login
    const code = document.getElementById('mfa-code').value;

    const response = await fetch('http://localhost:3000/verify-mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem('token', data.token);
        alert('Autenticación exitosa');
        window.location.href = 'home.html';
    } else {
        alert(data.message);
    }
});
