import 'package:flutter/material.dart';

class ServicesScreen extends StatelessWidget {
  const ServicesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final services = [
      {
        'title': 'Wedding Photography',
        'description': 'Complete wedding day coverage with high-quality photos',
        'price': '\$1,500 - \$3,000',
        'icon': Icons.favorite,
        'features': [
          '8-10 hours coverage',
          '500+ edited photos',
          'Online gallery',
          'Print rights',
        ],
      },
      {
        'title': 'Portrait Session',
        'description': 'Professional portrait photography for individuals or families',
        'price': '\$200 - \$500',
        'icon': Icons.person,
        'features': [
          '1-2 hours session',
          '30+ edited photos',
          'Online gallery',
          'Print rights',
        ],
      },
      {
        'title': 'Event Coverage',
        'description': 'Corporate events, parties, and special occasions',
        'price': '\$500 - \$1,500',
        'icon': Icons.event,
        'features': [
          '3-6 hours coverage',
          '200+ edited photos',
          'Online gallery',
          'Same-day highlights',
        ],
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Our Services'),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: services.length,
        itemBuilder: (context, index) {
          final service = services[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Theme.of(context).primaryColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          service['icon'] as IconData,
                          size: 32,
                          color: Theme.of(context).primaryColor,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              service['title'] as String,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              service['price'] as String,
                              style: TextStyle(
                                color: Theme.of(context).primaryColor,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    service['description'] as String,
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Includes:',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  ...(service['features'] as List).map((feature) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Row(
                        children: [
                          Icon(
                            Icons.check_circle,
                            size: 16,
                            color: Colors.green[600],
                          ),
                          const SizedBox(width: 8),
                          Text(feature as String),
                        ],
                      ),
                    );
                  }).toList(),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        // TODO: Navigate to booking
                      },
                      child: const Text('Book Now'),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
