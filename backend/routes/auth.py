from flask import Blueprint, request, jsonify
from extensions import db
from models import User
from services.auth_service import (
    generate_token, 
    token_required, 
    validate_email_format
)

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Public student registration endpoint.
    Strictly forbids public self-registration as teacher!
    """
    data = request.get_json() or {}
    
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    student_id = data.get('student_id', '').strip()
    requested_role = data.get('role', 'student').strip().lower()

    # Validation
    if not full_name:
        return jsonify({'error': 'Full name is required'}), 400
    if not email:
        return jsonify({'error': 'Email address is required'}), 400
    if not validate_email_format(email):
        return jsonify({'error': 'Invalid email format'}), 400
    if not password or len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long'}), 400

    # Role Security Guard: Block teacher self-registration
    if requested_role == 'teacher':
        return jsonify({
            'error': 'Forbidden: Public registration is restricted to students. Teacher accounts must be provisioned through administrative seeding.'
        }), 403

    # Check for existing email
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'An account with this email address already exists'}), 409

    try:
        new_user = User(
            full_name=full_name,
            email=email,
            role='student', # Enforced
            student_id=student_id or None,
            department=data.get('department', 'Computer Science & Engineering'),
        )
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        token = generate_token(new_user)
        return jsonify({
            'message': 'Student registration successful',
            'user': new_user.to_dict(),
            'token': token
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticates students and teachers, returning safe user profile and JWT.
    """
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    expected_role = data.get('role')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    # Optional role verification for client clarity
    if expected_role and user.role != expected_role.lower():
        return jsonify({
            'error': f'This account is registered as a {user.role}. Please log in via the {user.role} portal.'
        }), 403

    token = generate_token(user)
    return jsonify({
        'message': f'Welcome back, {user.full_name}',
        'user': user.to_dict(),
        'token': token
    }), 200


@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logs out user and invalidates client session state."""
    return jsonify({'message': 'Logged out successfully'}), 200


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user():
    """Returns safe authenticated user profile from verified token."""
    return jsonify({
        'user': request.current_user.to_dict()
    }), 200


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Accepts email and confirms simulated recovery dispatch without leaking user existence."""
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()

    if not email or not validate_email_format(email):
        return jsonify({'error': 'A valid email address is required'}), 400

    return jsonify({
        'message': f'If {email} is registered with the university, password recovery instructions have been dispatched.'
    }), 200
