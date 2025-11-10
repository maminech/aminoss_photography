class Gallery {
  final String id;
  final String title;
  final String description;
  final String category;
  final String coverImage;
  final List<GalleryItem> items;
  final DateTime createdAt;
  final bool isPublic;

  Gallery({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.coverImage,
    required this.items,
    required this.createdAt,
    this.isPublic = true,
  });

  factory Gallery.fromJson(Map<String, dynamic> json) {
    return Gallery(
      id: json['id'] ?? json['_id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? 'Uncategorized',
      coverImage: json['coverImage'] ?? json['cover_image'] ?? '',
      items: json['items'] != null
          ? (json['items'] as List)
              .map((item) => GalleryItem.fromJson(item))
              .toList()
          : [],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      isPublic: json['isPublic'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'category': category,
      'coverImage': coverImage,
      'items': items.map((item) => item.toJson()).toList(),
      'createdAt': createdAt.toIso8601String(),
      'isPublic': isPublic,
    };
  }
}

class GalleryItem {
  final String id;
  final String url;
  final String type; // 'image' or 'video'
  final String? thumbnail;
  final int order;

  GalleryItem({
    required this.id,
    required this.url,
    required this.type,
    this.thumbnail,
    this.order = 0,
  });

  factory GalleryItem.fromJson(Map<String, dynamic> json) {
    return GalleryItem(
      id: json['id'] ?? json['_id'] ?? '',
      url: json['url'] ?? '',
      type: json['type'] ?? 'image',
      thumbnail: json['thumbnail'],
      order: json['order'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'url': url,
      'type': type,
      'thumbnail': thumbnail,
      'order': order,
    };
  }

  bool get isVideo => type == 'video';
  bool get isImage => type == 'image';
}
