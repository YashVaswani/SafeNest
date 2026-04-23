import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

/// Change this to your LAN IP when testing on a physical Android device
/// For Android emulator, use: http://10.0.2.2:3009
const String _kBaseUrl = 'http://127.0.0.1:3009';

class ApiService {
  static const String baseUrl = _kBaseUrl;

  // ── Token management ─────────────────────────────────────
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  static Future<void> saveUser(Map<String, dynamic> user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user_data', jsonEncode(user));
  }

  static Future<Map<String, dynamic>?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('user_data');
    if (raw == null) return null;
    return jsonDecode(raw) as Map<String, dynamic>;
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_data');
  }

  // ── Helper: build authenticated headers ──────────────────
  static Future<Map<String, String>> _authHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // ── Generic request helpers ───────────────────────────────
  static Future<Map<String, dynamic>> _post(String path, Map<String, dynamic> body, {bool auth = false}) async {
    try {
      final headers = auth ? await _authHeaders() : {'Content-Type': 'application/json'};
      final response = await http
          .post(Uri.parse('$baseUrl$path'), headers: headers, body: jsonEncode(body))
          .timeout(const Duration(seconds: 15));
      return jsonDecode(response.body) as Map<String, dynamic>;
    } catch (e) {
      return {'success': false, 'message': 'Network error: ${e.toString()}'};
    }
  }

  static Future<Map<String, dynamic>> _get(String path) async {
    try {
      final headers = await _authHeaders();
      final response = await http
          .get(Uri.parse('$baseUrl$path'), headers: headers)
          .timeout(const Duration(seconds: 15));
      return jsonDecode(response.body) as Map<String, dynamic>;
    } catch (e) {
      return {'success': false, 'message': 'Network error: ${e.toString()}'};
    }
  }

  static Future<Map<String, dynamic>> _patch(String path, Map<String, dynamic> body) async {
    try {
      final headers = await _authHeaders();
      final response = await http
          .patch(Uri.parse('$baseUrl$path'), headers: headers, body: jsonEncode(body))
          .timeout(const Duration(seconds: 15));
      return jsonDecode(response.body) as Map<String, dynamic>;
    } catch (e) {
      return {'success': false, 'message': 'Network error: ${e.toString()}'};
    }
  }

  // ── Auth ──────────────────────────────────────────────────
  static Future<Map<String, dynamic>> sendOtp(String phoneNumber) =>
      _post('/api/auth/send-otp', {'phoneNumber': phoneNumber});

  static Future<Map<String, dynamic>> verifyOtp(String phoneNumber, String otp) =>
      _post('/api/auth/verify-otp', {'phoneNumber': phoneNumber, 'otp': otp});

  // ── Helpers ───────────────────────────────────────────────
  static Future<Map<String, dynamic>> getHelpers({String? search}) =>
      _get('/api/helpers${search != null ? '?search=$search' : ''}');

  static Future<Map<String, dynamic>> getHelperProfile(String id) => _get('/api/helpers/$id');

  // ── Visitors ──────────────────────────────────────────────
  static Future<Map<String, dynamic>> getInSociety() => _get('/api/visitors/in-society');

  static Future<Map<String, dynamic>> logEntry({
    required String visitorPhone,
    required String destinationFlat,
    required String verificationMethod,
    String? qrCodeValue,
  }) =>
      _post(
        '/api/visitors/log-entry',
        {
          'visitorPhone': visitorPhone,
          'destinationFlat': destinationFlat,
          'verificationMethod': verificationMethod,
          if (qrCodeValue != null) 'qrCodeValue': qrCodeValue,
        },
        auth: true,
      );

  static Future<Map<String, dynamic>> logExit(int logId) => _patch('/api/visitors/log-exit/$logId', {});

  static Future<Map<String, dynamic>> preApprove({
    required String visitorName,
    required String visitorPhone,
    required String validFrom,
    required String validUntil,
  }) =>
      _post(
        '/api/visitors/pre-approve',
        {
          'visitorName': visitorName,
          'visitorPhone': visitorPhone,
          'validFrom': validFrom,
          'validUntil': validUntil,
        },
        auth: true,
      );

  static Future<Map<String, dynamic>> verifyQr(String qrCodeValue) =>
      _post('/api/visitors/verify-qr', {'qrCodeValue': qrCodeValue}, auth: true);

  // ── Admin ─────────────────────────────────────────────────
  static Future<Map<String, dynamic>> getAdminOverview() => _get('/api/admin/overview');
  static Future<Map<String, dynamic>> getPendingUsers() => _get('/api/admin/pending-users');
  static Future<Map<String, dynamic>> approveUser(int id) => _patch('/api/admin/users/$id/approve', {});
  static Future<Map<String, dynamic>> banUser(int id) => _patch('/api/admin/users/$id/ban', {});
  static Future<Map<String, dynamic>> getAdminHelpers() => _get('/api/admin/helpers');
  static Future<Map<String, dynamic>> revokeCard(int id) => _patch('/api/admin/helpers/$id/revoke-card', {});
  static Future<Map<String, dynamic>> getAlerts() => _get('/api/admin/alerts');

  // ── Alerts ────────────────────────────────────────────────
  static Future<Map<String, dynamic>> fileAlert({
    required String description,
    required String severity,
    int? targetUserId,
  }) =>
      _post(
        '/api/alerts',
        {
          'description': description,
          'severity': severity,
          if (targetUserId != null) 'targetUserId': targetUserId,
        },
        auth: true,
      );
}
