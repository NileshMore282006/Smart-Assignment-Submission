import jwt
import re
from datetime import datetime, timezone, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from extensions import db
from models import User

def generate_token(user: User) -> str:
    """Generates a signed JWT token containing safe claims."""
    expiration_hours = current_app.config.get('JWT_EXPIRATION_HOURS', 24)
    now = datetime.now(timezone.utc)
    payload = {
        'sub': user.id,
        'email': user.email,
        'role': user.role,
        'name': user.full_name,
        'iat': now,
        'exp': now + timedelta(hours=expiration_hours)
    }
    secret_key = current_app.config['SECRET_KEY']
    return jwt.encode(payload, secret_key, algorithm='HS256')

def decode_token(token: str) -> dict:
    """Decodes and validates a JWT token."""
    secret_key = current_app.config['SECRET_KEY']
    return jwt.decode(token, secret_key, algorithms=['HS256'])

def token_required(f):
    """
    Decorator that authenticates the client via 'Authorization: Bearer <token>' header.
    Attaches the authenticated User instance to request.current_user.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header:
            return jsonify({'error': 'Authorization header is missing'}), 401

        parts = auth_header.split(' ')
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({'error': 'Invalid Authorization header format. Expected "Bearer <token>"'}), 401

        token = parts[1]
        try:
            payload = decode_token(token)
            user_id = payload.get('sub')
            user = db.session.get(User, user_id)
            if not user:
                return jsonify({'error': 'User associated with this token no longer exists'}), 401
            request.current_user = user
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Session expired. Please log in again.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid or corrupted authentication token'}), 401
        except Exception as e:
            return jsonify({'error': f'Authentication failed: {str(e)}'}), 401

        return f(*args, **kwargs)
    return decorated

def role_required(*allowed_roles):
    """Decorator ensuring request.current_user has one of the allowed roles."""
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated(*args, **kwargs):
            user = getattr(request, 'current_user', None)
            if not user or user.role not in allowed_roles:
                return jsonify({
                    'error': f'Forbidden: Action requires one of the following roles: {", ".join(allowed_roles)}'
                }), 403
            return f(*args, **kwargs)
        return decorated
    return decorator

def validate_email_format(email: str) -> bool:
    """Validates email format using standard regex."""
    if not email:
        return False
    pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return bool(re.match(pattern, email.strip()))
