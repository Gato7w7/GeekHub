document.getElementById('logout-button').addEventListener('click', () => {
    localStorage.removeItem('email'); // Elimina el token JWT
    localStorage.removeItem('token'); // Elimina el token JWT
    localStorage.removeItem('pendingEmail'); // Elimina cualquier dato pendiente del login
    alert('Sesión cerrada');
    window.location.href = 'index.html'; // Redirige al login
});

// Proteger la página: si no hay token, redirigir al login
const token = localStorage.getItem('token');
if (!token) {
    alert('Debes iniciar sesión primero');
    window.location.href = 'index.html';
}

document.getElementById('change-password-button').addEventListener('click', async () => {
    const oldPassword = document.getElementById('old-password').value;
    const newPassword = document.getElementById('new-password').value;
    //const email = localStorage.getItem('email'); // Guarda el email al iniciar sesión
    const token = localStorage.getItem('token');
    const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decodifica el JWT
    const email = decodedToken.email; // Obtiene el email del token


    const response = await fetch('http://localhost:3000/change-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Enviar el token en el encabezado
        },
        body: JSON.stringify({ email, oldPassword, newPassword })
    });



    const data = await response.json();
    alert(data.message);
});