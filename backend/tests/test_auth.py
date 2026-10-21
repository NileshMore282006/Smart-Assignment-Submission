import json

def test_health_endpoint(client):
    """Ensure API health check endpoint returns 200 and healthy status."""
    response = client.get('/api/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'healthy'
    assert 'service' in data

def test_student_registration_success(client):
    """Ensure a student can register with valid parameters."""
    payload = {
        'full_name': 'New Student',
        'email': 'new.student@university.edu',
        'password': 'SecurePassword123!',
        'student_id': 'CS-2026-9999',
        'department': 'Computer Science'
    }
    response = client.post('/api/auth/register', json=payload)
    assert response.status_code == 201
    data = response.get_json()
    assert 'token' in data
    assert data['user']['role'] == 'student'
    assert data['user']['email'] == 'new.student@university.edu'
    # Never return password hash!
    assert 'password_hash' not in data['user']

def test_registration_rejects_duplicate_email(client, student_user):
    """Ensure duplicate email registration is rejected with 409 Conflict."""
    payload = {
        'full_name': 'Imposter Student',
        'email': student_user.email,
        'password': 'Password123!'
    }
    response = client.post('/api/auth/register', json=payload)
    assert response.status_code == 409
    data = response.get_json()
    assert 'error' in data

def test_registration_rejects_teacher_role(client):
    """Security check: Ensure public registration cannot self-grant 'teacher' role."""
    payload = {
        'full_name': 'Self-Appointed Professor',
        'email': 'fake.teacher@university.edu',
        'password': 'Password123!',
        'role': 'teacher'
    }
    response = client.post('/api/auth/register', json=payload)
    assert response.status_code == 403
    data = response.get_json()
    assert 'Forbidden' in data['error']

def test_registration_rejects_invalid_email(client):
    """Ensure malformed email is rejected with 400 Bad Request."""
    payload = {
        'full_name': 'Bad Email Student',
        'email': 'invalid-email-format',
        'password': 'Password123!'
    }
    response = client.post('/api/auth/register', json=payload)
    assert response.status_code == 400

def test_registration_rejects_short_password(client):
    """Ensure passwords under 6 characters are rejected with 400."""
    payload = {
        'full_name': 'Short Pass Student',
        'email': 'short.pass@university.edu',
        'password': '123'
    }
    response = client.post('/api/auth/register', json=payload)
    assert response.status_code == 400

def test_login_success(client, student_user):
    """Ensure registered user can log in with valid credentials."""
    payload = {
        'email': student_user.email,
        'password': 'Password123!'
    }
    response = client.post('/api/auth/login', json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert 'token' in data
    assert data['user']['email'] == student_user.email

def test_login_invalid_password(client, student_user):
    """Ensure incorrect password returns 401 Unauthorized."""
    payload = {
        'email': student_user.email,
        'password': 'WrongPassword!'
    }
    response = client.post('/api/auth/login', json=payload)
    assert response.status_code == 401
    assert 'error' in response.get_json()

def test_login_nonexistent_email(client):
    """Ensure nonexistent email returns 401 Unauthorized."""
    payload = {
        'email': 'does.not.exist@university.edu',
        'password': 'Password123!'
    }
    response = client.post('/api/auth/login', json=payload)
    assert response.status_code == 401

def test_get_me_authenticated(client, student_auth_headers, student_user):
    """Ensure /api/auth/me returns the authenticated user."""
    response = client.get('/api/auth/me', headers=student_auth_headers)
    assert response.status_code == 200
    data = response.get_json()
    assert data['user']['email'] == student_user.email

def test_unauthenticated_request_rejected(client):
    """Ensure protected routes return 401 when Authorization header is absent."""
    response = client.get('/api/auth/me')
    assert response.status_code == 401
    assert 'error' in response.get_json()

def test_logout(client):
    """Ensure logout endpoint returns 200."""
    response = client.post('/api/auth/logout')
    assert response.status_code == 200
