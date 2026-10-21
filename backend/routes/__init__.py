from routes.auth import auth_bp
from routes.assignments import assignments_bp
from routes.submissions import submissions_bp
from routes.reports import reports_bp
from routes.profile import profile_bp

def register_routes(app):
    """Registers all API blueprints under the /api prefix."""
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(assignments_bp, url_prefix='/api/assignments')
    app.register_blueprint(submissions_bp, url_prefix='/api/submissions')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(profile_bp, url_prefix='/api/profile')
