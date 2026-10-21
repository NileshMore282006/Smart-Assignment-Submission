from datetime import datetime, timedelta, timezone

def test_student_cannot_create_assignment(client, student_auth_headers):
    """Role-based check: Ensure student cannot create assignments (403 Forbidden)."""
    payload = {
        'title': 'Unauthorized Assignment',
        'subject': 'Cloud Computing',
        'description': 'Student attempt to post coursework',
        'due_date': (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    }
    response = client.post('/api/assignments', json=payload, headers=student_auth_headers)
    assert response.status_code == 403
    assert 'Forbidden' in response.get_json()['error']

def test_teacher_can_create_assignment(client, teacher_auth_headers, teacher_user):
    """Ensure teacher can create assignments with 201 Created and server-side attribution."""
    due = (datetime.now(timezone.utc) + timedelta(days=14)).isoformat()
    payload = {
        'title': 'Advanced Cloud Architecture',
        'subject': 'Cloud Computing',
        'course_code': 'CS-601',
        'description': 'Implement high-availability multi-region cloud cluster.',
        'instructions': 'Format with IEEE rubric.',
        'due_date': due,
        'max_marks': 100,
        'allowed_file_types': ['PDF', 'DOCX'],
        'max_file_size_mb': 15,
        'status': 'published'
    }
    response = client.post('/api/assignments', json=payload, headers=teacher_auth_headers)
    assert response.status_code == 201
    data = response.get_json()
    assert data['assignment']['title'] == 'Advanced Cloud Architecture'
    # Server-side attribution
    assert data['assignment']['teacher_id'] == teacher_user.id

def test_invalid_assignment_input_rejected(client, teacher_auth_headers):
    """Ensure missing required fields like title or due_date return 400 Bad Request."""
    payload = {
        'subject': 'Cloud Computing',
        # Missing title & due_date
        'description': 'Description without title'
    }
    response = client.post('/api/assignments', json=payload, headers=teacher_auth_headers)
    assert response.status_code == 400
    assert 'error' in response.get_json()

def test_student_sees_published_assignments_only(client, teacher_auth_headers, student_auth_headers):
    """Ensure students only see published assignments and not teacher drafts."""
    # Teacher creates a published assignment
    due = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    client.post('/api/assignments', json={
        'title': 'Published Assignment',
        'subject': 'Cloud',
        'description': 'Public problem set',
        'due_date': due,
        'status': 'published'
    }, headers=teacher_auth_headers)

    # Teacher creates a draft assignment
    client.post('/api/assignments', json={
        'title': 'Secret Draft Assignment',
        'subject': 'Cloud',
        'description': 'Draft in progress',
        'due_date': due,
        'status': 'draft'
    }, headers=teacher_auth_headers)

    # Student lists assignments
    response = client.get('/api/assignments', headers=student_auth_headers)
    assert response.status_code == 200
    assignments = response.get_json()['assignments']
    titles = [a['title'] for a in assignments]
    assert 'Published Assignment' in titles
    assert 'Secret Draft Assignment' not in titles

def test_teacher_cannot_modify_other_teacher_assignment(client, teacher_auth_headers, second_teacher_headers):
    """Security check: Teacher B cannot update or tamper with Teacher A's assignments."""
    due = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    create_resp = client.post('/api/assignments', json={
        'title': 'Teacher A Assignment',
        'subject': 'Operating Systems',
        'description': 'Original description',
        'due_date': due,
        'status': 'published'
    }, headers=teacher_auth_headers)
    asg_id = create_resp.get_json()['assignment']['id']

    # Teacher B tries to modify it
    tamper_resp = client.put(f'/api/assignments/{asg_id}', json={
        'title': 'Hacked Title'
    }, headers=second_teacher_headers)
    assert tamper_resp.status_code == 403
    assert 'Forbidden' in tamper_resp.get_json()['error']

def test_teacher_can_modify_own_assignment(client, teacher_auth_headers):
    """Ensure teacher can modify their own assignment."""
    due = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    create_resp = client.post('/api/assignments', json={
        'title': 'Original Title',
        'subject': 'Networks',
        'description': 'Initial text',
        'due_date': due,
        'status': 'published'
    }, headers=teacher_auth_headers)
    asg_id = create_resp.get_json()['assignment']['id']

    update_resp = client.put(f'/api/assignments/{asg_id}', json={
        'title': 'Updated Assignment Title',
        'max_marks': 80
    }, headers=teacher_auth_headers)
    assert update_resp.status_code == 200
    assert update_resp.get_json()['assignment']['title'] == 'Updated Assignment Title'
    assert update_resp.get_json()['assignment']['max_marks'] == 80

def test_teacher_cannot_delete_other_teacher_assignment(client, teacher_auth_headers, second_teacher_headers):
    """Ensure Teacher B cannot delete Teacher A's assignment."""
    due = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    create_resp = client.post('/api/assignments', json={
        'title': 'Assignment to Delete',
        'subject': 'Database',
        'description': 'Initial text',
        'due_date': due,
        'status': 'published'
    }, headers=teacher_auth_headers)
    asg_id = create_resp.get_json()['assignment']['id']

    # Attempt delete by other teacher
    del_resp = client.delete(f'/api/assignments/{asg_id}', headers=second_teacher_headers)
    assert del_resp.status_code == 403
