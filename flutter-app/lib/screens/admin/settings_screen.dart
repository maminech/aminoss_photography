import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/theme_provider.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: ListView(
        children: [
          // Theme Section
          ListTile(
            title: const Text(
              'Appearance',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ),
          Consumer<ThemeProvider>(
            builder: (context, themeProvider, child) {
              return SwitchListTile(
                title: const Text('Dark Mode'),
                subtitle: const Text('Switch between light and dark theme'),
                value: themeProvider.isDarkMode,
                onChanged: (value) => themeProvider.toggleTheme(),
                secondary: Icon(
                  themeProvider.isDarkMode
                      ? Icons.dark_mode
                      : Icons.light_mode,
                ),
              );
            },
          ),
          const Divider(),
          // Notifications Section
          ListTile(
            title: const Text(
              'Notifications',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ),
          SwitchListTile(
            title: const Text('Push Notifications'),
            subtitle: const Text('Receive booking and message alerts'),
            value: true,
            onChanged: (value) {
              // TODO: Implement notification settings
            },
            secondary: const Icon(Icons.notifications),
          ),
          const Divider(),
          // About Section
          ListTile(
            title: const Text(
              'About',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ),
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: const Text('App Version'),
            subtitle: const Text('1.0.0'),
          ),
          ListTile(
            leading: const Icon(Icons.policy_outlined),
            title: const Text('Privacy Policy'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              // TODO: Show privacy policy
            },
          ),
          ListTile(
            leading: const Icon(Icons.description_outlined),
            title: const Text('Terms & Conditions'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              // TODO: Show terms
            },
          ),
        ],
      ),
    );
  }
}
