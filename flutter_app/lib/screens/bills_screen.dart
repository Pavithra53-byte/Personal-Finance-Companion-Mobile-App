import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/finance_provider.dart';
import '../models/bill_model.dart';
import 'package:intl/intl.dart';

class BillsScreen extends StatelessWidget {
  const BillsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<FinanceProvider>();
    final bills = provider.upcomingBills;
    final colors = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Bills & Reminders'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            onPressed: () => _showAddBillDialog(context, provider),
          ),
        ],
      ),
      body: bills.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.receipt_outlined, size: 64, color: colors.onSurface.withOpacity(0.3)),
                  const SizedBox(height: 16),
                  Text('No bills tracked yet', style: TextStyle(fontSize: 18, color: colors.onSurface.withOpacity(0.5))),
                  const SizedBox(height: 8),
                  Text('Tap + to add a bill reminder', style: TextStyle(fontSize: 14, color: colors.onSurface.withOpacity(0.4))),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.only(left: 16, right: 16, top: 8, bottom: 120),
              itemCount: bills.length,
              itemBuilder: (context, index) {
                final bill = bills[index];
                return Dismissible(
                  key: Key(bill.id),
                  direction: DismissDirection.endToStart,
                  background: Container(
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 20),
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(color: Colors.redAccent, borderRadius: BorderRadius.circular(16)),
                    child: const Icon(Icons.delete, color: Colors.white),
                  ),
                  confirmDismiss: (direction) async {
                    return await showDialog(
                      context: context,
                      builder: (BuildContext context) {
                        return AlertDialog(
                          title: const Text("Confirm Delete"),
                          content: const Text("The bill reminder will be deleted permanently. Are you sure you want to continue?"),
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
                  },
                  onDismissed: (_) => provider.deleteBill(bill.id),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF22222C) : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: colors.outline.withOpacity(0.1)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 48, height: 48,
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFBE5D).withOpacity(0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.receipt, color: Color(0xFFFFBE5D)),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(bill.title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                              const SizedBox(height: 4),
                              Text(
                                'Due: ${bill.date} at ${bill.time}',
                                style: TextStyle(fontSize: 13, color: colors.onSurface.withOpacity(0.5)),
                              ),
                            ],
                          ),
                        ),
                        Text(
                          '${provider.currency}${bill.amount.toStringAsFixed(0)}',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFFFFBE5D)),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }

  void _showAddBillDialog(BuildContext context, FinanceProvider provider) {
    final titleController = TextEditingController();
    final amountController = TextEditingController();
    String selectedDate = DateFormat('yyyy-MM-dd').format(DateTime.now());
    String selectedTime = '12:00';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Add Bill Reminder'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: titleController,
                  decoration: const InputDecoration(labelText: 'Bill Name', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: amountController,
                  decoration: const InputDecoration(labelText: 'Amount', border: OutlineInputBorder(), prefixText: '\$ '),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 16),
                InkWell(
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: ctx,
                      initialDate: DateTime.now(),
                      firstDate: DateTime(2000),
                      lastDate: DateTime(2100),
                    );
                    if (picked != null) {
                      setDialogState(() {
                        selectedDate = DateFormat('yyyy-MM-dd').format(picked);
                      });
                    }
                  },
                  child: InputDecorator(
                    decoration: const InputDecoration(labelText: 'Due Date', border: OutlineInputBorder()),
                    child: Text(selectedDate),
                  ),
                ),
                const SizedBox(height: 16),
                InkWell(
                  onTap: () async {
                    final picked = await showTimePicker(context: ctx, initialTime: TimeOfDay.now());
                    if (picked != null) {
                      setDialogState(() {
                        selectedTime = '${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}';
                      });
                    }
                  },
                  child: InputDecorator(
                    decoration: const InputDecoration(labelText: 'Time', border: OutlineInputBorder()),
                    child: Text(selectedTime),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () {
                if (titleController.text.isNotEmpty && amountController.text.isNotEmpty) {
                  provider.addBill(BillModel(
                    id: '',
                    title: titleController.text,
                    amount: double.tryParse(amountController.text) ?? 0,
                    date: selectedDate,
                    time: selectedTime,
                  ));
                  Navigator.pop(ctx);
                }
              },
              child: const Text('Add'),
            ),
          ],
        ),
      ),
    );
  }
}
