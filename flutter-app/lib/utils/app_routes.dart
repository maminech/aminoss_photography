import 'package:get/get.dart';
import '../screens/splash_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/gallery/gallery_screen.dart';
import '../screens/gallery/gallery_detail_screen.dart';
import '../screens/booking/booking_screen.dart';
import '../screens/booking/booking_detail_screen.dart';
import '../screens/services/services_screen.dart';
import '../screens/contact/contact_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/admin/admin_dashboard_screen.dart';
import '../screens/admin/invoices_screen.dart';
import '../screens/admin/bookings_admin_screen.dart';
import '../screens/admin/messages_screen.dart';
import '../screens/admin/clients_screen.dart';
import '../screens/admin/settings_screen.dart';

class AppRoutes {
  static const String splash = '/splash';
  static const String login = '/login';
  static const String register = '/register';
  static const String home = '/home';
  static const String gallery = '/gallery';
  static const String galleryDetail = '/gallery-detail';
  static const String booking = '/booking';
  static const String bookingDetail = '/booking-detail';
  static const String services = '/services';
  static const String contact = '/contact';
  static const String profile = '/profile';
  static const String adminDashboard = '/admin-dashboard';
  static const String invoices = '/invoices';
  static const String bookingsAdmin = '/bookings-admin';
  static const String messages = '/messages';
  static const String clients = '/clients';
  static const String settings = '/settings';

  static List<GetPage> routes = [
    GetPage(name: splash, page: () => const SplashScreen()),
    GetPage(name: login, page: () => const LoginScreen()),
    GetPage(name: register, page: () => const RegisterScreen()),
    GetPage(name: home, page: () => const HomeScreen()),
    GetPage(name: gallery, page: () => const GalleryScreen()),
    GetPage(name: galleryDetail, page: () => const GalleryDetailScreen()),
    GetPage(name: booking, page: () => const BookingScreen()),
    GetPage(name: bookingDetail, page: () => const BookingDetailScreen()),
    GetPage(name: services, page: () => const ServicesScreen()),
    GetPage(name: contact, page: () => const ContactScreen()),
    GetPage(name: profile, page: () => const ProfileScreen()),
    GetPage(name: adminDashboard, page: () => const AdminDashboardScreen()),
    GetPage(name: invoices, page: () => const InvoicesScreen()),
    GetPage(name: bookingsAdmin, page: () => const BookingsAdminScreen()),
    GetPage(name: messages, page: () => const MessagesScreen()),
    GetPage(name: clients, page: () => const ClientsScreen()),
    GetPage(name: settings, page: () => const SettingsScreen()),
  ];
}
