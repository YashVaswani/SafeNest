# SafeNest

SafeNest is a Flask-based privacy-first verification platform for gated societies that uses QR-based IDs to manage and verify household helpers. It enables secure entry logging, helper verification, resident feedback, and role-based access for admins, residents, and security guards.

## Structure
- `/server`: Express.js backend
- `/mobile`: Flutter mobile application
- `/flask_app`: Flask web application

## Setup & Running

### 1. Flask Web App

```bash
cd flask_app
pip install -r requirements.txt
python app.py
```

### 2. Mobile (Flutter)

```bash
cd mobile
flutter pub get
flutter run
```

#### Important Note for Mobile Testing:
- **Android Emulator**: The code is configured to use `10.0.2.2:3000` which points to your local machine.
- **Physical Device**: You must change the `_baseUrl` in `lib/login_page.dart` to your machine's local IP address (e.g., `http://192.168.1.5:3000`).

## Credentials
Use the following mock credentials to login:
- **Email**: `user@example.com`
- **Password**: `password123`
