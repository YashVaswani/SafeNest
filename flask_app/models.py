from datetime import datetime, date
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(UserMixin, db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='resident')  # admin, resident, security
    flat_number = db.Column(db.String(20), nullable=True)
    phone = db.Column(db.String(15), nullable=True)
    is_active_user = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    resident = db.relationship('Resident', backref='user', uselist=False, lazy=True)
    guard_logs = db.relationship('EntryLog', backref='guard', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def is_active(self):
        return self.is_active_user

    def __repr__(self):
        return f'<User {self.username} ({self.role})>'


class Helper(db.Model):
    __tablename__ = 'helpers'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    work_type = db.Column(db.String(50), nullable=False)  # maid, cook, driver, caretaker, other
    verification_status = db.Column(db.String(20), default='pending')  # pending, verified, suspended, revoked
    society_notes = db.Column(db.Text, nullable=True)
    qr_code_path = db.Column(db.String(200), nullable=True)
    qr_token = db.Column(db.String(100), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    assignments = db.relationship('Assignment', backref='helper', lazy=True)
    entry_logs = db.relationship('EntryLog', backref='helper', lazy=True)
    feedbacks = db.relationship('Feedback', backref='helper', lazy=True)
    complaints = db.relationship('Complaint', backref='helper', lazy=True)

    @property
    def avg_rating(self):
        if not self.feedbacks:
            return 0
        return round(sum(f.rating for f in self.feedbacks) / len(self.feedbacks), 1)

    @property
    def active_assignments(self):
        return [a for a in self.assignments if a.is_active]

    def __repr__(self):
        return f'<Helper {self.name} ({self.work_type})>'


class Resident(db.Model):
    __tablename__ = 'residents'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    flat_number = db.Column(db.String(20), nullable=False)
    block = db.Column(db.String(10), nullable=True)
    floor = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    assignments = db.relationship('Assignment', backref='resident', lazy=True)
    feedbacks = db.relationship('Feedback', backref='resident', lazy=True)
    complaints = db.relationship('Complaint', backref='resident', lazy=True)

    def __repr__(self):
        return f'<Resident {self.flat_number}>'


class Assignment(db.Model):
    __tablename__ = 'assignments'

    id = db.Column(db.Integer, primary_key=True)
    helper_id = db.Column(db.Integer, db.ForeignKey('helpers.id'), nullable=False)
    resident_id = db.Column(db.Integer, db.ForeignKey('residents.id'), nullable=False)
    flat_number = db.Column(db.String(20), nullable=False)
    start_date = db.Column(db.Date, default=date.today)
    end_date = db.Column(db.Date, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Assignment Helper:{self.helper_id} -> Flat:{self.flat_number}>'


class EntryLog(db.Model):
    __tablename__ = 'entry_logs'

    id = db.Column(db.Integer, primary_key=True)
    helper_id = db.Column(db.Integer, db.ForeignKey('helpers.id'), nullable=False)
    guard_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    entry_time = db.Column(db.DateTime, default=datetime.utcnow)
    exit_time = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), default='allowed')  # allowed, blocked, flagged
    notes = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f'<EntryLog Helper:{self.helper_id} @ {self.entry_time}>'


class Feedback(db.Model):
    __tablename__ = 'feedback'

    id = db.Column(db.Integer, primary_key=True)
    helper_id = db.Column(db.Integer, db.ForeignKey('helpers.id'), nullable=False)
    resident_id = db.Column(db.Integer, db.ForeignKey('residents.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Feedback Helper:{self.helper_id} Rating:{self.rating}>'


class Complaint(db.Model):
    __tablename__ = 'complaints'

    id = db.Column(db.Integer, primary_key=True)
    helper_id = db.Column(db.Integer, db.ForeignKey('helpers.id'), nullable=False)
    resident_id = db.Column(db.Integer, db.ForeignKey('residents.id'), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='open')  # open, in_progress, resolved, dismissed
    response = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f'<Complaint {self.subject} ({self.status})>'
