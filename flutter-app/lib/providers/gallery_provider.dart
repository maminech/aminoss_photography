import 'package:flutter/foundation.dart';
import '../models/gallery.dart';
import '../services/api_service.dart';

class GalleryProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<Gallery> _galleries = [];
  Gallery? _selectedGallery;
  bool _isLoading = false;
  String? _error;

  List<Gallery> get galleries => _galleries;
  Gallery? get selectedGallery => _selectedGallery;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchGalleries() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.getGalleries();
      if (response['success']) {
        _galleries = (response['galleries'] as List)
            .map((json) => Gallery.fromJson(json))
            .toList();
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Fetch galleries error: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchGalleryById(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.getGalleryById(id);
      if (response['success']) {
        _selectedGallery = Gallery.fromJson(response['gallery']);
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Fetch gallery error: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  void clearSelectedGallery() {
    _selectedGallery = null;
    notifyListeners();
  }

  List<Gallery> getGalleriesByCategory(String category) {
    if (category == 'All') return _galleries;
    return _galleries
        .where((gallery) => gallery.category == category)
        .toList();
  }
}
