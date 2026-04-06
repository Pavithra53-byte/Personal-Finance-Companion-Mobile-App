import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/finance_provider.dart';
import '../models/transaction_model.dart';
import 'add_edit_transaction_screen.dart';
import 'package:intl/intl.dart';

class TransactionsScreen extends StatelessWidget {
  const TransactionsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<FinanceProvider>();
    final transactions = provider.transactions;
    final colors = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Transactions'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const AddEditTransactionScreen()));
            },
          ),
        ],
      ),
      body: transactions.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.receipt_long_outlined, size: 64, color: colors.onSurface.withOpacity(0.3)),
                  const SizedBox(height: 16),
                  Text(
                    'No transactions yet',
                    style: TextStyle(fontSize: 18, color: colors.onSurface.withOpacity(0.5)),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Tap + to add your first transaction',
                    style: TextStyle(fontSize: 14, color: colors.onSurface.withOpacity(0.4)),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.only(left: 16, right: 16, top: 8, bottom: 120),
              itemCount: transactions.length,
              itemBuilder: (context, index) {
                final txn = transactions[index];
                final isIncome = txn.type == 'income';
                return Dismissible(
                  key: Key(txn.id),
                  direction: DismissDirection.endToStart,
                  background: Container(
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 20),
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                      color: Colors.redAccent,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(Icons.delete, color: Colors.white),
                  ),
                  confirmDismiss: (direction) async {
                    return await showDialog(
                      context: context,
                      builder: (BuildContext context) {
                        return AlertDialog(
                          title: const Text("Confirm Delete"),
                          content: const Text("The transaction will be deleted permanently. Are you sure you want to continue?"),
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
                  onDismissed: (_) => provider.deleteTransaction(txn.id),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF22222C) : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: colors.outline.withOpacity(0.1)),
                    ),
                    child: InkWell(
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(
                          builder: (_) => AddEditTransactionScreen(transaction: txn),
                        ));
                      },
                      child: Row(
                        children: [
                          Container(
                            width: 48, height: 48,
                            decoration: BoxDecoration(
                              color: isIncome
                                  ? Colors.greenAccent.withOpacity(0.15)
                                  : Colors.redAccent.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              isIncome ? Icons.arrow_downward : Icons.arrow_upward,
                              color: isIncome ? Colors.greenAccent : Colors.redAccent,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(txn.title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                                const SizedBox(height: 4),
                                Text(
                                  '${txn.category} • ${txn.date}',
                                  style: TextStyle(fontSize: 13, color: colors.onSurface.withOpacity(0.5)),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            '${isIncome ? '+' : '-'}${provider.currency}${txn.amount.toStringAsFixed(0)}',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                              color: isIncome ? Colors.greenAccent : Colors.redAccent,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
