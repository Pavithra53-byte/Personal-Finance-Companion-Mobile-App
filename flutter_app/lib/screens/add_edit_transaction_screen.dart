import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/finance_provider.dart';
import '../models/transaction_model.dart';
import 'package:intl/intl.dart';

class AddEditTransactionScreen extends StatefulWidget {
  final TransactionModel? transaction;
  const AddEditTransactionScreen({Key? key, this.transaction}) : super(key: key);

  @override
  _AddEditTransactionScreenState createState() => _AddEditTransactionScreenState();
}

class _AddEditTransactionScreenState extends State<AddEditTransactionScreen> {
  final _formKey = GlobalKey<FormState>();
  late String _title;
  late double _amount;
  late String _type;
  late String _category;
  late String _date;
  String? _notes;

  final List<String> _categories = [
    'Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Salary', 'Investment', 'Other'
  ];

  @override
  void initState() {
    super.initState();
    _title = widget.transaction?.title ?? '';
    _amount = widget.transaction?.amount ?? 0;
    _type = widget.transaction?.type ?? 'expense';
    _category = widget.transaction?.category ?? 'Food';
    _date = widget.transaction?.date ?? DateFormat('yyyy-MM-dd').format(DateTime.now());
    _notes = widget.transaction?.notes;
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();
      final txn = TransactionModel(
        id: widget.transaction?.id ?? '',
        title: _title,
        amount: _amount,
        type: _type,
        category: _category,
        date: _date,
        notes: _notes,
      );

      final provider = context.read<FinanceProvider>();
      if (widget.transaction == null) {
        provider.addTransaction(txn);
      } else {
        provider.updateTransaction(txn);
      }
      Navigator.pop(context);
    }
  }

  Future<void> _pickDate() async {
    DateTime initialDate = DateTime.parse(_date);
    final picked = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
    );
    if (picked != null) {
      setState(() {
        _date = DateFormat('yyyy-MM-dd').format(picked);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.transaction == null ? 'Add Transaction' : 'Edit Transaction'),
        backgroundColor: colors.primary,
        foregroundColor: colors.onPrimary,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'expense', label: Text('Expense')),
                  ButtonSegment(value: 'income', label: Text('Income')),
                ],
                selected: {_type},
                onSelectionChanged: (Set<String> newSelection) {
                  setState(() {
                    _type = newSelection.first;
                    if (_type == 'income') _category = 'Salary';
                  });
                },
              ),
              const SizedBox(height: 16),
              Consumer<FinanceProvider>(
                builder: (context, provider, child) => TextFormField(
                  initialValue: _amount == 0 ? '' : _amount.toString(),
                  decoration: InputDecoration(
                    labelText: 'Amount',
                    prefixText: '${provider.currency} ',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (val) {
                    if (val == null || val.isEmpty) return 'Please enter an amount';
                    if (double.tryParse(val) == null) return 'Please enter a valid number';
                    return null;
                  },
                  onSaved: (val) => _amount = double.parse(val!),
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                initialValue: _title,
                decoration: InputDecoration(
                  labelText: 'Title',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                validator: (val) => val == null || val.isEmpty ? 'Please enter a title' : null,
                onSaved: (val) => _title = val!,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _category,
                decoration: InputDecoration(
                  labelText: 'Category',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                onChanged: (val) => setState(() => _category = val!),
              ),
              const SizedBox(height: 16),
              InkWell(
                onTap: _pickDate,
                child: InputDecorator(
                  decoration: InputDecoration(
                    labelText: 'Date',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(_date),
                      const Icon(Icons.calendar_today),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                initialValue: _notes,
                decoration: InputDecoration(
                  labelText: 'Notes (Optional)',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                maxLines: 3,
                onSaved: (val) => _notes = val,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: colors.primary,
                  foregroundColor: colors.onPrimary,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Save Transaction', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
