document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário está logado
    const token = localStorage.getItem('token');
    const userGreeting = document.getElementById('userGreeting');
    const authButton = document.getElementById('authButton');

    if (token) {
        // Se logado, mostrar informações do usuário
        fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                userGreeting.textContent = `Olá, ${data.user.nome.split(' ')[0]}`;
                authButton.innerHTML = '🚪 Sair';
                authButton.onclick = logout;
            } else {
                localStorage.removeItem('token');
                authButton.innerHTML = '🔑 Login';
                authButton.onclick = goToLogin;
            }
        })
        .catch(() => {
            localStorage.removeItem('token');
            authButton.innerHTML = '🔑 Login';
            authButton.onclick = goToLogin;
        });
    } else {
        // Se não logado
        authButton.innerHTML = '🔑 Login';
        authButton.onclick = goToLogin;
    }

    // Funções auxiliares
    function goToLogin() {
        window.location.href = '/login.html';
    }

    function logout() {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    }
});
