import 'package:flutter/foundation.dart';
import '../models/booking.dart';
import '../services/api_service.dart';

class BookingProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<Booking> _bookings = [];
  Booking? _selectedBooking;
  bool _isLoading = false;
  String? _error;

  List<Booking> get bookings => _bookings;
  Booking? get selectedBooking => _selectedBooking;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchBookings() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.getBookings();
      if (response['success']) {
        _bookings = (response['bookings'] as List)
            .map((json) => Booking.fromJson(json))
            .toList();
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Fetch bookings error: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> createBooking({
    required String name,
    required String email,
    required String phone,
    required String serviceType,
    required DateTime date,
    required String time,
    String? notes,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.createBooking(
        name: name,
        email: email,
        phone: phone,
        serviceType: serviceType,
        date: date,
        time: time,
        notes: notes,
      );

      if (response['success']) {
        await fetchBookings(); // Refresh list
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Create booking error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> updateBookingStatus(String bookingId, String status) async {
    try {
      final response = await _apiService.updateBooking(bookingId, status);
      if (response['success']) {
        await fetchBookings();
        return true;
      }
    } catch (e) {
      debugPrint('Update booking error: $e');
    }
    return false;
  }

  List<Booking> getBookingsByStatus(String status) {
    return _bookings.where((booking) => booking.status == status).toList();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
