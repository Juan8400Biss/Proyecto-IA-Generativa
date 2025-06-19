from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from models import db, Post
from datetime import datetime
import os
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Inicializar la base de datos
    db.init_app(app)
    
    # Habilitar CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Crear tablas en la base de datos
    with app.app_context():
        db.create_all()
    
    # Ruta principal que sirve el frontend
    @app.route('/')
    def index():
        return render_template('index.html')
    
    # Rutas de la API
    @app.route('/api/posts', methods=['GET', 'POST'])
    def handle_posts():
        if request.method == 'GET':
            # Obtener todos los posts
            posts = Post.query.order_by(Post.created_at.desc()).all()
            return jsonify([post.to_dict() for post in posts])
        
        elif request.method == 'POST':
            # Crear un nuevo post
            data = request.get_json()
            
            # Validar datos requeridos
            required_fields = ['title', 'summary', 'source_url', 'release_date']
            if not all(field in data for field in required_fields):
                return jsonify({'error': 'Faltan campos requeridos'}), 400
            
            try:
                new_post = Post(
                    title=data['title'],
                    summary=data['summary'],
                    source_url=data['source_url'],
                    image_url=data.get('image_url'),
                    release_date=data['release_date'],
                    provider=data.get('provider'),
                    type=data.get('type')
                )
                
                db.session.add(new_post)
                db.session.commit()
                
                return jsonify(new_post.to_dict()), 201
            
            except Exception as e:
                db.session.rollback()
                return jsonify({'error': str(e)}), 500
    
    @app.route('/api/posts/<int:post_id>', methods=['GET'])
    def get_post(post_id):
        post = Post.query.get_or_404(post_id)
        return jsonify(post.to_dict())
    
    # Manejador de errores
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Recurso no encontrado'}), 404
    
    @app.errorhandler(500)
    def server_error(error):
        return jsonify({'error': 'Error interno del servidor'}), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
