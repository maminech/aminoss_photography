import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_service.dart';

class AuthService {
  static const _storage = FlutterSecureStorage();
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';
  static const String _roleKey = 'user_role';

  // Login
  static Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await ApiService.login(email, password);
      
      if (response['token'] != null) {
        await _storage.write(key: _tokenKey, value: response['token']);
        await _storage.write(key: _userKey, value: response['user'].toString());
        await _storage.write(key: _roleKey, value: response['role'] ?? 'user');
        return {'success': true, 'user': response['user']};
      }
      
      return {'success': false, 'message': 'Invalid credentials'};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  // Register
  static Future<Map<String, dynamic>> register(Map<String, dynamic> data) async {
    try {
      final response = await ApiService.register(data);
      return {'success': true, 'message': 'Registration successful'};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  // Logout
  static Future<void> logout() async {
    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _userKey);
    await _storage.delete(key: _roleKey);
  }

  // Check if logged in
  static Future<bool> isLoggedIn() async {
    final token = await _storage.read(key: _tokenKey);
    return token != null;
  }

  // Get user role
  static Future<String?> getUserRole() async {
    return await _storage.read(key: _roleKey);
  }

  // Get auth token
  static Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }
}
