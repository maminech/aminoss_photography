class Booking {
  final String id;
  final String userId;
  final String userName;
  final String userEmail;
  final String userPhone;
  final String serviceType;
  final DateTime date;
  final String time;
  final String status; // 'pending', 'confirmed', 'cancelled', 'completed'
  final String? notes;
  final double? price;
  final DateTime createdAt;

  Booking({
    required this.id,
    required this.userId,
    required this.userName,
    required this.userEmail,
    required this.userPhone,
    required this.serviceType,
    required this.date,
    required this.time,
    required this.status,
    this.notes,
    this.price,
    required this.createdAt,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'] ?? json['_id'] ?? '',
      userId: json['userId'] ?? json['user_id'] ?? '',
      userName: json['userName'] ?? json['user_name'] ?? '',
      userEmail: json['userEmail'] ?? json['user_email'] ?? '',
      userPhone: json['userPhone'] ?? json['user_phone'] ?? '',
      serviceType: json['serviceType'] ?? json['service_type'] ?? '',
      date: json['date'] != null ? DateTime.parse(json['date']) : DateTime.now(),
      time: json['time'] ?? '',
      status: json['status'] ?? 'pending',
      notes: json['notes'],
      price: json['price']?.toDouble(),
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'userName': userName,
      'userEmail': userEmail,
      'userPhone': userPhone,
      'serviceType': serviceType,
      'date': date.toIso8601String(),
      'time': time,
      'status': status,
      'notes': notes,
      'price': price,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  bool get isPending => status == 'pending';
  bool get isConfirmed => status == 'confirmed';
  bool get isCancelled => status == 'cancelled';
  bool get isCompleted => status == 'completed';
}
