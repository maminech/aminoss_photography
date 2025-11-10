import 'package:flutter/foundation.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  final ApiService _apiService = ApiService();

  bool _isLoggedIn = false;
  String? _userRole;
  String? _userName;
  String? _userEmail;
  bool _isLoading = false;

  bool get isLoggedIn => _isLoggedIn;
  String? get userRole => _userRole;
  String? get userName => _userName;
  String? get userEmail => _userEmail;
  bool get isLoading => _isLoading;
  bool get isAdmin => _userRole == 'admin';

  AuthProvider() {
    _checkLoginStatus();
  }

  Future<void> _checkLoginStatus() async {
    _isLoggedIn = await _authService.isLoggedIn();
    if (_isLoggedIn) {
      _userRole = await _authService.getUserRole();
    }
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.login(email, password);
      if (response['success']) {
        await _authService.login(
          response['token'],
          response['role'],
          response['user'],
        );
        _isLoggedIn = true;
        _userRole = response['role'];
        _userName = response['user']['name'];
        _userEmail = response['user']['email'];
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Login error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> register(String name, String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.register(name, email, password);
      if (response['success']) {
        await _authService.login(
          response['token'],
          response['role'],
          response['user'],
        );
        _isLoggedIn = true;
        _userRole = response['role'];
        _userName = name;
        _userEmail = email;
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Register error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<void> logout() async {
    await _authService.logout();
    _isLoggedIn = false;
    _userRole = null;
    _userName = null;
    _userEmail = null;
    notifyListeners();
  }
}
