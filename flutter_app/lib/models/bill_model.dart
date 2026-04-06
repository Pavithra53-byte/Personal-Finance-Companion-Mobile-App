class BillModel {
  String id;
  String title;
  double amount;
  String date; // YYYY-MM-DD
  String time;

  BillModel({
    required this.id,
    required this.title,
    required this.amount,
    required this.date,
    required this.time,
  });

  factory BillModel.fromMap(Map<String, dynamic> data, String documentId) {
    return BillModel(
      id: documentId,
      title: data['title'] ?? '',
      amount: (data['amount'] ?? 0).toDouble(),
      date: data['date'] ?? '',
      time: data['time'] ?? '12:00',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'title': title,
      'amount': amount,
      'date': date,
      'time': time,
    };
  }
}
