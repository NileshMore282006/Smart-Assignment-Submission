from datetime import datetime
from flask import Blueprint, request, jsonify
from extensions import db
from models import Assignment, Submission
from services.auth_service import token_required, role_required

assignments_bp = Blueprint('assignments', __name__)

@assignments_bp.route('', methods=['GET'])
@token_required
def get_assignments():
    """
    List assignments with search, filtering, and role-based scoping.
    Students see only 'published' assignments.
    Teachers see published assignments, plus their own drafts and archives.
    """
    current_user = request.current_user
    subject_filter = request.args.get('subject')
    status_filter = request.args.get('status')
    search_query = request.args.get('search', '').strip()
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('page_size', 10, type=int)
    sort_by = request.args.get('sort_by', 'due_date_asc')

    query = Assignment.query

    # Role Scoping
    if current_user.role == 'student':
        query = query.filter_by(status='published')
    else:
        # Teacher view: if teacher specifies their own assignments
        only_mine = request.args.get('only_mine', 'false').lower() == 'true'
        if only_mine:
            query = query.filter_by(teacher_id=current_user.id)
        if status_filter and status_filter != 'all':
            query = query.filter_by(status=status_filter)

    # Subject Filter
    if subject_filter and subject_filter != 'all':
        query = query.filter_by(subject=subject_filter)

    # Search Filter
    if search_query:
        search_term = f"%{search_query}%"
        query = query.filter(
            (Assignment.title.ilike(search_term)) |
            (Assignment.subject.ilike(search_term)) |
            (Assignment.description.ilike(search_term)) |
            (Assignment.course_code.ilike(search_term))
        )

    # Sorting
    if sort_by == 'due_date_desc':
        query = query.order_by(Assignment.due_date.desc())
    elif sort_by == 'title':
        query = query.order_by(Assignment.title.asc())
    elif sort_by == 'created_at_desc':
        query = query.order_by(Assignment.created_at.desc())
    else:
        query = query.order_by(Assignment.due_date.asc())

    # Pagination
    total = query.count()
    paginated = query.offset((page - 1) * page_size).limit(page_size).all()

    return jsonify({
        'total': total,
        'page': page,
        'page_size': page_size,
        'total_pages': max(1, (total + page_size - 1) // page_size),
        'assignments': [a.to_dict(include_submission_count=True) for a in paginated]
    }), 200


@assignments_bp.route('/<int:assignment_id>', methods=['GET'])
@token_required
def get_assignment_by_id(assignment_id):
    """Fetches details for a single assignment."""
    assignment = db.session.get(Assignment, assignment_id)
    if not assignment:
        return jsonify({'error': f'Assignment #{assignment_id} not found'}), 404

    current_user = request.current_user
    # Visibility rule: Students cannot view unpublished drafts of other teachers
    if current_user.role == 'student' and assignment.status != 'published':
        return jsonify({'error': 'Forbidden: This assignment is not yet published'}), 403

    return jsonify({
        'assignment': assignment.to_dict(include_submission_count=True)
    }), 200


@assignments_bp.route('', methods=['POST'])
@role_required('teacher')
def create_assignment():
    """
    Creates a new assignment.
    Guarded for teachers only. Derives teacher identity from verified session token.
    """
    current_user = request.current_user
    data = request.get_json() or {}

    title = data.get('title', '').strip()
    subject = data.get('subject', '').strip()
    course_code = data.get('course_code', 'CS-101').strip()
    description = data.get('description', '').strip()
    instructions = data.get('instructions', '').strip()
    due_date_raw = data.get('due_date')
    max_marks = data.get('max_marks', 100)
    allowed_file_types = data.get('allowed_file_types', 'PDF,DOCX,TXT')
    max_file_size_mb = data.get('max_file_size_mb', 10)
    status = data.get('status', 'published')

    # Validation
    if not title:
        return jsonify({'error': 'Assignment title is required'}), 400
    if not subject:
        return jsonify({'error': 'Subject is required'}), 400
    if not description:
        return jsonify({'error': 'Description is required'}), 400
    if not due_date_raw:
        return jsonify({'error': 'Due date is required'}), 400

    try:
        # Handle ISO strings like 2026-10-31T23:59:00Z or date strings
        due_date_str = due_date_raw.replace('Z', '+00:00')
        due_date = datetime.fromisoformat(due_date_str)
    except ValueError:
        return jsonify({'error': 'Invalid due date format. Expected ISO 8601 string'}), 400

    if isinstance(allowed_file_types, list):
        allowed_file_types = ','.join(allowed_file_types)

    try:
        new_assignment = Assignment(
            title=title,
            subject=subject,
            course_code=course_code,
            description=description,
            instructions=instructions or description,
            teacher_id=current_user.id, # Safe server-side attribution
            due_date=due_date,
            max_marks=int(max_marks) if max_marks else 100,
            allowed_file_types=allowed_file_types,
            max_file_size_mb=int(max_file_size_mb) if max_file_size_mb else 10,
            status=status if status in ['draft', 'published', 'archived'] else 'published'
        )
        db.session.add(new_assignment)
        db.session.commit()

        return jsonify({
            'message': 'Assignment created successfully',
            'assignment': new_assignment.to_dict(include_submission_count=True)
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create assignment: {str(e)}'}), 500


@assignments_bp.route('/<int:assignment_id>', methods=['PUT'])
@role_required('teacher')
def update_assignment(assignment_id):
    """
    Updates an assignment.
    Validates teacher ownership: only the creator may modify their assignment.
    """
    assignment = db.session.get(Assignment, assignment_id)
    if not assignment:
        return jsonify({'error': f'Assignment #{assignment_id} not found'}), 404

    current_user = request.current_user
    # Strict Ownership Check
    if assignment.teacher_id != current_user.id:
        return jsonify({'error': 'Forbidden: You can only modify assignments created by you.'}), 403

    data = request.get_json() or {}

    if 'title' in data:
        assignment.title = data['title'].strip()
    if 'subject' in data:
        assignment.subject = data['subject'].strip()
    if 'course_code' in data:
        assignment.course_code = data['course_code'].strip()
    if 'description' in data:
        assignment.description = data['description'].strip()
    if 'instructions' in data:
        assignment.instructions = data['instructions'].strip()
    if 'max_marks' in data:
        assignment.max_marks = int(data['max_marks'])
    if 'max_file_size_mb' in data:
        assignment.max_file_size_mb = int(data['max_file_size_mb'])
    if 'status' in data and data['status'] in ['draft', 'published', 'archived']:
        assignment.status = data['status']
    if 'allowed_file_types' in data:
        types = data['allowed_file_types']
        assignment.allowed_file_types = ','.join(types) if isinstance(types, list) else str(types)
    if 'due_date' in data and data['due_date']:
        try:
            assignment.due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid due date format'}), 400

    try:
        db.session.commit()
        return jsonify({
            'message': 'Assignment updated successfully',
            'assignment': assignment.to_dict(include_submission_count=True)
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update assignment: {str(e)}'}), 500


@assignments_bp.route('/<int:assignment_id>', methods=['DELETE'])
@role_required('teacher')
def delete_assignment(assignment_id):
    """
    Deletes an assignment.
    Validates teacher ownership.
    """
    assignment = db.session.get(Assignment, assignment_id)
    if not assignment:
        return jsonify({'error': f'Assignment #{assignment_id} not found'}), 404

    current_user = request.current_user
    if assignment.teacher_id != current_user.id:
        return jsonify({'error': 'Forbidden: You can only delete your own assignments.'}), 403

    try:
        db.session.delete(assignment)
        db.session.commit()
        return jsonify({'message': f'Assignment #{assignment_id} successfully deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete assignment: {str(e)}'}), 500


@assignments_bp.route('/<int:assignment_id>/duplicate', methods=['POST'])
@role_required('teacher')
def duplicate_assignment(assignment_id):
    """Duplicates an assignment as a draft."""
    original = db.session.get(Assignment, assignment_id)
    if not original:
        return jsonify({'error': 'Assignment not found'}), 404

    current_user = request.current_user
    duplicate = Assignment(
        title=f"{original.title} (Copy)",
        subject=original.subject,
        course_code=original.course_code,
        description=original.description,
        instructions=original.instructions,
        teacher_id=current_user.id,
        due_date=original.due_date,
        max_marks=original.max_marks,
        allowed_file_types=original.allowed_file_types,
        max_file_size_mb=original.max_file_size_mb,
        status='draft',
    )
    db.session.add(duplicate)
    db.session.commit()

    return jsonify({
        'message': 'Assignment duplicated as draft',
        'assignment': duplicate.to_dict(include_submission_count=True)
    }), 201
