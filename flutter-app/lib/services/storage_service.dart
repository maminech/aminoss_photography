import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class StorageService {
  static late SharedPreferences _prefs;

  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // Save string
  static Future<bool> saveString(String key, String value) async {
    return await _prefs.setString(key, value);
  }

  // Get string
  static String? getString(String key) {
    return _prefs.getString(key);
  }

  // Save bool
  static Future<bool> saveBool(String key, bool value) async {
    return await _prefs.setBool(key, value);
  }

  // Get bool
  static bool? getBool(String key) {
    return _prefs.getBool(key);
  }

  // Save int
  static Future<bool> saveInt(String key, int value) async {
    return await _prefs.setInt(key, value);
  }

  // Get int
  static int? getInt(String key) {
    return _prefs.getInt(key);
  }

  // Save object as JSON
  static Future<bool> saveObject(String key, Map<String, dynamic> object) async {
    return await _prefs.setString(key, json.encode(object));
  }

  // Get object from JSON
  static Map<String, dynamic>? getObject(String key) {
    final jsonString = _prefs.getString(key);
    if (jsonString != null) {
      return json.decode(jsonString) as Map<String, dynamic>;
    }
    return null;
  }

  // Remove key
  static Future<bool> remove(String key) async {
    return await _prefs.remove(key);
  }

  // Clear all
  static Future<bool> clearAll() async {
    return await _prefs.clear();
  }

  // Theme mode
  static Future<void> saveThemeMode(String mode) async {
    await saveString('theme_mode', mode);
  }

  static String getThemeMode() {
    return getString('theme_mode') ?? 'system';
  }

  // Language
  static Future<void> saveLanguage(String lang) async {
    await saveString('language', lang);
  }

  static String getLanguage() {
    return getString('language') ?? 'en';
  }
}
