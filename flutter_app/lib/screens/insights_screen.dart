import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../providers/finance_provider.dart';

class InsightsScreen extends StatelessWidget {
  const InsightsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<FinanceProvider>();
    final colors = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final categoryBreakdown = provider.getCategoryBreakdown();
    final totalExpense = provider.getTotalExpenses();
    final totalIncome = provider.getTotalIncome();

    final chartColors = [
      const Color(0xFFB5FA0A),
      const Color(0xFFFFBE5D),
      const Color(0xFFFD5D5D),
      const Color(0xFF818CF8),
      const Color(0xFF10B981),
      const Color(0xFFF472B6),
      const Color(0xFF38BDF8),
      const Color(0xFFFBBF24),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Insights')),
      body: ListView(
        padding: const EdgeInsets.only(left: 16, right: 16, top: 8, bottom: 120),
        children: [
          // Summary Cards
          Row(
            children: [
              Expanded(
                child: _SummaryCard(
                  title: 'Income',
                  value: '+${provider.currency}${totalIncome.toStringAsFixed(0)}',
                  color: Colors.greenAccent,
                  icon: Icons.trending_up,
                  isDark: isDark,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _SummaryCard(
                  title: 'Expenses',
                  value: '-${provider.currency}${totalExpense.toStringAsFixed(0)}',
                  color: Colors.redAccent,
                  icon: Icons.trending_down,
                  isDark: isDark,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Savings Progress
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF22222C) : Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Savings Progress', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                const SizedBox(height: 16),
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: LinearProgressIndicator(
                    value: (provider.savingsCurrent / provider.savingsTarget).clamp(0.0, 1.0),
                    minHeight: 12,
                    backgroundColor: isDark ? Colors.white12 : Colors.grey[200],
                    valueColor: const AlwaysStoppedAnimation(Color(0xFFB5FA0A)),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${provider.currency}${provider.savingsCurrent.toStringAsFixed(0)} / ${provider.currency}${provider.savingsTarget.toStringAsFixed(0)}',
                  style: TextStyle(color: colors.onSurface.withOpacity(0.6)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Budget Usage
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF22222C) : Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Budget Usage', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                const SizedBox(height: 16),
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: LinearProgressIndicator(
                    value: provider.monthlyBudget > 0 ? (totalExpense / provider.monthlyBudget).clamp(0.0, 1.0) : 0,
                    minHeight: 12,
                    backgroundColor: isDark ? Colors.white12 : Colors.grey[200],
                    valueColor: AlwaysStoppedAnimation(
                      totalExpense > provider.monthlyBudget ? Colors.redAccent : const Color(0xFFFFBE5D),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${provider.currency}${totalExpense.toStringAsFixed(0)} / ${provider.currency}${provider.monthlyBudget.toStringAsFixed(0)}',
                  style: TextStyle(color: colors.onSurface.withOpacity(0.6)),
                ),
                if (totalExpense > provider.monthlyBudget)
                  const Padding(
                    padding: EdgeInsets.only(top: 8),
                    child: Text('⚠️ Over budget!', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Category Breakdown (Pie Chart)
          if (categoryBreakdown.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF22222C) : Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Spending by Category', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                  const SizedBox(height: 16),
                  SizedBox(
                    height: 200,
                    child: PieChart(
                      PieChartData(
                        sectionsSpace: 2,
                        centerSpaceRadius: 40,
                        sections: categoryBreakdown.entries.toList().asMap().entries.map((entry) {
                          final idx = entry.key;
                          final e = entry.value;
                          final percent = totalExpense > 0 ? (e.value / totalExpense * 100) : 0.0;
                          return PieChartSectionData(
                            color: chartColors[idx % chartColors.length],
                            value: e.value,
                            title: '${percent.toStringAsFixed(0)}%',
                            titleStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black),
                            radius: 50,
                          );
                        }).toList(),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Legend
                  Wrap(
                    spacing: 12,
                    runSpacing: 8,
                    children: categoryBreakdown.entries.toList().asMap().entries.map((entry) {
                      final idx = entry.key;
                      final e = entry.value;
                      return Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(width: 12, height: 12, decoration: BoxDecoration(
                            color: chartColors[idx % chartColors.length],
                            borderRadius: BorderRadius.circular(3),
                          )),
                          const SizedBox(width: 6),
                          Text('${e.key}: ${provider.currency}${e.value.toStringAsFixed(0)}',
                            style: TextStyle(fontSize: 13, color: colors.onSurface.withOpacity(0.7)),
                          ),
                        ],
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
          ] else ...[
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF22222C) : Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  Icon(Icons.pie_chart_outline, size: 48, color: colors.onSurface.withOpacity(0.3)),
                  const SizedBox(height: 12),
                  Text('Add expenses to see category breakdown',
                    style: TextStyle(color: colors.onSurface.withOpacity(0.5)),
                  ),
                ],
              ),
            ),
          ],

          // Highest Spending Category
          if (categoryBreakdown.isNotEmpty) ...[
            const SizedBox(height: 24),
            Builder(builder: (context) {
              final sorted = categoryBreakdown.entries.toList()..sort((a, b) => b.value.compareTo(a.value));
              final top = sorted.first;
              return Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [const Color(0xFFFFBE5D).withOpacity(0.2), const Color(0xFFFD5D5D).withOpacity(0.2)],
                  ),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFFFBE5D).withOpacity(0.4)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.warning_amber_rounded, color: Color(0xFFFFBE5D), size: 32),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Highest Spending', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          const SizedBox(height: 4),
                          Text(
                            '${top.key}: ${provider.currency}${top.value.toStringAsFixed(0)}',
                            style: TextStyle(color: colors.onSurface.withOpacity(0.7)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ],
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final String title;
  final String value;
  final Color color;
  final IconData icon;
  final bool isDark;

  const _SummaryCard({
    required this.title,
    required this.value,
    required this.color,
    required this.icon,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF22222C) : Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 12),
          Text(title, style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6), fontSize: 14)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20, color: color)),
        ],
      ),
    );
  }
}
