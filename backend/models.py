import json
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db

def utc_now():
    return datetime.now(timezone.utc)

class User(db.Model):
    """User account model supporting 'student' and 'teacher' roles."""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, index=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student') # 'student' or 'teacher'
    student_id = db.Column(db.String(50), nullable=True)
    department = db.Column(db.String(120), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=utc_now, nullable=False)
    updated_at = db.Column(db.DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    assignments = db.relationship('Assignment', backref='teacher', lazy='dynamic', cascade='all, delete-orphan')
    submissions = db.relationship('Submission', backref='student', lazy='dynamic', cascade='all, delete-orphan')

    def set_password(self, password: str):
        """Hashes password with secure salt using Werkzeug."""
        if not password or len(password) < 6:
            raise ValueError("Password must be at least 6 characters.")
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Verifies password against stored hash."""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        """Safe public representation of user; never reveals password hash."""
        return {
            'id': self.id,
            'full_name': self.full_name,
            'email': self.email,
            'role': self.role,
            'student_id': self.student_id,
            'department': self.department,
            'bio': self.bio,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f'<User {self.email} ({self.role})>'


class Assignment(db.Model):
    """Assignment model created by faculty and viewable/submittable by students."""
    __tablename__ = 'assignments'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False, index=True)
    subject = db.Column(db.String(100), nullable=False, index=True)
    course_code = db.Column(db.String(50), nullable=False, default='CS-101')
    description = db.Column(db.Text, nullable=False)
    instructions = db.Column(db.Text, nullable=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    due_date = db.Column(db.DateTime, nullable=False)
    max_marks = db.Column(db.Integer, default=100)
    allowed_file_types = db.Column(db.String(100), default='PDF,DOCX,TXT,PNG,JPG')
    max_file_size_mb = db.Column(db.Integer, default=10)
    status = db.Column(db.String(20), default='published', index=True) # 'draft', 'published', 'archived'
    created_at = db.Column(db.DateTime, default=utc_now, nullable=False)
    updated_at = db.Column(db.DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    submissions = db.relationship('Submission', backref='assignment', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_submission_count=False):
        data = {
            'id': self.id,
            'title': self.title,
            'subject': self.subject,
            'course_code': self.course_code,
            'description': self.description,
            'instructions': self.instructions or self.description,
            'teacher_id': self.teacher_id,
            'teacher_name': self.teacher.full_name if self.teacher else 'Faculty',
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'max_marks': self.max_marks,
            'allowed_file_types': [ext.strip().upper() for ext in self.allowed_file_types.split(',') if ext.strip()],
            'max_file_size_mb': self.max_file_size_mb,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_submission_count:
            data['submission_count'] = self.submissions.count()
        return data

    def __repr__(self):
        return f'<Assignment {self.id}: {self.title}>'


class Submission(db.Model):
    """Student coursework submission record with OCR and storage metadata."""
    __tablename__ = 'submissions'

    id = db.Column(db.Integer, primary_key=True)
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignments.id', ondelete='CASCADE'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_size_bytes = db.Column(db.Integer, nullable=False)
    storage_provider = db.Column(db.String(50), default='local_placeholder')
    storage_key = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(30), default='submitted', index=True)
    review_status = db.Column(db.String(30), default='pending_review', index=True)
    teacher_notes = db.Column(db.Text, nullable=True)
    submitted_at = db.Column(db.DateTime, default=utc_now, nullable=False)
    extracted_text = db.Column(db.Text, nullable=True)
    processing_error = db.Column(db.Text, nullable=True)

    # Relationships
    similarity_report = db.relationship('SimilarityReport', backref='submission', uselist=False, cascade='all, delete-orphan')

    def to_dict(self):
        report = self.similarity_report
        return {
            'id': self.id,
            'assignment_id': self.assignment_id,
            'assignment_title': self.assignment.title if self.assignment else None,
            'subject': self.assignment.subject if self.assignment else None,
            'student_id': self.student_id,
            'student_name': self.student.full_name if self.student else None,
            'student_number': self.student.student_id if self.student else None,
            'original_filename': self.original_filename,
            'file_size_bytes': self.file_size_bytes,
            'file_size_display': f"{(self.file_size_bytes / (1024 * 1024)):.2f} MB" if self.file_size_bytes >= 1024*1024 else f"{(self.file_size_bytes / 1024):.1f} KB",
            'storage_provider': self.storage_provider,
            'storage_key': self.storage_key,
            'status': self.status,
            'review_status': self.review_status,
            'teacher_notes': self.teacher_notes,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'has_extracted_text': bool(self.extracted_text),
            'processing_error': self.processing_error,
            'similarity_score': report.overall_similarity_score if report else None,
            'similarity_report_id': report.id if report else None,
        }

    def __repr__(self):
        return f'<Submission {self.id} for Assignment {self.assignment_id}>'


class SimilarityReport(db.Model):
    """Detailed similarity analysis report linked to a student submission."""
    __tablename__ = 'similarity_reports'

    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.Integer, db.ForeignKey('submissions.id', ondelete='CASCADE'), unique=True, nullable=False)
    overall_similarity_score = db.Column(db.Float, nullable=True)
    category = db.Column(db.String(20), nullable=True)
    report_data = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(30), default='completed')
    created_at = db.Column(db.DateTime, default=utc_now, nullable=False)

    def to_dict(self):
        parsed_data = {}
        if self.report_data:
            try:
                parsed_data = json.loads(self.report_data)
            except Exception:
                parsed_data = {'raw': self.report_data}

        sub = self.submission
        return {
            'id': self.id,
            'submission_id': self.submission_id,
            'assignment_id': sub.assignment_id if sub else None,
            'assignment_title': sub.assignment.title if sub and sub.assignment else None,
            'student_id': sub.student_id if sub else None,
            'student_name': sub.student.full_name if sub and sub.student else None,
            'student_number': sub.student.student_id if sub and sub.student else None,
            'overall_similarity_score': self.overall_similarity_score,
            'category': self.category or ('low' if (self.overall_similarity_score or 0) <= 15 else 'moderate' if (self.overall_similarity_score or 0) <= 35 else 'high'),
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'matched_documents': parsed_data.get('matched_documents', []),
            'matching_passages': parsed_data.get('matching_passages', []),
            'textract_metadata': parsed_data.get('textract_metadata', {
                'pages_extracted': 0,
                'words_count': 0,
                'detected_language': 'en',
                'confidence_score': 'N/A'
            }),
            'summary_notes': parsed_data.get('summary_notes', 'Automated similarity report generated for coursework review.'),
        }

    def __repr__(self):
        return f'<SimilarityReport {self.id} (Submission {self.submission_id})>'
