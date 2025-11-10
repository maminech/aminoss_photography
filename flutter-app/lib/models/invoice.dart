class Invoice {
  final String id;
  final String bookingId;
  final String clientName;
  final String clientEmail;
  final double amount;
  final String status; // 'pending', 'paid', 'overdue', 'cancelled'
  final DateTime dueDate;
  final DateTime? paidDate;
  final List<InvoiceItem> items;
  final String? notes;
  final DateTime createdAt;

  Invoice({
    required this.id,
    required this.bookingId,
    required this.clientName,
    required this.clientEmail,
    required this.amount,
    required this.status,
    required this.dueDate,
    this.paidDate,
    required this.items,
    this.notes,
    required this.createdAt,
  });

  factory Invoice.fromJson(Map<String, dynamic> json) {
    return Invoice(
      id: json['id'] ?? json['_id'] ?? '',
      bookingId: json['bookingId'] ?? json['booking_id'] ?? '',
      clientName: json['clientName'] ?? json['client_name'] ?? '',
      clientEmail: json['clientEmail'] ?? json['client_email'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      status: json['status'] ?? 'pending',
      dueDate: json['dueDate'] != null
          ? DateTime.parse(json['dueDate'])
          : DateTime.now(),
      paidDate: json['paidDate'] != null ? DateTime.parse(json['paidDate']) : null,
      items: json['items'] != null
          ? (json['items'] as List)
              .map((item) => InvoiceItem.fromJson(item))
              .toList()
          : [],
      notes: json['notes'],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'bookingId': bookingId,
      'clientName': clientName,
      'clientEmail': clientEmail,
      'amount': amount,
      'status': status,
      'dueDate': dueDate.toIso8601String(),
      'paidDate': paidDate?.toIso8601String(),
      'items': items.map((item) => item.toJson()).toList(),
      'notes': notes,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  bool get isPending => status == 'pending';
  bool get isPaid => status == 'paid';
  bool get isOverdue => status == 'overdue';
}

class InvoiceItem {
  final String description;
  final int quantity;
  final double price;
  final double total;

  InvoiceItem({
    required this.description,
    required this.quantity,
    required this.price,
    required this.total,
  });

  factory InvoiceItem.fromJson(Map<String, dynamic> json) {
    return InvoiceItem(
      description: json['description'] ?? '',
      quantity: json['quantity'] ?? 1,
      price: (json['price'] ?? 0).toDouble(),
      total: (json['total'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'description': description,
      'quantity': quantity,
      'price': price,
      'total': total,
    };
  }
}
