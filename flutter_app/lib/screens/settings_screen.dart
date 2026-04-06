import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:provider/provider.dart';
import '../providers/finance_provider.dart';
import 'profile_dialog_helper.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  static const List<Map<String, String>> _currencies = [
    {'label': 'US Dollar (\$)', 'value': '\$'},
    {'label': 'Euro (€)', 'value': '€'},
    {'label': 'British Pound (£)', 'value': '£'},
    {'label': 'Indian Rupee (₹)', 'value': '₹'},
    {'label': 'Japanese Yen (¥)', 'value': '¥'}
  ];

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<FinanceProvider>();
    final isDarkMode = provider.themePreference == 'dark';
    final colors = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? const Color(0xFF2A2B31) : const Color(0xFFF0F0F0);
    final textColor = isDark ? Colors.white : Colors.black;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          children: [
            const Text(
              "Settings",
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 24),

            // Profile Section
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: cardColor,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Profile", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 28,
                        backgroundColor: const Color(0xFFB5FA0A).withOpacity(0.2),
                        child: Icon(ProfileDialogHelper.getGenderIcon(provider.gender), color: const Color(0xFFB5FA0A), size: 28),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              provider.firstName.isNotEmpty ? provider.firstName : 'User',
                              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: textColor),
                            ),
                            if (provider.occupation.isNotEmpty || provider.age.isNotEmpty)
                              Text(
                                [provider.age.isNotEmpty ? '${provider.age}y' : null, provider.occupation.isNotEmpty ? provider.occupation : null].where((e) => e != null).join(' • '),
                                style: TextStyle(color: isDark ? Colors.white60 : Colors.black54, fontSize: 13),
                              ),
                            const SizedBox(height: 4),
                            Text(
                              'Budget: ${provider.currency}${provider.monthlyBudget.toStringAsFixed(0)}/month',
                              style: TextStyle(color: isDark ? Colors.white60 : Colors.black54, fontSize: 14),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.edit, color: Color(0xFFB5FA0A)),
                        onPressed: () => ProfileDialogHelper.showProfileDialog(context, provider),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Preferences
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: cardColor,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Preferences", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 20),
                  
                  // App Theme
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text("App Theme", style: TextStyle(color: isDark ? Colors.white70 : Colors.black87, fontSize: 16)),
                      Row(
                        children: [
                          Text("Light", style: TextStyle(color: !isDarkMode ? const Color(0xFFB5FA0A) : Colors.grey, fontWeight: !isDarkMode ? FontWeight.bold : FontWeight.normal)),
                          Switch(
                            value: isDarkMode,
                            onChanged: (val) {
                              provider.toggleTheme(val ? 'dark' : 'light');
                            },
                            activeColor: Colors.teal,
                          ),
                          Text("Dark", style: TextStyle(color: isDarkMode ? const Color(0xFFB5FA0A) : Colors.grey, fontWeight: isDarkMode ? FontWeight.bold : FontWeight.normal)),
                        ],
                      )
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Currency Dropdown
                  Text("Default Currency", style: TextStyle(color: isDark ? Colors.white70 : Colors.black87, fontSize: 16)),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white : Colors.black,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        isExpanded: true,
                        dropdownColor: isDark ? Colors.white : Colors.black,
                        value: provider.currency,
                        icon: Icon(Icons.keyboard_arrow_down, color: isDark ? Colors.black : Colors.white),
                        onChanged: (String? newValue) {
                          if (newValue != null) {
                            provider.setCurrency(newValue);
                          }
                        },
                        items: _currencies.map<DropdownMenuItem<String>>((Map<String, String> curr) {
                          return DropdownMenuItem<String>(
                            value: curr['value'],
                            child: Text(
                              curr['label']!,
                              style: TextStyle(color: isDark ? Colors.black : Colors.white, fontSize: 16),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    "All dashboard and transaction values will be displayed with this currency placeholder.",
                    style: TextStyle(color: Color(0xFFB5FA0A), fontSize: 12),
                  )
                ],
              ),
            ),
            const SizedBox(height: 24),

            const SizedBox(height: 24),

            // Daily Reminder
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: cardColor,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("Daily Reminder", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Text("Ask to submit the day's expenses", style: TextStyle(color: isDark ? Colors.white60 : Colors.black54)),
                      ],
                    ),
                  ),
                  InkWell(
                    onTap: () async {
                      final parts = provider.dailyReminderTime.split(':');
                      TimeOfDay initialTime = const TimeOfDay(hour: 20, minute: 0);
                      if (parts.length == 2) {
                        initialTime = TimeOfDay(hour: int.parse(parts[0]), minute: int.parse(parts[1]));
                      }
                      final picked = await showTimePicker(context: context, initialTime: initialTime);
                      if (picked != null) {
                        final formattedTime = '${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}';
                        provider.setDailyReminderTime(formattedTime);
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: isDark ? Colors.black26 : Colors.black12,
                        borderRadius: BorderRadius.circular(12)
                      ),
                      child: Text(
                        provider.dailyReminderTime,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 120), // Space for bottom nav
          ],
        ),
      ),
    );
  }
}
