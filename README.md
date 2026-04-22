# SafeNest

Full-stack application with Flutter mobile client and Express.js backend.

## Structure

- `/server`: Express.js backend
- `/mobile`: Flutter mobile application

## Setup & Running

### 1. Server

```bash
cd server
npm install
node index.js
```

The server will run on `http://localhost:3000`.

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
