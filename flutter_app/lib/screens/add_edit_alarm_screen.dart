import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/finance_provider.dart';
import '../models/alarm_model.dart';
import '../theme/app_theme.dart';

class AddEditAlarmScreen extends StatefulWidget {
  final AlarmModel? alarm;
  const AddEditAlarmScreen({Key? key, this.alarm}) : super(key: key);

  @override
  State<AddEditAlarmScreen> createState() => _AddEditAlarmScreenState();
}

class _AddEditAlarmScreenState extends State<AddEditAlarmScreen> {
  late TextEditingController _nameController;
  late TextEditingController _descController;
  late TextEditingController _dateController;
  TimeOfDay _time = const TimeOfDay(hour: 8, minute: 0);

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.alarm?.name ?? '');
    _descController = TextEditingController(text: widget.alarm?.description ?? '');
    _dateController = TextEditingController(text: widget.alarm?.date ?? '');
    if (widget.alarm != null) {
      final parts = widget.alarm!.time.split(':');
      if (parts.length == 2) {
        _time = TimeOfDay(hour: int.parse(parts[0]), minute: int.parse(parts[1]));
      }
    }
  }

  Future<void> _selectTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _time,
    );
    if (picked != null) {
      setState(() {
        _time = picked;
      });
    }
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365 * 5)),
    );
    if (picked != null) {
      setState(() {
        _dateController.text = "${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}";
      });
    }
  }

  void _save() {
    final provider = context.read<FinanceProvider>();
    final timeStr = "${_time.hour.toString().padLeft(2, '0')}:${_time.minute.toString().padLeft(2, '0')}";
    
    if (widget.alarm != null) {
      provider.updateAlarm(AlarmModel(
        id: widget.alarm!.id,
        name: _nameController.text.isEmpty ? 'Alarm' : _nameController.text,
        time: timeStr,
        description: _descController.text,
        date: _dateController.text,
        enabled: widget.alarm!.enabled,
      ));
    } else {
      provider.addAlarm(AlarmModel(
        id: '',
        name: _nameController.text.isEmpty ? 'Alarm' : _nameController.text,
        time: timeStr,
        description: _descController.text,
        date: _dateController.text,
        enabled: true,
      ));
    }
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? const Color(0xFF2A2B31) : AppTheme.lightSurface;
    
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.alarm != null ? 'Edit Alarm' : 'New Alarm'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            GestureDetector(
              onTap: _selectTime,
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 20),
                decoration: BoxDecoration(
                  color: cardColor,
                  borderRadius: BorderRadius.circular(16)
                ),
                child: Center(
                  child: Text(
                    "${_time.hour.toString().padLeft(2, '0')}:${_time.minute.toString().padLeft(2, '0')}",
                    style: const TextStyle(fontSize: 48, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Alarm Name',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _descController,
              decoration: const InputDecoration(
                labelText: 'Description (Optional)',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            GestureDetector(
              onTap: _selectDate,
              child: AbsorbPointer(
                child: TextField(
                  controller: _dateController,
                  decoration: const InputDecoration(
                    labelText: 'Date (Optional)',
                    border: OutlineInputBorder(),
                    suffixIcon: Icon(Icons.calendar_today),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFB5FA0A),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                onPressed: _save,
                child: const Text('Save Alarm', style: TextStyle(color: Colors.black, fontSize: 18, fontWeight: FontWeight.bold)),
              ),
            )
          ],
        ),
      ),
    );
  }
}
