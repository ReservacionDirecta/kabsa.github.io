/**
 * Sistema de Autenticación para CMS KABSA GROUP
 * Maneja login, logout y verificación de sesión
 */

// Inicializar el módulo inmediatamente
(function() {
    'use strict';
    
    // Credenciales por defecto (en producción, esto debería estar en un backend seguro)
    const DEFAULT_CREDENTIALS = {
        username: 'admin',
        password: 'kabsa2025' // Cambiar en producción
    };

    const STORAGE_KEY = 'cms_auth_token';
    const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas

    /**
     * Genera un token de sesión simple
     */
    function generateToken() {
        return btoa(JSON.stringify({
            username: DEFAULT_CREDENTIALS.username,
            timestamp: Date.now(),
            expiry: Date.now() + SESSION_DURATION
        }));
    }

    /**
     * Verifica si el token es válido
     */
    function isValidToken(token) {
        try {
            const data = JSON.parse(atob(token));
            return data.expiry > Date.now();
        } catch (e) {
            return false;
        }
    }

    /**
     * Inicia sesión con usuario y contraseña
     */
    function login(username, password) {
        return new Promise((resolve) => {
            // Simular verificación (en producción, esto debería ser una petición al servidor)
            setTimeout(() => {
                if (username === DEFAULT_CREDENTIALS.username && 
                    password === DEFAULT_CREDENTIALS.password) {
                    const token = generateToken();
                    localStorage.setItem(STORAGE_KEY, token);
                    resolve(true);
                } else {
                    resolve(false);
                }
            }, 500); // Simular delay de red
        });
    }

    /**
     * Cierra la sesión
     */
    function logout() {
        localStorage.removeItem(STORAGE_KEY);
        window.location.href = 'admin-login.html';
    }

    /**
     * Verifica si el usuario está autenticado
     */
    function isAuthenticated() {
        const token = localStorage.getItem(STORAGE_KEY);
        if (!token) return false;
        
        if (!isValidToken(token)) {
            localStorage.removeItem(STORAGE_KEY);
            return false;
        }
        
        return true;
    }

    /**
     * Obtiene información del usuario actual
     */
    function getCurrentUser() {
        const token = localStorage.getItem(STORAGE_KEY);
        if (!token || !isValidToken(token)) return null;
        
        try {
            const data = JSON.parse(atob(token));
            return { username: data.username };
        } catch (e) {
            return null;
        }
    }

    /**
     * Requiere autenticación - redirige si no está autenticado
     */
    function requireAuth() {
        if (!isAuthenticated()) {
            window.location.href = 'admin-login.html';
            return false;
        }
        return true;
    }

    // Exponer el módulo globalmente
    window.CMSAuth = {
        login,
        logout,
        isAuthenticated,
        getCurrentUser,
        requireAuth
    };
    
    // Log para debugging
    console.log('CMSAuth módulo inicializado correctamente');
})();

