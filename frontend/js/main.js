document.addEventListener('DOMContentLoaded', function() {
    const postsContainer = document.getElementById('posts-container');
    const loadingElement = document.getElementById('loading');
    const lastUpdatedElement = document.getElementById('lastUpdated');
    
    // URL de la API (ajustar según sea necesario)
    const API_URL = 'http://localhost:5000/api/posts';
    
    // Función para formatear la fecha
    function formatDate(dateString) {
        if (!dateString) return 'Fecha no disponible';
        
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString; // Devuelve la cadena original si no es una fecha válida
            }
            return date.toLocaleDateString('es-ES', options);
        } catch (e) {
            console.error('Error al formatear la fecha:', e);
            return dateString; // Devuelve la cadena original en caso de error
        }
    }
    
    // Función para actualizar la hora de la última actualización
    function updateLastUpdated() {
        const now = new Date();
        lastUpdatedElement.textContent = `Última actualización: ${formatDate(now)}`;
    }
    
    // Función para crear el HTML de una tarjeta de noticia
    function createPostCard(post) {
        return `
            <article class="post-card">
                ${post.image_url ? `
                    <img src="${post.image_url}" alt="${post.title}" class="post-image" onerror="this.style.display='none'">
                ` : ''}
                <div class="post-content">
                    <h2 class="post-title">${post.title || 'Sin título'}</h2>
                    <p class="post-summary">${post.summary || 'Sin resumen disponible'}</p>
                    <div class="post-meta">
                        ${post.provider ? `<span class="post-provider">${post.provider}</span>` : ''}
                        ${post.release_date ? `<span class="post-date">${formatDate(post.release_date)}</span>` : ''}
                    </div>
                    <a href="${post.source_url || '#'}" target="_blank" rel="noopener noreferrer" class="post-link">
                        Leer más <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </article>
        `;
    }
    
    // Función para cargar las noticias
    async function loadPosts() {
        try {
            loadingElement.style.display = 'flex';
            postsContainer.innerHTML = '';
            
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                throw new Error('Error al cargar las noticias');
            }
            
            const posts = await response.json();
            
            if (posts.length === 0) {
                postsContainer.innerHTML = '<p class="no-posts">No hay noticias disponibles en este momento.</p>';
                return;
            }
            
            // Ordenar por fecha de publicación (más recientes primero)
            posts.sort((a, b) => {
                const dateA = new Date(a.release_date || a.created_at || 0);
                const dateB = new Date(b.release_date || b.created_at || 0);
                return dateB - dateA;
            });
            
            posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.innerHTML = createPostCard(post);
                postsContainer.appendChild(postElement.firstElementChild);
            });
            
            updateLastUpdated();
            
        } catch (error) {
            console.error('Error:', error);
            postsContainer.innerHTML = `
                <div class="error-message">
                    <p>No se pudieron cargar las noticias. Por favor, intente nuevamente más tarde.</p>
                    <p><small>${error.message}</small></p>
                    <button onclick="window.location.reload()" class="retry-button">Reintentar</button>
                </div>
            `;
        } finally {
            loadingElement.style.display = 'none';
        }
    }
    
    // Cargar noticias al iniciar
    loadPosts();
    
    // Recargar noticias cada 5 minutos
    setInterval(loadPosts, 5 * 60 * 1000);
});

// Hacer la función loadPosts disponible globalmente para el botón de reintento
window.loadPosts = function() {
    document.dispatchEvent(new Event('DOMContentLoaded'));
};
