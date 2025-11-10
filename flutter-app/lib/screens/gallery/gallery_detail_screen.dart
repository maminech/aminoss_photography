import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:provider/provider.dart';
import 'package:photo_view/photo_view.dart';
import 'package:photo_view/photo_view_gallery.dart';
import '../../providers/gallery_provider.dart';
import '../../widgets/loading_indicator.dart';

class GalleryDetailScreen extends StatefulWidget {
  const GalleryDetailScreen({super.key});

  @override
  State<GalleryDetailScreen> createState() => _GalleryDetailScreenState();
}

class _GalleryDetailScreenState extends State<GalleryDetailScreen> {
  late PageController _pageController;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    final args = Get.arguments as Map<String, dynamic>;
    final galleryId = args['id'];
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<GalleryProvider>(context, listen: false)
          .fetchGalleryById(galleryId);
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: Consumer<GalleryProvider>(
          builder: (context, provider, child) {
            if (provider.selectedGallery != null) {
              return Text(
                '${_currentIndex + 1} / ${provider.selectedGallery!.items.length}',
              );
            }
            return const Text('Gallery');
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () {
              // TODO: Implement share
            },
          ),
          IconButton(
            icon: const Icon(Icons.download),
            onPressed: () {
              // TODO: Implement download
            },
          ),
        ],
      ),
      body: Consumer<GalleryProvider>(
        builder: (context, galleryProvider, child) {
          if (galleryProvider.isLoading) {
            return const LoadingIndicator(message: 'Loading gallery...');
          }

          final gallery = galleryProvider.selectedGallery;
          if (gallery == null) {
            return const Center(
              child: Text(
                'Gallery not found',
                style: TextStyle(color: Colors.white),
              ),
            );
          }

          if (gallery.items.isEmpty) {
            return const Center(
              child: Text(
                'No photos in this gallery',
                style: TextStyle(color: Colors.white),
              ),
            );
          }

          return Column(
            children: [
              // Main Photo View
              Expanded(
                child: PhotoViewGallery.builder(
                  scrollPhysics: const BouncingScrollPhysics(),
                  builder: (BuildContext context, int index) {
                    final item = gallery.items[index];
                    return PhotoViewGalleryPageOptions(
                      imageProvider: NetworkImage(item.url),
                      initialScale: PhotoViewComputedScale.contained,
                      minScale: PhotoViewComputedScale.contained,
                      maxScale: PhotoViewComputedScale.covered * 2,
                    );
                  },
                  itemCount: gallery.items.length,
                  loadingBuilder: (context, event) => Center(
                    child: SizedBox(
                      width: 30.0,
                      height: 30.0,
                      child: CircularProgressIndicator(
                        value: event == null
                            ? 0
                            : event.cumulativeBytesLoaded /
                                (event.expectedTotalBytes ?? 1),
                      ),
                    ),
                  ),
                  pageController: _pageController,
                  onPageChanged: (index) {
                    setState(() {
                      _currentIndex = index;
                    });
                  },
                ),
              ),
              // Thumbnail Strip
              Container(
                height: 80,
                color: Colors.black87,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.all(8),
                  itemCount: gallery.items.length,
                  itemBuilder: (context, index) {
                    final item = gallery.items[index];
                    final isSelected = index == _currentIndex;
                    return GestureDetector(
                      onTap: () {
                        _pageController.animateToPage(
                          index,
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeInOut,
                        );
                      },
                      child: Container(
                        width: 60,
                        margin: const EdgeInsets.only(right: 8),
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: isSelected ? Colors.white : Colors.transparent,
                            width: 2,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(6),
                          child: Image.network(
                            item.thumbnail ?? item.url,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                color: Colors.grey[800],
                                child: const Icon(
                                  Icons.image,
                                  color: Colors.white,
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
