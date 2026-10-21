from datetime import datetime, timedelta, timezone
from models import User, Assignment, Submission
from extensions import db
from services.auth_service import generate_token

def test_student_cannot_access_other_student_submission(client, app, teacher_auth_headers, student_user, student_auth_headers):
    """Privacy check: Ensure Student B cannot read Student A's submission."""
    # 1. Create assignment
    due = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    asg_resp = client.post('/api/assignments', json={
        'title': 'Operating Systems Assignment',
        'subject': 'OS',
        'description': 'Memory management',
        'due_date': due,
        'status': 'published'
    }, headers=teacher_auth_headers)
    asg_id = asg_resp.get_json()['assignment']['id']

    # 2. Student A submits
    sub_resp = client.post(f'/api/submissions/assignments/{asg_id}/submit', json={
        'filename': 'Student_A_Solution.pdf',
        'file_size_bytes': 1024 * 500
    }, headers=student_auth_headers)
    assert sub_resp.status_code == 201
    sub_id = sub_resp.get_json()['submission']['id']

    # 3. Create Student B
    with app.app_context():
        student_b = User(
            full_name='Student B',
            email='student.b@university.edu',
            role='student',
            student_id='CS-002'
        )
        student_b.set_password('Pass123!')
        db.session.add(student_b)
        db.session.commit()
        token_b = generate_token(student_b)
        headers_b = {'Authorization': f'Bearer {token_b}'}

    # 4. Student B attempts to access Student A's submission
    peek_resp = client.get(f'/api/submissions/{sub_id}', headers=headers_b)
    assert peek_resp.status_code == 403
    assert 'Forbidden' in peek_resp.get_json()['error']

def test_student_can_view_own_submission(client, teacher_auth_headers, student_auth_headers):
    """Ensure student can view their own submission."""
    due = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    asg_resp = client.post('/api/assignments', json={
        'title': 'Networks Assignment',
        'subject': 'Networks',
        'description': 'TCP vs UDP',
        'due_date': due,
        'status': 'published'
    }, headers=teacher_auth_headers)
    asg_id = asg_resp.get_json()['assignment']['id']

    sub_resp = client.post(f'/api/submissions/assignments/{asg_id}/submit', json={
        'filename': 'Networks_Paper.pdf',
        'file_size_bytes': 1024 * 400
    }, headers=student_auth_headers)
    sub_id = sub_resp.get_json()['submission']['id']

    get_resp = client.get(f'/api/submissions/{sub_id}', headers=student_auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.get_json()['submission']['original_filename'] == 'Networks_Paper.pdf'

def test_submission_rejects_disallowed_extension(client, teacher_auth_headers, student_auth_headers):
    """Ensure submission with prohibited extension is rejected with 400 Bad Request."""
    due = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    asg_resp = client.post('/api/assignments', json={
        'title': 'Format Restricted Assignment',
        'subject': 'Database',
        'description': 'Only PDF permitted',
        'due_date': due,
        'allowed_file_types': ['PDF'],
        'status': 'published'
    }, headers=teacher_auth_headers)
    asg_id = asg_resp.get_json()['assignment']['id']

    # Submit an EXE or ZIP file
    sub_resp = client.post(f'/api/submissions/assignments/{asg_id}/submit', json={
        'filename': 'malicious_script.exe',
        'file_size_bytes': 1024 * 50
    }, headers=student_auth_headers)
    assert sub_resp.status_code == 400
    assert 'not permitted' in sub_resp.get_json()['error']
