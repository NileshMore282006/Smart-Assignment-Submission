import sys
from pathlib import Path
import pytest

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app import create_app
from extensions import db
from models import User, Assignment, Submission
from services.auth_service import generate_token

@pytest.fixture
def app():
    """Create and configure a clean testing application with in-memory SQLite."""
    test_app = create_app('testing')
    
    with test_app.app_context():
        db.create_all()
        yield test_app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """A test client for dispatching HTTP requests."""
    return app.test_client()

@pytest.fixture
def student_user(app):
    """Creates a sample student in the test database."""
    user = User(
        full_name='Test Student',
        email='student.test@university.edu',
        role='student',
        student_id='CS-TEST-001',
        department='Computer Science'
    )
    user.set_password('Password123!')
    db.session.add(user)
    db.session.commit()
    return user

@pytest.fixture
def student_auth_headers(app, student_user):
    """Generates valid Bearer authentication headers for student."""
    token = generate_token(student_user)
    return {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

@pytest.fixture
def teacher_user(app):
    """Creates a sample teacher in the test database."""
    user = User(
        full_name='Dr. Test Professor',
        email='teacher.test@university.edu',
        role='teacher',
        department='Computer Science'
    )
    user.set_password('TeacherPass123!')
    db.session.add(user)
    db.session.commit()
    return user

@pytest.fixture
def teacher_auth_headers(app, teacher_user):
    """Generates valid Bearer authentication headers for teacher."""
    token = generate_token(teacher_user)
    return {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

@pytest.fixture
def second_teacher_user(app):
    """Creates a second teacher to test ownership isolation."""
    user = User(
        full_name='Dr. Second Teacher',
        email='second.teacher@university.edu',
        role='teacher',
        department='Information Systems'
    )
    user.set_password('SecondPass123!')
    db.session.add(user)
    db.session.commit()
    return user

@pytest.fixture
def second_teacher_headers(app, second_teacher_user):
    token = generate_token(second_teacher_user)
    return {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
