"""Seed the database with demo data."""
import os, sys, uuid
from datetime import datetime, timedelta
import qrcode
sys.path.insert(0, os.path.dirname(__file__))
from app import create_app
from models import db, User, Helper, Resident, Assignment, EntryLog, Feedback, Complaint
from config import Config

def seed():
    app = create_app()
    with app.app_context():
        db.drop_all()
        db.create_all()
        admin = User(username='admin', email='admin@safenest.com', role='admin', phone='9876543210')
        admin.set_password('admin123')
        r1u = User(username='priya_sharma', email='priya@safenest.com', role='resident', flat_number='A-101', phone='9876543211')
        r1u.set_password('resident123')
        r2u = User(username='rahul_verma', email='rahul@safenest.com', role='resident', flat_number='B-205', phone='9876543212')
        r2u.set_password('resident123')
        guard = User(username='security_raju', email='raju@safenest.com', role='security', phone='9876543213')
        guard.set_password('guard123')
        db.session.add_all([admin, r1u, r2u, guard])
        db.session.commit()
        res1 = Resident(user_id=r1u.id, flat_number='A-101', block='A', floor=1)
        res2 = Resident(user_id=r2u.id, flat_number='B-205', block='B', floor=2)
        db.session.add_all([res1, res2])
        db.session.commit()
        hdata = [('Sunita Devi','9988776601','maid','verified'),('Ramesh Kumar','9988776602','cook','verified'),
                 ('Anil Singh','9988776603','driver','verified'),('Kamla Bai','9988776604','caretaker','pending'),
                 ('Mohan Lal','9988776605','maid','suspended'),('Geeta Rani','9988776606','cook','verified')]
        helpers = []
        os.makedirs(Config.QR_CODE_FOLDER, exist_ok=True)
        for name, phone, wtype, status in hdata:
            h = Helper(name=name, phone=phone, work_type=wtype, verification_status=status,
                       qr_token=str(uuid.uuid4()), is_active=(status=='verified'),
                       society_notes='Registered by society admin.')
            db.session.add(h); db.session.commit()
            img = qrcode.make(f"http://localhost:5000/security/verify/{h.qr_token}")
            fn = f"helper_{h.id}.png"
            img.save(os.path.join(Config.QR_CODE_FOLDER, fn))
            h.qr_code_path = f"qrcodes/{fn}"; db.session.commit()
            helpers.append(h)
        for hid, rid, flat in [(0,0,'A-101'),(1,0,'A-101'),(2,1,'B-205'),(5,1,'B-205'),(0,1,'B-205')]:
            db.session.add(Assignment(helper_id=helpers[hid].id, resident_id=[res1,res2][rid].id, flat_number=flat))
        db.session.commit()
        now = datetime.utcnow()
        for i in range(20):
            h = helpers[i % len(helpers)]
            db.session.add(EntryLog(helper_id=h.id, guard_id=guard.id,
                entry_time=now - timedelta(hours=i*6),
                exit_time=(now - timedelta(hours=i*6-2)) if i%3!=0 else None,
                status='allowed' if h.verification_status=='verified' else 'blocked'))
        db.session.commit()
        for hid,rid,r,c in [(0,0,5,'Excellent!'),(0,1,4,'Reliable.'),(1,0,5,'Great cook!'),(2,1,3,'Sometimes late.'),(5,1,4,'Very clean.')]:
            db.session.add(Feedback(helper_id=helpers[hid].id, resident_id=[res1,res2][rid].id, rating=r, comment=c))
        db.session.commit()
        db.session.add(Complaint(helper_id=helpers[4].id, resident_id=res1.id, subject='Unprofessional behavior',
                                  description='The helper was rude.', status='open'))
        db.session.add(Complaint(helper_id=helpers[2].id, resident_id=res2.id, subject='Late arrivals',
                                  description='Driver consistently late.', status='in_progress', response='Looking into this.'))
        db.session.commit()
        print("\n  SafeNest DB Seeded!\n  Admin: admin@safenest.com / admin123\n  Resident: priya@safenest.com / resident123\n  Guard: raju@safenest.com / guard123\n")

if __name__ == '__main__':
    seed()
