import 'package:flutter/foundation.dart';
import '../models/invoice.dart';
import '../services/api_service.dart';

class InvoiceProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<Invoice> _invoices = [];
  Invoice? _selectedInvoice;
  bool _isLoading = false;
  String? _error;

  List<Invoice> get invoices => _invoices;
  Invoice? get selectedInvoice => _selectedInvoice;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchInvoices() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.getInvoices();
      if (response['success']) {
        _invoices = (response['invoices'] as List)
            .map((json) => Invoice.fromJson(json))
            .toList();
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Fetch invoices error: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchInvoiceById(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.getInvoiceById(id);
      if (response['success']) {
        _selectedInvoice = Invoice.fromJson(response['invoice']);
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Fetch invoice error: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  List<Invoice> getInvoicesByStatus(String status) {
    return _invoices.where((invoice) => invoice.status == status).toList();
  }

  double getTotalRevenue() {
    return _invoices
        .where((invoice) => invoice.isPaid)
        .fold(0.0, (sum, invoice) => sum + invoice.amount);
  }

  double getPendingAmount() {
    return _invoices
        .where((invoice) => invoice.isPending)
        .fold(0.0, (sum, invoice) => sum + invoice.amount);
  }

  void clearSelectedInvoice() {
    _selectedInvoice = null;
    notifyListeners();
  }
}
