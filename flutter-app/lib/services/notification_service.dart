import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'api_service.dart';

class NotificationService {
  static final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

  static Future<void> init() async {
    // Request permission for iOS
    await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );

    // Initialize local notifications
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    
    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (details) {
        // Handle notification tap
        _handleNotificationTap(details.payload);
      },
    );

    // Get FCM token
    final token = await _firebaseMessaging.getToken();
    if (token != null) {
      await ApiService.subscribeToPushNotifications(token);
    }

    // Listen for foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // Listen for background messages
    FirebaseMessaging.onMessageOpenedApp.listen(_handleBackgroundMessage);
  }

  static Future<void> _handleForegroundMessage(RemoteMessage message) async {
    final notification = message.notification;
    if (notification != null) {
      await showLocalNotification(
        title: notification.title ?? 'New Notification',
        body: notification.body ?? '',
        payload: message.data['url'],
      );
    }
  }

  static Future<void> _handleBackgroundMessage(RemoteMessage message) async {
    // Navigate to specific screen based on payload
    _handleNotificationTap(message.data['url']);
  }

  static void _handleNotificationTap(String? payload) {
    if (payload != null) {
      // Navigate based on payload
      // This will be handled by Get.toNamed in the UI
    }
  }

  static Future<void> showLocalNotification({
    required String title,
    required String body,
    String? payload,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'innov8_channel',
      'Innov8 Production',
      channelDescription: 'Notifications from Innov8 Production',
      importance: Importance.high,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title,
      body,
      details,
      payload: payload,
    );
  }
}
