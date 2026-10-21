from flask import Blueprint, request, jsonify
from extensions import db
from models import SimilarityReport, Submission, Assignment
from services.auth_service import token_required

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('', methods=['GET'])
@token_required
def get_reports():
    """
    List similarity reports.
    Scoped by user role: students only see their own reports;
    teachers see reports for their coursework.
    """
    current_user = request.current_user
    submission_id = request.args.get('submission_id', type=int)
    category = request.args.get('category')
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('page_size', 10, type=int)

    query = SimilarityReport.query.join(Submission)

    if current_user.role == 'student':
        query = query.filter(Submission.student_id == current_user.id)
    else:
        query = query.join(Assignment).filter(Assignment.teacher_id == current_user.id)

    if submission_id:
        query = query.filter(SimilarityReport.submission_id == submission_id)
    if category and category != 'all':
        query = query.filter(SimilarityReport.category == category)

    query = query.order_by(SimilarityReport.created_at.desc())

    total = query.count()
    paginated = query.offset((page - 1) * page_size).limit(page_size).all()

    return jsonify({
        'total': total,
        'page': page,
        'page_size': page_size,
        'reports': [r.to_dict() for r in paginated]
    }), 200


@reports_bp.route('/<int:report_id>', methods=['GET'])
@token_required
def get_report_by_id(report_id):
    """
    Fetches full similarity report data.
    Enforces student and teacher authorization.
    """
    report = db.session.get(SimilarityReport, report_id)
    if not report:
        return jsonify({'error': f'Similarity Report #{report_id} not found'}), 404

    current_user = request.current_user
    submission = report.submission

    if current_user.role == 'student' and submission.student_id != current_user.id:
        return jsonify({'error': 'Forbidden: You cannot access other students’ similarity reports'}), 403

    if current_user.role == 'teacher' and submission.assignment.teacher_id != current_user.id:
        return jsonify({'error': 'Forbidden: You cannot view reports for coursework you do not instruct'}), 403

    return jsonify({
        'report': report.to_dict(),
        'notice': 'Similarity indicates matching text, not a confirmed plagiarism finding. All matches require human review.'
    }), 200


@reports_bp.route('/submission/<int:submission_id>', methods=['GET'])
@token_required
def get_report_by_submission(submission_id):
    """Fetches similarity report linked to a specific submission ID."""
    submission = db.session.get(Submission, submission_id)
    if not submission:
        return jsonify({'error': f'Submission #{submission_id} not found'}), 404

    current_user = request.current_user
    if current_user.role == 'student' and submission.student_id != current_user.id:
        return jsonify({'error': 'Forbidden: Access denied'}), 403

    if current_user.role == 'teacher' and submission.assignment.teacher_id != current_user.id:
        return jsonify({'error': 'Forbidden: Access denied'}), 403

    report = submission.similarity_report
    if not report:
        return jsonify({
            'message': 'No similarity report has been generated yet for this submission.',
            'status': 'pending'
        }), 200

    return jsonify({'report': report.to_dict()}), 200
