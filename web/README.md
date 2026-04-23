# SafeNest Web Application 🛡️

SafeNest is a unified residential security and community management platform. This web application provides tailored experiences for Residents, Security Guards, and RWA Admins.

## 🚀 Getting Started

To run the application locally:

```bash
cd web
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## 🔐 System Login Credentials

The application uses OTP-based authentication. You can log in using the following pre-configured test accounts, or use the "Try without login" option to instantly switch roles.

### Role-Based Access

| Role | Access Level | Primary Features |
| :--- | :--- | :--- |
| **Resident** | Homeowner/Tenant | Helper discovery, Guest pre-approval, Household management, Activity logs |
| **Guard** | Gatekeeper | QR/RFID Scanning, Visitor search, In-society logs, SOS alerts |
| **Admin** | Society Manager | User approvals, Security stats, Helper card management, Activity oversight |

### Pre-configured Test Accounts

| Name | Role | Mobile Number | OTP | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Priya Sharma** | `RESIDENT` | `9876543210` | `123456` | Managing household and discovering new help |
| **Rajan Kumar** | `GUARD` | `8765432109` | `123456` | Handling gate entries and security logs |
| **Lakshmi Narayanan** | `ADMIN` | `7654321098` | `123456` | Overseeing society operations and approvals |

## 🛠️ Tech Stack

- **React 19**
- **Vite 8**
- **Tailwind CSS v4** (Modern CSS-first configuration)
- **Lucide React** (Iconography)
- **React Router 7** (Role-based protected routing)
- **Context API** (Auth state management)

---
Built with ❤️ for SafeNest Society.
