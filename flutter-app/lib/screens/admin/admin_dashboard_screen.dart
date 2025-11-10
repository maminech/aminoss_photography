import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:provider/provider.dart';
import '../../providers/booking_provider.dart';
import '../../providers/invoice_provider.dart';
import '../../utils/app_routes.dart';
import '../../widgets/loading_indicator.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<BookingProvider>(context, listen: false).fetchBookings();
      Provider.of<InvoiceProvider>(context, listen: false).fetchInvoices();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => Get.toNamed(AppRoutes.settings),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await Future.wait([
            Provider.of<BookingProvider>(context, listen: false).fetchBookings(),
            Provider.of<InvoiceProvider>(context, listen: false).fetchInvoices(),
          ]);
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Stats Cards
              Text(
                'Overview',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 16),
              _buildStatsGrid(),
              const SizedBox(height: 24),
              // Quick Actions
              Text(
                'Quick Actions',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 16),
              _buildQuickActions(),
              const SizedBox(height: 24),
              // Recent Bookings
              Text(
                'Recent Bookings',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 16),
              _buildRecentBookings(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatsGrid() {
    return Consumer2<BookingProvider, InvoiceProvider>(
      builder: (context, bookingProvider, invoiceProvider, child) {
        if (bookingProvider.isLoading || invoiceProvider.isLoading) {
          return const LoadingIndicator(message: 'Loading stats...');
        }

        final pendingBookings = bookingProvider.getBookingsByStatus('pending').length;
        final totalBookings = bookingProvider.bookings.length;
        final totalRevenue = invoiceProvider.getTotalRevenue();
        final pendingAmount = invoiceProvider.getPendingAmount();

        return GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          childAspectRatio: 1.5,
          children: [
            _buildStatCard(
              icon: Icons.calendar_today,
              title: 'Pending Bookings',
              value: pendingBookings.toString(),
              color: Colors.orange,
            ),
            _buildStatCard(
              icon: Icons.event_available,
              title: 'Total Bookings',
              value: totalBookings.toString(),
              color: Colors.blue,
            ),
            _buildStatCard(
              icon: Icons.attach_money,
              title: 'Total Revenue',
              value: '\$${totalRevenue.toStringAsFixed(0)}',
              color: Colors.green,
            ),
            _buildStatCard(
              icon: Icons.pending_actions,
              title: 'Pending Amount',
              value: '\$${pendingAmount.toStringAsFixed(0)}',
              color: Colors.purple,
            ),
          ],
        );
      },
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String title,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 32, color: color),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[700],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    final actions = [
      {
        'icon': Icons.calendar_month,
        'title': 'Bookings',
        'route': AppRoutes.bookingsAdmin,
        'color': Colors.blue,
      },
      {
        'icon': Icons.receipt_long,
        'title': 'Invoices',
        'route': AppRoutes.invoices,
        'color': Colors.green,
      },
      {
        'icon': Icons.message,
        'title': 'Messages',
        'route': AppRoutes.messages,
        'color': Colors.orange,
      },
      {
        'icon': Icons.people,
        'title': 'Clients',
        'route': AppRoutes.clients,
        'color': Colors.purple,
      },
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 1.5,
      ),
      itemCount: actions.length,
      itemBuilder: (context, index) {
        final action = actions[index];
        return InkWell(
          onTap: () => Get.toNamed(action['route'] as String),
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  (action['color'] as Color).withOpacity(0.8),
                  action['color'] as Color,
                ],
              ),
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: (action['color'] as Color).withOpacity(0.3),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  action['icon'] as IconData,
                  size: 40,
                  color: Colors.white,
                ),
                const SizedBox(height: 8),
                Text(
                  action['title'] as String,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildRecentBookings() {
    return Consumer<BookingProvider>(
      builder: (context, bookingProvider, child) {
        if (bookingProvider.bookings.isEmpty) {
          return Container(
            padding: const EdgeInsets.all(32),
            child: const Center(
              child: Text('No bookings yet'),
            ),
          );
        }

        final recentBookings = bookingProvider.bookings.take(5).toList();

        return Column(
          children: recentBookings.map((booking) {
            Color statusColor;
            switch (booking.status) {
              case 'pending':
                statusColor = Colors.orange;
                break;
              case 'confirmed':
                statusColor = Colors.green;
                break;
              case 'cancelled':
                statusColor = Colors.red;
                break;
              default:
                statusColor = Colors.grey;
            }

            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: statusColor.withOpacity(0.2),
                  child: Icon(Icons.person, color: statusColor),
                ),
                title: Text(
                  booking.userName,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Text(
                  '${booking.serviceType}\n${booking.date.day}/${booking.date.month}/${booking.date.year} at ${booking.time}',
                ),
                trailing: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    booking.status.toUpperCase(),
                    style: TextStyle(
                      color: statusColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 11,
                    ),
                  ),
                ),
                isThreeLine: true,
              ),
            );
          }).toList(),
        );
      },
    );
  }
}
