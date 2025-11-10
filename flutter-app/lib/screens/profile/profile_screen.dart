import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/theme_provider.dart';
import '../../utils/app_routes.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
      ),
      body: authProvider.isLoggedIn
          ? _buildLoggedInView(context, authProvider)
          : _buildGuestView(context),
    );
  }

  Widget _buildLoggedInView(BuildContext context, AuthProvider authProvider) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          // Profile Header
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Theme.of(context).primaryColor,
                  Theme.of(context).primaryColor.withOpacity(0.7),
                ],
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 50,
                  backgroundColor: Colors.white,
                  child: Icon(
                    Icons.person,
                    size: 50,
                    color: Theme.of(context).primaryColor,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  authProvider.userName ?? 'User',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  authProvider.userEmail ?? '',
                  style: const TextStyle(
                    color: Colors.white70,
                  ),
                ),
                if (authProvider.isAdmin) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'Admin',
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 24),
          // Menu Items
          if (authProvider.isAdmin) ...[
            _buildMenuItem(
              context,
              icon: Icons.dashboard,
              title: 'Admin Dashboard',
              onTap: () => Get.toNamed(AppRoutes.adminDashboard),
            ),
            const Divider(),
          ],
          _buildMenuItem(
            context,
            icon: Icons.calendar_today,
            title: 'My Bookings',
            onTap: () => Get.toNamed(AppRoutes.booking),
          ),
          const Divider(),
          _buildMenuItem(
            context,
            icon: Icons.receipt_long,
            title: 'Invoices',
            onTap: () => Get.toNamed(AppRoutes.invoices),
          ),
          const Divider(),
          Consumer<ThemeProvider>(
            builder: (context, themeProvider, child) {
              return _buildMenuItem(
                context,
                icon: themeProvider.isDarkMode
                    ? Icons.light_mode
                    : Icons.dark_mode,
                title: themeProvider.isDarkMode ? 'Light Mode' : 'Dark Mode',
                onTap: () => themeProvider.toggleTheme(),
              );
            },
          ),
          const Divider(),
          _buildMenuItem(
            context,
            icon: Icons.settings,
            title: 'Settings',
            onTap: () => Get.toNamed(AppRoutes.settings),
          ),
          const Divider(),
          _buildMenuItem(
            context,
            icon: Icons.logout,
            title: 'Logout',
            textColor: Colors.red,
            onTap: () {
              authProvider.logout();
              Get.offAllNamed(AppRoutes.home);
              Get.snackbar(
                'Logged Out',
                'You have been logged out successfully',
                backgroundColor: Colors.green,
                colorText: Colors.white,
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildGuestView(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.account_circle_outlined,
              size: 100,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 24),
            Text(
              'Not Logged In',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              'Sign in to access your bookings and profile',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey[600]),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () => Get.toNamed(AppRoutes.login),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                  horizontal: 48,
                  vertical: 16,
                ),
              ),
              child: const Text('Sign In'),
            ),
            const SizedBox(height: 16),
            TextButton(
              onPressed: () => Get.toNamed(AppRoutes.register),
              child: const Text('Create Account'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Color? textColor,
  }) {
    return ListTile(
      leading: Icon(icon, color: textColor),
      title: Text(
        title,
        style: TextStyle(color: textColor),
      ),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
