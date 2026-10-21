import os
from datetime import datetime, timezone
from flask import Flask, jsonify
from config import config_by_name
from extensions import db, cors
from routes import register_routes
from models import User, Assignment, Submission, SimilarityReport

def create_app(config_name=None):
    """Application factory for Smart Assignment Portal Flask API."""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, config_by_name['default']))

    # Initialize extensions
    db.init_app(app)
    
    # Configure CORS restricted to frontend origins
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config.get('CORS_ORIGINS', ['http://localhost:5173'])}},
        supports_credentials=True,
        methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allow_headers=['Content-Type', 'Authorization']
    )

    # Register API blueprints
    register_routes(app)

    # Health Check Endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'Smart Assignment Submission & Similarity Portal API',
            'phase': 'Phase 3 Backend Core',
            'database': 'SQLite',
            'timestamp': datetime.now(timezone.utc).isoformat()
        }), 200

    # Global JSON Error Handlers
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({'error': 'Bad Request', 'message': getattr(e, 'description', str(e))}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({'error': 'Unauthorized', 'message': getattr(e, 'description', 'Authentication required')}), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({'error': 'Forbidden', 'message': getattr(e, 'description', 'Access denied')}), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Not Found', 'message': getattr(e, 'description', 'The requested resource was not found')}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({'error': 'Method Not Allowed', 'message': 'The HTTP method is not supported for this endpoint'}), 405

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'error': 'Internal Server Error', 'message': 'An unexpected server error occurred'}), 500

    # CLI Command: Initialize Database
    @app.cli.command('init-db')
    def init_db_command():
        """Creates all database tables."""
        db.create_all()
        print("Database initialized successfully.")

    # CLI Command: Seed Demo Accounts & Sample Coursework
    @app.cli.command('seed-demo')
    def seed_demo_command():
        """Seeds initial teacher and student accounts safely."""
        seed_database()
        print("Demo accounts and coursework seeded successfully.")

    return app


def seed_database():
    """Populates database with initial demo accounts and assignments."""
    # Teacher Account: Dr. Alan Vance
    teacher = User.query.filter_by(email='teacher@demo.com').first()
    if not teacher:
        teacher = User(
            full_name='Dr. Alan Vance',
            email='teacher@demo.com',
            role='teacher',
            department='Department of Computer Science',
            bio='Professor & Department Chair specializing in High-Performance Distributed Systems.'
        )
        teacher.set_password('Teacher123!')
        db.session.add(teacher)
        db.session.flush()

    # Student Account: Alex Johnson
    student1 = User.query.filter_by(email='student@demo.com').first()
    if not student1:
        student1 = User(
            full_name='Alex Johnson',
            email='student@demo.com',
            role='student',
            student_id='CS-2024-8841',
            department='Computer Science & Engineering',
            bio='Junior undergraduate researching distributed systems and cloud microservices.'
        )
        student1.set_password('Student123!')
        db.session.add(student1)
        db.session.flush()

    # Student Account 2: Priya Sharma
    student2 = User.query.filter_by(email='priya.s@demo.com').first()
    if not student2:
        student2 = User(
            full_name='Priya Sharma',
            email='priya.s@demo.com',
            role='student',
            student_id='CS-2024-8812',
            department='Computer Science & Engineering',
            bio='Database systems and big data pipeline enthusiast.'
        )
        student2.set_password('Student123!')
        db.session.add(student2)
        db.session.flush()

    # Seed Sample Assignments
    if Assignment.query.count() == 0:
        asg1 = Assignment(
            title='Cloud Architecture & Microservices Resilience Design',
            subject='Cloud Computing',
            course_code='CS-601',
            description='Design a resilient multi-region cloud architecture with Amazon S3 and Textract integration specifications.',
            instructions='1. Format as IEEE conference report.\n2. Include failover diagrams.\n3. Cite benchmarks.',
            teacher_id=teacher.id,
            due_date=datetime(2026, 11, 15, 23, 59, 0),
            max_marks=100,
            allowed_file_types='PDF,DOCX',
            max_file_size_mb=10,
            status='published'
        )
        asg2 = Assignment(
            title='Relational vs NoSQL Schema Optimization & Benchmarking',
            subject='Database Management',
            course_code='CS-504',
            description='Comparative evaluation of PostgreSQL indexing vs MongoDB compound indexes.',
            instructions='Submit query execution plans (EXPLAIN ANALYZE) and synthesis of findings.',
            teacher_id=teacher.id,
            due_date=datetime(2026, 11, 20, 23, 59, 0),
            max_marks=100,
            allowed_file_types='PDF,DOCX,TXT',
            max_file_size_mb=10,
            status='published'
        )
        asg3 = Assignment(
            title='Kernel Space Memory Allocation & eBPF Observability (Draft)',
            subject='Operating Systems',
            course_code='CS-506',
            description='Explore Linux SLUB allocator performance using eBPF probes.',
            instructions='Draft instructions for upcoming semester lab module.',
            teacher_id=teacher.id,
            due_date=datetime(2026, 11, 28, 23, 59, 0),
            max_marks=50,
            allowed_file_types='PDF,TXT',
            max_file_size_mb=10,
            status='draft'
        )
        db.session.add_all([asg1, asg2, asg3])
        db.session.flush()

        # Seed Sample Submission for Student 1
        sub1 = Submission(
            assignment_id=asg1.id,
            student_id=student1.id,
            original_filename='Alex_Johnson_Cloud_Architecture.pdf',
            file_size_bytes=2450000,
            storage_provider='local_placeholder',
            storage_key=f"submissions/{asg1.id}/{student1.id}/Alex_Johnson_Cloud_Architecture.pdf",
            status='processed',
            review_status='reviewed',
            teacher_notes='Clean, original analysis. Good citations of reactive state paradigms.'
        )
        db.session.add(sub1)
        db.session.flush()

        # Seed Report for sub1
        rep1 = SimilarityReport(
            submission_id=sub1.id,
            overall_similarity_score=8.0,
            category='low',
            report_data='{"matched_documents":[{"title":"AWS Well-Architected Framework: Reliability Pillar","url":"https://docs.aws.amazon.com/wellarchitected/","matchPercentage":4.8,"matchedWordCount":202}],"matching_passages":[{"page":2,"paragraph":1,"studentExcerpt":"Multi-region deployment provides fault isolation.","sourceExcerpt":"Multi-region deployments ensure service resilience across availability zones.","sourceTitle":"AWS Well-Architected Framework","similarity":82,"matchType":"Quotation"}],"textract_metadata":{"pages_extracted":12,"words_count":4210,"detected_language":"English (en-US)","confidence_score":"99.4%"},"summary_notes":"Document demonstrates high academic integrity with standard citations."}',
            status='completed'
        )
        db.session.add(rep1)

    db.session.commit()


if __name__ == '__main__':
    app = create_app('development')
    with app.app_context():
        db.create_all()
        seed_database()
    port = int(os.getenv('PORT', 5000))
    print(f"Starting Smart Assignment Portal Backend on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
