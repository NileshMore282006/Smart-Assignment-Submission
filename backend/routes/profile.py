from flask import Blueprint, request, jsonify
from extensions import db
from models import Assignment, Submission, SimilarityReport
from services.auth_service import token_required

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('', methods=['GET'])
@token_required
def get_profile():
    """
    Returns current user's profile enriched with role-specific academic statistics.
    """
    current_user = request.current_user
    user_data = current_user.to_dict()

    if current_user.role == 'student':
        total_published = Assignment.query.filter_by(status='published').count()
        student_submissions = Submission.query.filter_by(student_id=current_user.id).all()
        submitted_count = len(student_submissions)
        pending_count = max(0, total_published - submitted_count)

        scores = [
            s.similarity_report.overall_similarity_score 
            for s in student_submissions 
            if s.similarity_report and s.similarity_report.overall_similarity_score is not None
        ]
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0

        user_data['stats'] = {
            'total_assignments': total_published,
            'submitted_count': submitted_count,
            'pending_count': pending_count,
            'average_similarity_score': avg_score
        }
    else:
        # Teacher Stats
        teacher_assignments = Assignment.query.filter_by(teacher_id=current_user.id).all()
        asg_ids = [a.id for a in teacher_assignments]
        total_asgs = len(teacher_assignments)
        
        teacher_submissions = Submission.query.filter(Submission.assignment_id.in_(asg_ids)).all() if asg_ids else []
        total_subs = len(teacher_submissions)
        pending_review = sum(1 for s in teacher_submissions if s.review_status != 'reviewed')
        
        high_sim_count = sum(
            1 for s in teacher_submissions 
            if s.similarity_report and (s.similarity_report.overall_similarity_score or 0) >= 36
        )

        user_data['stats'] = {
            'total_assignments': total_asgs,
            'total_submissions': total_subs,
            'pending_review': pending_review,
            'high_similarity_cases': high_sim_count
        }

    return jsonify({'profile': user_data}), 200


@profile_bp.route('', methods=['PUT'])
@token_required
def update_profile():
    """
    Allows user to update editable profile fields (display name, bio).
    Role and email are immutable.
    """
    current_user = request.current_user
    data = request.get_json() or {}

    if 'full_name' in data and data['full_name'].strip():
        current_user.full_name = data['full_name'].strip()
    if 'bio' in data:
        current_user.bio = data['bio'].strip()
    if 'student_id' in data and current_user.role == 'student':
        current_user.student_id = data['student_id'].strip()

    try:
        db.session.commit()
        return jsonify({
            'message': 'Profile updated successfully',
            'user': current_user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update profile: {str(e)}'}), 500


@profile_bp.route('/password', methods=['PUT'])
@token_required
def change_password():
    """Changes password after verifying existing password."""
    current_user = request.current_user
    data = request.get_json() or {}

    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')

    if not current_password or not new_password:
        return jsonify({'error': 'Current password and new password are required'}), 400

    if not current_user.check_password(current_password):
        return jsonify({'error': 'Incorrect current password'}), 401

    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters'}), 400

    try:
        current_user.set_password(new_password)
        db.session.commit()
        return jsonify({'message': 'Password updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update password: {str(e)}'}), 500
