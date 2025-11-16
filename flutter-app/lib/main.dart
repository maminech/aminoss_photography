import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';

import 'services/auth_service.dart';
import 'services/api_service.dart';
import 'services/notification_service.dart';
import 'services/storage_service.dart';
import 'providers/auth_provider.dart';
import 'providers/gallery_provider.dart';
import 'providers/booking_provider.dart';
import 'providers/invoice_provider.dart';
import 'providers/theme_provider.dart';
import 'screens/splash_screen.dart';
import 'utils/app_theme.dart';
import 'utils/app_routes.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  await Firebase.initializeApp();
  
  // Initialize Hive
  await Hive.initFlutter();
  
  // Initialize Services
  await StorageService.init();
  await NotificationService.init();
  
  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );
  
  // Set preferred orientations
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  
  runApp(const Innov8ProductionApp());
}

class Innov8ProductionApp extends StatelessWidget {
  const Innov8ProductionApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => GalleryProvider()),
        ChangeNotifierProvider(create: (_) => BookingProvider()),
        ChangeNotifierProvider(create: (_) => InvoiceProvider()),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return GetMaterialApp(
            title: 'Innov8 Production',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: themeProvider.themeMode,
            initialRoute: AppRoutes.splash,
            getPages: AppRoutes.routes,
            defaultTransition: Transition.cupertino,
            home: const SplashScreen(),
          );
        },
      ),
    );
  }
}
