import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/gallery_provider.dart';
import '../../utils/app_routes.dart';
import '../../widgets/loading_indicator.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<GalleryProvider>(context, listen: false).fetchGalleries();
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Innov8 Production'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              // TODO: Implement search
            },
          ),
          if (authProvider.isLoggedIn)
            IconButton(
              icon: const Icon(Icons.account_circle),
              onPressed: () {
                Get.toNamed(AppRoutes.profile);
              },
            )
          else
            TextButton(
              onPressed: () {
                Get.toNamed(AppRoutes.login);
              },
              child: const Text('Login'),
            ),
        ],
      ),
      body: _buildBody(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
          switch (index) {
            case 0:
              // Home - already here
              break;
            case 1:
              Get.toNamed(AppRoutes.gallery);
              break;
            case 2:
              Get.toNamed(AppRoutes.booking);
              break;
            case 3:
              Get.toNamed(AppRoutes.profile);
              break;
          }
        },
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.photo_library),
            label: 'Gallery',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today),
            label: 'Booking',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  Widget _buildBody() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Hero Section
          _buildHeroSection(),
          const SizedBox(height: 24),
          // Featured Galleries Section
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Featured Galleries',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                TextButton(
                  onPressed: () {
                    Get.toNamed(AppRoutes.gallery);
                  },
                  child: const Text('View All'),
                ),
              ],
            ),
          ),
          _buildFeaturedGalleries(),
          const SizedBox(height: 24),
          // Services Section
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Text(
              'Our Services',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ),
          const SizedBox(height: 16),
          _buildServicesSection(),
          const SizedBox(height: 24),
          // Quick Booking CTA
          _buildBookingCTA(),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildHeroSection() {
    return Container(
      height: 250,
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Theme.of(context).primaryColor,
            Theme.of(context).primaryColor.withOpacity(0.7),
          ],
        ),
      ),
      child: Stack(
        children: [
          // Background pattern
          Positioned.fill(
            child: Opacity(
              opacity: 0.1,
              child: Image.network(
                'https://via.placeholder.com/800x400',
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(),
              ),
            ),
          ),
          // Content
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Capturing Moments',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Creating Memories',
                  style: TextStyle(
                    fontSize: 20,
                    color: Colors.white70,
                  ),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () {
                    Get.toNamed(AppRoutes.booking);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: Theme.of(context).primaryColor,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 32,
                      vertical: 16,
                    ),
                  ),
                  child: const Text('Book Now'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeaturedGalleries() {
    return Consumer<GalleryProvider>(
      builder: (context, galleryProvider, child) {
        if (galleryProvider.isLoading) {
          return const LoadingIndicator(message: 'Loading galleries...');
        }

        if (galleryProvider.galleries.isEmpty) {
          return const Padding(
            padding: EdgeInsets.all(32.0),
            child: Center(
              child: Text('No galleries available'),
            ),
          );
        }

        final featuredGalleries = galleryProvider.galleries.take(4).toList();

        return SizedBox(
          height: 200,
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            scrollDirection: Axis.horizontal,
            itemCount: featuredGalleries.length,
            itemBuilder: (context, index) {
              final gallery = featuredGalleries[index];
              return GestureDetector(
                onTap: () {
                  Get.toNamed(
                    AppRoutes.galleryDetail,
                    arguments: {'id': gallery.id},
                  );
                },
                child: Container(
                  width: 160,
                  margin: const EdgeInsets.only(right: 16),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Stack(
                      children: [
                        Image.network(
                          gallery.coverImage,
                          fit: BoxFit.cover,
                          width: double.infinity,
                          height: double.infinity,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              color: Colors.grey[300],
                              child: const Icon(Icons.image, size: 50),
                            );
                          },
                        ),
                        Positioned(
                          bottom: 0,
                          left: 0,
                          right: 0,
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.bottomCenter,
                                end: Alignment.topCenter,
                                colors: [
                                  Colors.black.withOpacity(0.7),
                                  Colors.transparent,
                                ],
                              ),
                            ),
                            child: Text(
                              gallery.title,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildServicesSection() {
    final services = [
      {
        'icon': Icons.favorite,
        'title': 'Weddings',
        'description': 'Capture your special day',
      },
      {
        'icon': Icons.people,
        'title': 'Portraits',
        'description': 'Professional portraits',
      },
      {
        'icon': Icons.event,
        'title': 'Events',
        'description': 'Corporate & private events',
      },
    ];

    return SizedBox(
      height: 140,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16.0),
        scrollDirection: Axis.horizontal,
        itemCount: services.length,
        itemBuilder: (context, index) {
          final service = services[index];
          return Container(
            width: 160,
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).primaryColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  service['icon'] as IconData,
                  size: 40,
                  color: Theme.of(context).primaryColor,
                ),
                const SizedBox(height: 12),
                Text(
                  service['title'] as String,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  service['description'] as String,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildBookingCTA() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16.0),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Theme.of(context).primaryColor,
            Theme.of(context).primaryColor.withOpacity(0.8),
          ],
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'Ready to Book?',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  'Book your session today and capture unforgettable moments',
                  style: TextStyle(
                    color: Colors.white70,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          ElevatedButton(
            onPressed: () {
              Get.toNamed(AppRoutes.booking);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: Theme.of(context).primaryColor,
            ),
            child: const Text('Book Now'),
          ),
        ],
      ),
    );
  }
}
