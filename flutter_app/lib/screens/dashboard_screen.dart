import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:math';
import 'dart:async';
import '../providers/finance_provider.dart';
import 'add_edit_transaction_screen.dart';
import 'profile_dialog_helper.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Timer? _timer;
  String _currentQuote = "";

  final List<String> _quotes = [
    "A budget is telling your money where to go instead of wondering where it went.",
    "Do not save what is left after spending, but spend what is left after saving.",
    "The habit of saving is itself an education.",
    "Every coin counts.",
    "Small steps every day lead to big financial leaps."
  ];

  @override
  void initState() {
    super.initState();
    _currentQuote = _quotes[Random().nextInt(_quotes.length)];
    // Change quote every 2 minutes
    _timer = Timer.periodic(const Duration(minutes: 2), (timer) {
      if (mounted) {
        setState(() {
          String newQuote;
          do {
            newQuote = _quotes[Random().nextInt(_quotes.length)];
          } while (newQuote == _currentQuote);
          _currentQuote = newQuote;
        });
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  Widget _buildWeekStreak(FinanceProvider provider) {
    // Generate dates for current week: Sunday to Saturday
    DateTime now = DateTime.now();
    int currentWeekday = now.weekday; // 1 = Monday, 7 = Sunday
    // Adjust to make Sunday the start of the week (0 = Sunday, 1 = Monday...)
    int numDaysFromSunday = currentWeekday == 7 ? 0 : currentWeekday;
    DateTime startOfWeek = now.subtract(Duration(days: numDaysFromSunday));

    List<Widget> daysWidgets = [];
    final weekDaysLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    for (int i = 0; i < 7; i++) {
      DateTime dayDate = startOfWeek.add(Duration(days: i));
      String dateStr = "${dayDate.year}-${dayDate.month.toString().padLeft(2, '0')}-${dayDate.day.toString().padLeft(2, '0')}";
      
      bool hasExpense = false;
      bool hasIncome = false;

      for (var txn in provider.transactions) {
        if (txn.date == dateStr) {
          if (txn.type == 'expense') hasExpense = true;
          if (txn.type == 'income') hasIncome = true;
        }
      }

      // No expense, just income
      bool showsTree = !hasExpense && hasIncome;
      bool isToday = dayDate.year == now.year && dayDate.month == now.month && dayDate.day == now.day;

      daysWidgets.add(
        Expanded(
          child: Column(
            children: [
              Text(
                weekDaysLabels[i],
                style: TextStyle(
                  color: isToday ? const Color(0xFFB5FA0A) : Colors.white60,
                  fontWeight: isToday ? FontWeight.bold : FontWeight.normal,
                ),
              ),
              const SizedBox(height: 8),
              if (showsTree)
                const Text("🌳", style: TextStyle(fontSize: 18))
              else
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isToday ? Colors.white24 : Colors.transparent,
                  ),
                )
            ],
          ),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 24),
      decoration: BoxDecoration(color: const Color(0xFF2A2B31), borderRadius: BorderRadius.circular(20)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Weekly Streak", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: daysWidgets,
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<FinanceProvider>();
    final balance = provider.getCurrentBalance();
    final income = provider.getTotalIncome();
    final expense = provider.getTotalExpenses();

    return Scaffold(
      backgroundColor: const Color(0xFF16151A), // Dark mode background
      body: Stack(
        children: [
          // Elegant Header Background
          Positioned(
            top: 0, left: 0, right: 0,
            height: 320,
            child: Container(
              decoration: const BoxDecoration(
                color: Color(0xFF2A2A32),
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.elliptical(250, 40),
                  bottomRight: Radius.elliptical(250, 40)
                )
              ),
            ),
          ),
          SafeArea(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              children: [
                // Top App Bar
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text("Dashboard", style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                    GestureDetector(
                      onTap: () {
                        ProfileDialogHelper.showProfileDialog(context, provider);
                      },
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 18,
                            backgroundColor: Colors.white24,
                            child: Icon(ProfileDialogHelper.getGenderIcon(provider.gender), color: Colors.white, size: 20),
                          ),
                          const SizedBox(width: 8),
                          Text(provider.firstName.isNotEmpty ? provider.firstName : "User", style: const TextStyle(color: Colors.white, fontSize: 16)),
                          const Icon(Icons.keyboard_arrow_down, color: Colors.white, size: 20)
                        ],
                      ),
                    )
                  ],
                ),
                const SizedBox(height: 36),
                
                // Greeting and Quote
                Column(
                  children: [
                    Text(
                      provider.firstName.isNotEmpty ? "${getGreeting()}, ${provider.firstName} 👋" : "${getGreeting()} 👋",
                      style: const TextStyle(color: Color(0xFFF0E6D2), fontSize: 28, fontFamily: 'Georgia', fontWeight: FontWeight.normal),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      _currentQuote,
                      style: const TextStyle(color: Color(0xFFD4B16A), fontSize: 16, fontFamily: 'Georgia', fontStyle: FontStyle.italic, letterSpacing: 1.1),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
                const SizedBox(height: 48),

                // Top Grid
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 20),
                        decoration: BoxDecoration(color: const Color(0xFFB5FA0A), borderRadius: BorderRadius.circular(24)),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text("Total Balance", style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w600, fontSize: 16)),
                            const SizedBox(height: 12),
                            Text("${provider.currency}${balance.toStringAsFixed(0)}", style: const TextStyle(color: Colors.black, fontSize: 36, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        children: [
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(color: const Color(0xFF2A2B31), borderRadius: BorderRadius.circular(20)),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text("Income", style: TextStyle(color: Colors.white60, fontSize: 14, fontWeight: FontWeight.w500)),
                                const SizedBox(height: 8),
                                Text("+${provider.currency}${income.toStringAsFixed(0)}", style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(color: const Color(0xFFFFBE5D), borderRadius: BorderRadius.circular(20)),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text("Expenses", style: TextStyle(color: Colors.black87, fontSize: 14, fontWeight: FontWeight.w500)),
                                const SizedBox(height: 8),
                                Text("-${provider.currency}${expense.toStringAsFixed(0)}", style: const TextStyle(color: Colors.black, fontSize: 24, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                _buildWeekStreak(provider),
                const SizedBox(height: 24),

                // Add blank space for fab and bottom nav
                const SizedBox(height: 120),
              ],
            ),
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
                  Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AddEditTransactionScreen()));
                },
                backgroundColor: const Color(0xFFB5FA0A),
                child: const Icon(Icons.add, color: Colors.black, size: 32),
              ),
            ),
          )
        ],
      ),
    );
  }
}
