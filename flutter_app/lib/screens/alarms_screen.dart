import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/finance_provider.dart';
import '../theme/app_theme.dart';
import '../models/alarm_model.dart';
import 'add_edit_alarm_screen.dart';

class AlarmsScreen extends StatelessWidget {
  const AlarmsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<FinanceProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: Stack(
          children: [
            ListView(
              padding: const EdgeInsets.all(24),
              children: [
                const Text(
                  "Alarms",
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 36),
                const Text(
                  "Daily Alarms",
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 24),
                if (provider.alarms.isEmpty)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.only(top: 40.0),
                      child: Text("No alarms added.", style: TextStyle(color: Colors.grey)),
                    ),
                  ),
                ...provider.alarms.map((alarm) => _buildAlarmCard(context, alarm, provider, isDark)).toList(),
                const SizedBox(height: 120),
              ],
            ),
            Positioned(
              bottom: 104,
              right: 24,
              child: Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(color: const Color(0xFFB5FA0A).withOpacity(0.4), blurRadius: 16, spreadRadius: 4),
                  ]
                ),
                child: FloatingActionButton(
                  onPressed: () {
                    Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AddEditAlarmScreen()));
                  },
                  backgroundColor: const Color(0xFFB5FA0A),
                  child: const Icon(Icons.add, color: Colors.black, size: 32),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildAlarmCard(BuildContext context, AlarmModel alarm, FinanceProvider provider, bool isDark) {
    final cardColor = isDark ? const Color(0xFF2A2B31) : AppTheme.lightSurface;
    final textColor = isDark ? Colors.white : Colors.black;
    final primaryColor = const Color(0xFFB5FA0A);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                alarm.time,
                style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: textColor),
              ),
              Switch(
                value: alarm.enabled,
                onChanged: (val) {
                  alarm.enabled = val;
                  provider.updateAlarm(alarm);
                },
                activeColor: Colors.teal,
              )
            ],
          ),
          const SizedBox(height: 8),
          Text(
            alarm.name,
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: textColor),
          ),
          if (alarm.date != null && alarm.date!.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              alarm.date!,
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: primaryColor),
            ),
          ],
          if (alarm.description != null && alarm.description!.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              alarm.description!,
              style: TextStyle(fontSize: 14, color: isDark ? Colors.white70 : Colors.black54),
            ),
          ],
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              GestureDetector(
                onTap: () {
                  Navigator.of(context).push(MaterialPageRoute(builder: (_) => AddEditAlarmScreen(alarm: alarm)));
                },
                child: const Icon(Icons.edit, color: Color(0xFFB5FA0A), size: 20),
              ),
              const SizedBox(width: 16),
              GestureDetector(
                onTap: () async {
                  final confirm = await showDialog<bool>(
                    context: context,
                    builder: (BuildContext context) {
                      return AlertDialog(
                        title: const Text("Confirm Delete"),
                        content: const Text("This alarm will be deleted permanently. Are you sure you want to continue?"),
                        actions: [
                          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text("Cancel")),
                          ElevatedButton(
                            onPressed: () => Navigator.of(context).pop(true),
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent, foregroundColor: Colors.white),
                            child: const Text("Delete"),
                          ),
                        ],
                      );
                    },
                  );
                  if (confirm == true) {
                    provider.deleteAlarm(alarm.id);
                  }
                },
                child: const Icon(Icons.delete, color: Colors.redAccent, size: 20),
              ),
            ],
          )
        ],
      ),
    );
  }
}
