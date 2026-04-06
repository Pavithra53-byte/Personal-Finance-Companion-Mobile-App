class TransactionModel {
  String id;
  String title;
  double amount;
  String type; // 'income' or 'expense'
  String category;
  String date; // YYYY-MM-DD
  String? notes;

  TransactionModel({
    required this.id,
    required this.title,
    required this.amount,
    required this.type,
    required this.category,
    required this.date,
    this.notes,
  });

  factory TransactionModel.fromMap(Map<String, dynamic> data, String documentId) {
    return TransactionModel(
      id: documentId.isNotEmpty ? documentId : (data['id'] ?? ''),
      title: data['title'] ?? '',
      amount: (data['amount'] ?? 0).toDouble(),
      type: data['type'] ?? 'expense',
      category: data['category'] ?? '',
      date: data['date'] ?? '',
      notes: data['notes'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'title': title,
      'amount': amount,
      'type': type,
      'category': category,
      'date': date,
      'notes': notes,
    };
  }
}
