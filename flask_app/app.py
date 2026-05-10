import os
import uuid
from datetime import datetime
from functools import wraps

import qrcode
from flask import (Flask, render_template, redirect, url_for, flash, request,
                   jsonify, abort)
from flask_login import (LoginManager, login_user, logout_user, login_required,
                         current_user)

from config import Config
from models import db, User, Helper, Resident, Assignment, EntryLog, Feedback, Complaint


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    os.makedirs(os.path.join(app.root_path, 'instance'), exist_ok=True)
    os.makedirs(app.config['QR_CODE_FOLDER'], exist_ok=True)

    db.init_app(app)
    with app.app_context():
        db.create_all()

    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'login'
    login_manager.login_message_category = 'warning'

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    # --- Decorators ---
    def role_required(*roles):
        def decorator(f):
            @wraps(f)
            @login_required
            def wrapped(*args, **kwargs):
                if current_user.role not in roles:
                    abort(403)
                return f(*args, **kwargs)
            return wrapped
        return decorator

    # --- QR Helper ---
    def generate_qr(helper):
        token = helper.qr_token
        verify_url = f"http://localhost:5000/security/verify/{token}"
        img = qrcode.make(verify_url)
        filename = f"helper_{helper.id}.png"
        filepath = os.path.join(app.config['QR_CODE_FOLDER'], filename)
        img.save(filepath)
        helper.qr_code_path = f"qrcodes/{filename}"
        db.session.commit()

    # ==================== AUTH ====================
    @app.route('/')
    def index():
        if current_user.is_authenticated:
            return redirect(url_for(f'{current_user.role}_dashboard'))
        return redirect(url_for('login'))

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if current_user.is_authenticated:
            return redirect(url_for(f'{current_user.role}_dashboard'))
        if request.method == 'POST':
            email = request.form.get('email', '').strip()
            password = request.form.get('password', '')
            user = User.query.filter_by(email=email).first()
            if user and user.check_password(password):
                login_user(user)
                flash('Welcome back!', 'success')
                return redirect(url_for(f'{user.role}_dashboard'))
            flash('Invalid email or password.', 'danger')
        return render_template('login.html')

    @app.route('/logout')
    @login_required
    def logout():
        logout_user()
        flash('You have been logged out.', 'info')
        return redirect(url_for('login'))

    # ==================== ADMIN ====================
    @app.route('/admin/dashboard')
    @role_required('admin')
    def admin_dashboard():
        total_helpers = Helper.query.count()
        active_helpers = Helper.query.filter_by(is_active=True, verification_status='verified').count()
        pending_helpers = Helper.query.filter_by(verification_status='pending').count()
        today = datetime.utcnow().date()
        entries_today = EntryLog.query.filter(db.func.date(EntryLog.entry_time) == today).count()
        open_complaints = Complaint.query.filter_by(status='open').count()
        recent_logs = EntryLog.query.order_by(EntryLog.entry_time.desc()).limit(5).all()
        recent_complaints = Complaint.query.order_by(Complaint.created_at.desc()).limit(5).all()
        helpers_by_type = db.session.query(Helper.work_type, db.func.count(Helper.id)).group_by(Helper.work_type).all()
        return render_template('admin/dashboard.html',
                               total_helpers=total_helpers, active_helpers=active_helpers,
                               pending_helpers=pending_helpers, entries_today=entries_today,
                               open_complaints=open_complaints, recent_logs=recent_logs,
                               recent_complaints=recent_complaints, helpers_by_type=helpers_by_type)

    @app.route('/admin/helpers')
    @role_required('admin')
    def admin_helpers():
        search = request.args.get('search', '')
        status_filter = request.args.get('status', '')
        type_filter = request.args.get('type', '')
        query = Helper.query
        if search:
            query = query.filter(Helper.name.ilike(f'%{search}%'))
        if status_filter:
            query = query.filter_by(verification_status=status_filter)
        if type_filter:
            query = query.filter_by(work_type=type_filter)
        helpers = query.order_by(Helper.created_at.desc()).all()
        return render_template('admin/helpers.html', helpers=helpers,
                               search=search, status_filter=status_filter, type_filter=type_filter)

    @app.route('/admin/helpers/add', methods=['GET', 'POST'])
    @role_required('admin')
    def admin_add_helper():
        if request.method == 'POST':
            helper = Helper(
                name=request.form['name'],
                phone=request.form['phone'],
                work_type=request.form['work_type'],
                society_notes=request.form.get('society_notes', ''),
                qr_token=str(uuid.uuid4()),
                verification_status=request.form.get('verification_status', 'pending')
            )
            db.session.add(helper)
            db.session.commit()
            generate_qr(helper)
            flash(f'Helper "{helper.name}" added successfully!', 'success')
            return redirect(url_for('admin_helpers'))
        residents = Resident.query.all()
        return render_template('admin/helper_form.html', helper=None, residents=residents)

    @app.route('/admin/helpers/<int:helper_id>/edit', methods=['GET', 'POST'])
    @role_required('admin')
    def admin_edit_helper(helper_id):
        helper = Helper.query.get_or_404(helper_id)
        if request.method == 'POST':
            helper.name = request.form['name']
            helper.phone = request.form['phone']
            helper.work_type = request.form['work_type']
            helper.society_notes = request.form.get('society_notes', '')
            helper.verification_status = request.form.get('verification_status', helper.verification_status)
            db.session.commit()
            flash(f'Helper "{helper.name}" updated.', 'success')
            return redirect(url_for('admin_helper_detail', helper_id=helper.id))
        residents = Resident.query.all()
        return render_template('admin/helper_form.html', helper=helper, residents=residents)

    @app.route('/admin/helpers/<int:helper_id>/delete', methods=['POST'])
    @role_required('admin')
    def admin_delete_helper(helper_id):
        helper = Helper.query.get_or_404(helper_id)
        db.session.delete(helper)
        db.session.commit()
        flash(f'Helper "{helper.name}" deleted.', 'warning')
        return redirect(url_for('admin_helpers'))

    @app.route('/admin/helpers/<int:helper_id>')
    @role_required('admin')
    def admin_helper_detail(helper_id):
        helper = Helper.query.get_or_404(helper_id)
        return render_template('admin/helper_detail.html', helper=helper)

    @app.route('/admin/helpers/<int:helper_id>/suspend', methods=['POST'])
    @role_required('admin')
    def admin_suspend_helper(helper_id):
        helper = Helper.query.get_or_404(helper_id)
        helper.verification_status = 'suspended'
        helper.is_active = False
        db.session.commit()
        flash(f'Helper "{helper.name}" has been suspended.', 'warning')
        return redirect(url_for('admin_helper_detail', helper_id=helper.id))

    @app.route('/admin/helpers/<int:helper_id>/revoke', methods=['POST'])
    @role_required('admin')
    def admin_revoke_helper(helper_id):
        helper = Helper.query.get_or_404(helper_id)
        helper.verification_status = 'revoked'
        helper.is_active = False
        db.session.commit()
        flash(f'Helper "{helper.name}" access revoked.', 'danger')
        return redirect(url_for('admin_helper_detail', helper_id=helper.id))

    @app.route('/admin/helpers/<int:helper_id>/activate', methods=['POST'])
    @role_required('admin')
    def admin_activate_helper(helper_id):
        helper = Helper.query.get_or_404(helper_id)
        helper.verification_status = 'verified'
        helper.is_active = True
        db.session.commit()
        flash(f'Helper "{helper.name}" is now verified and active.', 'success')
        return redirect(url_for('admin_helper_detail', helper_id=helper.id))

    @app.route('/admin/assignments', methods=['GET', 'POST'])
    @role_required('admin')
    def admin_assignments():
        if request.method == 'POST':
            assignment = Assignment(
                helper_id=request.form['helper_id'],
                resident_id=request.form['resident_id'],
                flat_number=request.form['flat_number'],
            )
            db.session.add(assignment)
            db.session.commit()
            flash('Assignment created.', 'success')
            return redirect(url_for('admin_assignments'))
        assignments = Assignment.query.order_by(Assignment.created_at.desc()).all()
        helpers = Helper.query.filter_by(is_active=True).all()
        residents = Resident.query.all()
        return render_template('admin/assignments.html',
                               assignments=assignments, helpers=helpers, residents=residents)

    @app.route('/admin/assignments/<int:aid>/deactivate', methods=['POST'])
    @role_required('admin')
    def admin_deactivate_assignment(aid):
        a = Assignment.query.get_or_404(aid)
        a.is_active = False
        a.end_date = datetime.utcnow().date()
        db.session.commit()
        flash('Assignment deactivated.', 'info')
        return redirect(url_for('admin_assignments'))

    @app.route('/admin/complaints')
    @role_required('admin')
    def admin_complaints():
        status_filter = request.args.get('status', '')
        query = Complaint.query
        if status_filter:
            query = query.filter_by(status=status_filter)
        complaints = query.order_by(Complaint.created_at.desc()).all()
        return render_template('admin/complaints.html', complaints=complaints, status_filter=status_filter)

    @app.route('/admin/complaints/<int:cid>/respond', methods=['POST'])
    @role_required('admin')
    def admin_respond_complaint(cid):
        c = Complaint.query.get_or_404(cid)
        c.response = request.form['response']
        c.status = request.form.get('status', 'in_progress')
        if c.status == 'resolved':
            c.resolved_at = datetime.utcnow()
        db.session.commit()
        flash('Response submitted.', 'success')
        return redirect(url_for('admin_complaints'))

    @app.route('/admin/logs')
    @role_required('admin')
    def admin_logs():
        logs = EntryLog.query.order_by(EntryLog.entry_time.desc()).limit(100).all()
        return render_template('admin/logs.html', logs=logs)

    @app.route('/admin/analytics')
    @role_required('admin')
    def admin_analytics():
        helpers_by_type = db.session.query(Helper.work_type, db.func.count(Helper.id)).group_by(Helper.work_type).all()
        helpers_by_status = db.session.query(Helper.verification_status, db.func.count(Helper.id)).group_by(Helper.verification_status).all()
        recent_entries = db.session.query(db.func.date(EntryLog.entry_time), db.func.count(EntryLog.id))\
            .group_by(db.func.date(EntryLog.entry_time)).order_by(db.func.date(EntryLog.entry_time).desc()).limit(14).all()
        rating_dist = db.session.query(Feedback.rating, db.func.count(Feedback.id)).group_by(Feedback.rating).all()
        return render_template('admin/analytics.html',
                               helpers_by_type=helpers_by_type, helpers_by_status=helpers_by_status,
                               recent_entries=recent_entries, rating_dist=rating_dist)

    # ==================== RESIDENT ====================
    @app.route('/resident/dashboard')
    @role_required('resident')
    def resident_dashboard():
        resident = current_user.resident
        if not resident:
            flash('Resident profile not found.', 'danger')
            return redirect(url_for('logout'))
        my_assignments = Assignment.query.filter_by(resident_id=resident.id, is_active=True).all()
        my_feedbacks = Feedback.query.filter_by(resident_id=resident.id).order_by(Feedback.created_at.desc()).limit(5).all()
        my_complaints = Complaint.query.filter_by(resident_id=resident.id).order_by(Complaint.created_at.desc()).limit(5).all()
        return render_template('resident/dashboard.html', resident=resident,
                               assignments=my_assignments, feedbacks=my_feedbacks, complaints=my_complaints)

    @app.route('/resident/helpers')
    @role_required('resident')
    def resident_helpers():
        search = request.args.get('search', '')
        type_filter = request.args.get('type', '')
        query = Helper.query.filter_by(verification_status='verified', is_active=True)
        if search:
            query = query.filter(Helper.name.ilike(f'%{search}%'))
        if type_filter:
            query = query.filter_by(work_type=type_filter)
        helpers = query.all()
        return render_template('resident/helpers.html', helpers=helpers, search=search, type_filter=type_filter)

    @app.route('/resident/helpers/<int:helper_id>')
    @role_required('resident')
    def resident_helper_detail(helper_id):
        helper = Helper.query.get_or_404(helper_id)
        return render_template('resident/helper_detail.html', helper=helper)

    @app.route('/resident/feedback', methods=['POST'])
    @role_required('resident')
    def resident_submit_feedback():
        resident = current_user.resident
        feedback = Feedback(
            helper_id=request.form['helper_id'],
            resident_id=resident.id,
            rating=int(request.form['rating']),
            comment=request.form.get('comment', '')
        )
        db.session.add(feedback)
        db.session.commit()
        flash('Feedback submitted. Thank you!', 'success')
        return redirect(url_for('resident_helper_detail', helper_id=request.form['helper_id']))

    @app.route('/resident/complaints', methods=['GET', 'POST'])
    @role_required('resident')
    def resident_complaints():
        resident = current_user.resident
        if request.method == 'POST':
            complaint = Complaint(
                helper_id=request.form['helper_id'],
                resident_id=resident.id,
                subject=request.form['subject'],
                description=request.form['description']
            )
            db.session.add(complaint)
            db.session.commit()
            flash('Complaint submitted.', 'success')
            return redirect(url_for('resident_complaints'))
        complaints = Complaint.query.filter_by(resident_id=resident.id).order_by(Complaint.created_at.desc()).all()
        helpers = Helper.query.filter_by(is_active=True).all()
        return render_template('resident/complaints.html', complaints=complaints, helpers=helpers)

    # ==================== SECURITY ====================
    @app.route('/security/dashboard')
    @role_required('security')
    def security_dashboard():
        today = datetime.utcnow().date()
        scans_today = EntryLog.query.filter(db.func.date(EntryLog.entry_time) == today).count()
        blocked_today = EntryLog.query.filter(db.func.date(EntryLog.entry_time) == today, EntryLog.status == 'blocked').count()
        recent_logs = EntryLog.query.order_by(EntryLog.entry_time.desc()).limit(10).all()
        blocked_helpers = Helper.query.filter(Helper.verification_status.in_(['suspended', 'revoked'])).all()
        return render_template('security/dashboard.html',
                               scans_today=scans_today, blocked_today=blocked_today,
                               recent_logs=recent_logs, blocked_helpers=blocked_helpers)

    @app.route('/security/scanner')
    @role_required('security')
    def security_scanner():
        return render_template('security/scanner.html')

    @app.route('/security/verify/<token>')
    def security_verify(token):
        helper = Helper.query.filter_by(qr_token=token).first()
        if not helper:
            return render_template('security/verify.html', helper=None, error='Invalid QR code.')
        if current_user.is_authenticated and current_user.role == 'security':
            log = EntryLog(
                helper_id=helper.id,
                guard_id=current_user.id,
                status='allowed' if helper.is_active and helper.verification_status == 'verified' else 'blocked'
            )
            db.session.add(log)
            db.session.commit()
        return render_template('security/verify.html', helper=helper, error=None)

    @app.route('/api/verify/<token>')
    def api_verify(token):
        helper = Helper.query.filter_by(qr_token=token).first()
        if not helper:
            return jsonify({'valid': False, 'error': 'Helper not found'}), 404
        return jsonify({
            'valid': helper.is_active and helper.verification_status == 'verified',
            'name': helper.name,
            'work_type': helper.work_type,
            'status': helper.verification_status,
            'flats': [a.flat_number for a in helper.active_assignments]
        })

    @app.route('/security/logs')
    @role_required('security')
    def security_logs():
        logs = EntryLog.query.filter_by(guard_id=current_user.id).order_by(EntryLog.entry_time.desc()).limit(100).all()
        return render_template('security/logs.html', logs=logs)

    @app.route('/security/log-exit/<int:log_id>', methods=['POST'])
    @role_required('security')
    def security_log_exit(log_id):
        log = EntryLog.query.get_or_404(log_id)
        log.exit_time = datetime.utcnow()
        db.session.commit()
        flash('Exit time recorded.', 'success')
        return redirect(url_for('security_logs'))

    # --- Error handlers ---
    @app.errorhandler(403)
    def forbidden(e):
        return render_template('login.html', error_msg='Access denied. Insufficient permissions.'), 403

    @app.errorhandler(404)
    def not_found(e):
        return render_template('login.html', error_msg='Page not found.'), 404

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
