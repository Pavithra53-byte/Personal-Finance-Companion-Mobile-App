class AlarmModel {
  String id;
  String name;
  String time;
  String? description;
  String? date;
  bool enabled;

  AlarmModel({
    required this.id,
    required this.name,
    required this.time,
    this.description,
    this.date,
    this.enabled = true,
  });

  factory AlarmModel.fromMap(Map<String, dynamic> data, String documentId) {
    return AlarmModel(
      id: documentId.isNotEmpty ? documentId : (data['id'] ?? ''),
      name: data['name'] ?? '',
      time: data['time'] ?? '08:00',
      description: data['description'],
      date: data['date'],
      enabled: data['enabled'] ?? true,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'time': time,
      'description': description,
      'date': date,
      'enabled': enabled,
    };
  }
}
