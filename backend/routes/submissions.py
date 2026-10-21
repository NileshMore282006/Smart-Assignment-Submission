import os
from datetime import datetime
from flask import Blueprint, request, jsonify
from extensions import db
from models import Submission, Assignment, SimilarityReport
from services.auth_service import token_required, role_required

submissions_bp = Blueprint('submissions', __name__)

@submissions_bp.route('', methods=['GET'])
@token_required
def get_submissions():
    """
    List submissions with strict role-based access control.
    Students: can only see their own submissions.
    Teachers: can only see submissions for assignments they teach.
    """
    current_user = request.current_user
    assignment_id = request.args.get('assignment_id', type=int)
    review_status = request.args.get('review_status')
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('page_size', 10, type=int)

    query = Submission.query

    if current_user.role == 'student':
        # Scoped strictly to student's own submissions
        query = query.filter_by(student_id=current_user.id)
    else:
        # Teacher view: only submissions for assignments owned by current teacher
        query = query.join(Assignment).filter(Assignment.teacher_id == current_user.id)

    if assignment_id:
        query = query.filter(Submission.assignment_id == assignment_id)
    if review_status and review_status != 'all':
        query = query.filter(Submission.review_status == review_status)

    query = query.order_by(Submission.submitted_at.desc())

    total = query.count()
    paginated = query.offset((page - 1) * page_size).limit(page_size).all()

    return jsonify({
        'total': total,
        'page': page,
        'page_size': page_size,
        'submissions': [s.to_dict() for s in paginated]
    }), 200


@submissions_bp.route('/<int:submission_id>', methods=['GET'])
@token_required
def get_submission_by_id(submission_id):
    """
    Fetch a single submission.
    Enforces privacy: prevents students from reading peers' submissions.
    """
    submission = db.session.get(Submission, submission_id)
    if not submission:
        return jsonify({'error': f'Submission #{submission_id} not found'}), 404

    current_user = request.current_user

    # Access control
    if current_user.role == 'student' and submission.student_id != current_user.id:
        return jsonify({'error': 'Forbidden: You cannot access submissions from other students'}), 403

    if current_user.role == 'teacher' and submission.assignment.teacher_id != current_user.id:
        return jsonify({'error': 'Forbidden: You cannot view submissions for courses you do not teach'}), 403

    return jsonify({'submission': submission.to_dict()}), 200


@submissions_bp.route('/<int:submission_id>/review', methods=['PUT'])
@role_required('teacher')
def review_submission(submission_id):
    """
    Allows the assignment instructor to update review disposition and notes.
    """
    submission = db.session.get(Submission, submission_id)
    if not submission:
        return jsonify({'error': f'Submission #{submission_id} not found'}), 404

    current_user = request.current_user
    if submission.assignment.teacher_id != current_user.id:
        return jsonify({'error': 'Forbidden: You can only review submissions for your own assignments'}), 403

    data = request.get_json() or {}
    new_status = data.get('review_status')
    notes = data.get('teacher_notes')

    if new_status and new_status in ['pending_review', 'reviewed', 'needs_further_review']:
        submission.review_status = new_status
    if notes is not None:
        submission.teacher_notes = notes

    try:
        db.session.commit()
        return jsonify({
            'message': 'Review status updated successfully',
            'submission': submission.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update review: {str(e)}'}), 500


@submissions_bp.route('/assignments/<int:assignment_id>/submit', methods=['POST'])
@role_required('student')
def submit_assignment(assignment_id):
    """
    Coursework submission handler.
    Creates the database record while explicitly noting that physical AWS S3 uploads 
    and Textract text extractions are scheduled for the Phase 4 Cloud Integration.
    """
    current_user = request.current_user
    assignment = db.session.get(Assignment, assignment_id)
    if not assignment:
        return jsonify({'error': f'Assignment #{assignment_id} not found'}), 404

    if assignment.status != 'published':
        return jsonify({'error': 'This assignment is not currently open for submissions'}), 400

    # Read payload (supports JSON metadata or simulated form data)
    data = request.get_json() if request.is_json else request.form
    filename = data.get('filename') or 'Submitted_Document.pdf'
    file_size = int(data.get('file_size_bytes', 1024 * 1024 * 2)) # Default ~2MB

    # Extension validation
    ext = filename.rsplit('.', 1)[-1].upper() if '.' in filename else ''
    allowed_exts = [e.strip().upper() for e in assignment.allowed_file_types.split(',')]
    if ext not in allowed_exts:
        return jsonify({
            'error': f'File extension ".{ext}" is not permitted. Allowed: {", ".join(allowed_exts)}'
        }), 400

    # Size validation
    max_bytes = assignment.max_file_size_mb * 1024 * 1024
    if file_size > max_bytes:
        return jsonify({
            'error': f'File size exceeds the limit of {assignment.max_file_size_mb} MB'
        }), 400

    try:
        new_submission = Submission(
            assignment_id=assignment.id,
            student_id=current_user.id,
            original_filename=filename,
            file_size_bytes=file_size,
            storage_provider='local_placeholder', # AWS S3 integration placeholder
            storage_key=f"submissions/{assignment.id}/{current_user.id}/{filename}",
            status='submitted',
            review_status='pending_review',
        )
        db.session.add(new_submission)
        db.session.commit()

        return jsonify({
            'message': 'Submission record created successfully.',
            'notice': 'AWS S3 storage and Textract OCR pipeline integration is scheduled for Phase 4.',
            'submission': new_submission.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Submission failed: {str(e)}'}), 500
