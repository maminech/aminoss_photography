import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  static const String baseUrl = 'https://aminossphotography-kbggtnzg3-aminech990000-6355s-projects.vercel.app';
  static const _storage = FlutterSecureStorage();
  
  // Auth Headers
  static Future<Map<String, String>> _getHeaders() async {
    final token = await _storage.read(key: 'auth_token');
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // GET Request
  static Future<dynamic> get(String endpoint) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl$endpoint'),
        headers: await _getHeaders(),
      );
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // POST Request
  static Future<dynamic> post(String endpoint, Map<String, dynamic> data) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl$endpoint'),
        headers: await _getHeaders(),
        body: json.encode(data),
      );
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // PUT Request
  static Future<dynamic> put(String endpoint, Map<String, dynamic> data) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl$endpoint'),
        headers: await _getHeaders(),
        body: json.encode(data),
      );
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // DELETE Request
  static Future<dynamic> delete(String endpoint) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl$endpoint'),
        headers: await _getHeaders(),
      );
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Handle Response
  static dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;
      return json.decode(response.body);
    } else {
      throw Exception('Request failed: ${response.statusCode} - ${response.body}');
    }
  }

  // API Endpoints
  
  // Auth
  static Future<Map<String, dynamic>> login(String email, String password) async {
    return await post('/api/auth/login', {'email': email, 'password': password});
  }

  static Future<Map<String, dynamic>> register(Map<String, dynamic> data) async {
    return await post('/api/auth/register', data);
  }

  // Galleries
  static Future<List<dynamic>> getGalleries() async {
    return await get('/api/gallery');
  }

  static Future<Map<String, dynamic>> getGalleryById(String id) async {
    return await get('/api/gallery/$id');
  }

  // Bookings
  static Future<List<dynamic>> getBookings() async {
    return await get('/api/bookings');
  }

  static Future<Map<String, dynamic>> createBooking(Map<String, dynamic> data) async {
    return await post('/api/bookings', data);
  }

  static Future<Map<String, dynamic>> updateBooking(String id, Map<String, dynamic> data) async {
    return await put('/api/bookings/$id', data);
  }

  // Invoices
  static Future<List<dynamic>> getInvoices() async {
    return await get('/api/invoices');
  }

  static Future<Map<String, dynamic>> getInvoiceById(String id) async {
    return await get('/api/invoices/$id');
  }

  // Contact
  static Future<Map<String, dynamic>> sendMessage(Map<String, dynamic> data) async {
    return await post('/api/contact', data);
  }

  // Admin - Dashboard Stats
  static Future<Map<String, dynamic>> getAdminStats() async {
    return await get('/api/admin/stats');
  }

  // Admin - Clients
  static Future<List<dynamic>> getClients() async {
    return await get('/api/admin/clients');
  }

  // Admin - Messages
  static Future<List<dynamic>> getMessages() async {
    return await get('/api/admin/messages');
  }

  static Future<Map<String, dynamic>> replyToMessage(String id, String reply) async {
    return await post('/api/admin/messages/$id/reply', {'reply': reply});
  }

  // Notifications
  static Future<void> subscribeToPushNotifications(String token) async {
    await post('/api/notifications/subscribe', {'token': token});
  }
}
