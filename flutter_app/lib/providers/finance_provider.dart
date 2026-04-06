import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/transaction_model.dart';
import '../models/bill_model.dart';
import '../models/alarm_model.dart';

class FinanceProvider with ChangeNotifier {
  List<TransactionModel> _transactions = [];
  List<BillModel> _upcomingBills = [];
  List<AlarmModel> _alarms = [];
  String _themePreference = 'dark';
  double _savingsTarget = 5000;
  double _savingsCurrent = 1250;
  double _monthlyBudget = 10000;
  String _currency = '\$';
  String _firstName = '';
  String _age = '';
  String _occupation = '';
  String _gender = 'Other';
  String _dailyReminderTime = '20:00';

  List<TransactionModel> get transactions => _transactions;
  List<BillModel> get upcomingBills => _upcomingBills;
  List<AlarmModel> get alarms => _alarms;
  String get themePreference => _themePreference;
  double get savingsTarget => _savingsTarget;
  double get savingsCurrent => _savingsCurrent;
  double get monthlyBudget => _monthlyBudget;
  String get currency => _currency;
  String get firstName => _firstName;
  String get age => _age;
  String get occupation => _occupation;
  String get gender => _gender;
  String get dailyReminderTime => _dailyReminderTime;

  SharedPreferences? _prefs;

  Future<SharedPreferences> _getPrefs() async {
    _prefs ??= await SharedPreferences.getInstance();
    return _prefs!;
  }

  Future<void> loadUserData() async {
    final prefs = await _getPrefs();

    _firstName = prefs.getString('firstName') ?? '';
    _age = prefs.getString('age') ?? '';
    _occupation = prefs.getString('occupation') ?? '';
    _gender = prefs.getString('gender') ?? 'Other';
    _currency = prefs.getString('currency') ?? '\$';
    _themePreference = prefs.getString('themePreference') ?? 'dark';
    _monthlyBudget = prefs.getDouble('monthlyBudget') ?? 10000;
    _savingsTarget = prefs.getDouble('savingsTarget') ?? 5000;
    _savingsCurrent = prefs.getDouble('savingsCurrent') ?? 1250;

    // Load transactions
    final txnJson = prefs.getString('transactions');
    if (txnJson != null) {
      final List<dynamic> txnList = json.decode(txnJson);
      _transactions = txnList.map((e) => TransactionModel.fromMap(e, e['id'] ?? '')).toList();
      _transactions.sort((a, b) => b.date.compareTo(a.date));
    }

    // Load bills
    final billsJson = prefs.getString('bills');
    if (billsJson != null) {
      final List<dynamic> billList = json.decode(billsJson);
      _upcomingBills = billList.map((e) => BillModel.fromMap(e, e['id'] ?? '')).toList();
    }

    // Load alarms
    final alarmsJson = prefs.getString('alarms');
    if (alarmsJson != null) {
      final List<dynamic> alarmList = json.decode(alarmsJson);
      _alarms = alarmList.map((e) => AlarmModel.fromMap(e, e['id'] ?? '')).toList();
    }

    _dailyReminderTime = prefs.getString('dailyReminderTime') ?? '20:00';

    if (prefs.getBool('hasLaunchedBefore') != true) {
      // Inject dummy data
      _transactions = [
        TransactionModel(id: 't1', title: 'Groceries', amount: 156, type: 'expense', category: 'Food', date: '2026-04-06'),
        TransactionModel(id: 't2', title: 'Salary', amount: 5000, type: 'income', category: 'Salary', date: '2026-04-01'),
        TransactionModel(id: 't3', title: 'Internet Bill', amount: 80, type: 'expense', category: 'Bills', date: '2026-04-05'),
      ];
      _upcomingBills = [
        BillModel(id: 'b1', title: 'Electricity', amount: 120, date: '2026-04-10', time: '10:00'),
      ];
      _alarms = [
        AlarmModel(id: 'a1', name: 'Credit Card Payment', time: '09:00', description: 'Pay minimum due', date: '2026-04-08', enabled: true),
      ];
      await prefs.setBool('hasLaunchedBefore', true);
      await _saveTransactions();
      await _saveBills();
      await _saveAlarms();
    }

    notifyListeners();
  }

  Future<void> _saveTransactions() async {
    final prefs = await _getPrefs();
    final list = _transactions.map((t) {
      final map = t.toMap();
      map['id'] = t.id;
      return map;
    }).toList();
    await prefs.setString('transactions', json.encode(list));
  }

  Future<void> _saveBills() async {
    final prefs = await _getPrefs();
    final list = _upcomingBills.map((b) => b.toMap()).toList();
    await prefs.setString('bills', json.encode(list));
  }

  Future<void> _saveAlarms() async {
    final prefs = await _getPrefs();
    final list = _alarms.map((a) => a.toMap()).toList();
    await prefs.setString('alarms', json.encode(list));
  }

  Future<void> addTransaction(TransactionModel txn) async {
    txn.id = DateTime.now().millisecondsSinceEpoch.toString();
    _transactions.insert(0, txn);
    _transactions.sort((a, b) => b.date.compareTo(a.date));
    notifyListeners();
    await _saveTransactions();
  }

  Future<void> updateTransaction(TransactionModel txn) async {
    final index = _transactions.indexWhere((t) => t.id == txn.id);
    if (index != -1) {
      _transactions[index] = txn;
      _transactions.sort((a, b) => b.date.compareTo(a.date));
      notifyListeners();
      await _saveTransactions();
    }
  }

  Future<void> deleteTransaction(String id) async {
    _transactions.removeWhere((t) => t.id == id);
    notifyListeners();
    await _saveTransactions();
  }

  Future<void> addBill(BillModel bill) async {
    bill.id = DateTime.now().millisecondsSinceEpoch.toString();
    _upcomingBills.add(bill);
    notifyListeners();
    await _saveBills();
  }

  Future<void> deleteBill(String id) async {
    _upcomingBills.removeWhere((b) => b.id == id);
    notifyListeners();
    await _saveBills();
  }

  Future<void> addAlarm(AlarmModel alarm) async {
    alarm.id = DateTime.now().millisecondsSinceEpoch.toString();
    _alarms.add(alarm);
    notifyListeners();
    await _saveAlarms();
  }

  Future<void> updateAlarm(AlarmModel alarm) async {
    final index = _alarms.indexWhere((a) => a.id == alarm.id);
    if (index != -1) {
      _alarms[index] = alarm;
      notifyListeners();
      await _saveAlarms();
    }
  }

  Future<void> deleteAlarm(String id) async {
    _alarms.removeWhere((a) => a.id == id);
    notifyListeners();
    await _saveAlarms();
  }

  // Computed values
  double getTotalIncome() {
    return _transactions.where((t) => t.type == 'income').fold(0.0, (sum, t) => sum + t.amount);
  }

  double getTotalExpenses() {
    return _transactions.where((t) => t.type == 'expense').fold(0.0, (sum, t) => sum + t.amount);
  }

  double getCurrentBalance() {
    return getTotalIncome() - getTotalExpenses();
  }

  int getSpendingStreak() {
    double dailyLimit = _monthlyBudget / 30;
    int streak = 0;
    DateTime d = DateTime.now();

    for (int i = 0; i < 30; i++) {
      String dateStr = "${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}";
      double daysExps = _transactions
          .where((t) => t.type == 'expense' && t.date == dateStr)
          .fold(0.0, (sum, t) => sum + t.amount);

      if (daysExps <= dailyLimit) {
        streak++;
      } else {
        break;
      }
      d = d.subtract(const Duration(days: 1));
    }
    return streak;
  }

  Map<String, double> getCategoryBreakdown() {
    final Map<String, double> breakdown = {};
    for (var t in _transactions.where((t) => t.type == 'expense')) {
      breakdown[t.category] = (breakdown[t.category] ?? 0) + t.amount;
    }
    return breakdown;
  }

  Future<void> toggleTheme(String newTheme) async {
    _themePreference = newTheme;
    notifyListeners();
    final prefs = await _getPrefs();
    await prefs.setString('themePreference', newTheme);
  }

  Future<void> updateProfile({String? name, String? curr, double? budget, double? savTarget, double? savCurrent, String? age, String? occupation, String? gender}) async {
    if (name != null) _firstName = name;
    if (age != null) _age = age;
    if (occupation != null) _occupation = occupation;
    if (gender != null) _gender = gender;
    if (curr != null) _currency = curr;
    if (budget != null) _monthlyBudget = budget;
    if (savTarget != null) _savingsTarget = savTarget;
    if (savCurrent != null) _savingsCurrent = savCurrent;
    notifyListeners();

    final prefs = await _getPrefs();
    await prefs.setString('firstName', _firstName);
    await prefs.setString('age', _age);
    await prefs.setString('occupation', _occupation);
    await prefs.setString('gender', _gender);
    await prefs.setString('currency', _currency);
    await prefs.setDouble('monthlyBudget', _monthlyBudget);
    await prefs.setDouble('savingsTarget', _savingsTarget);
    await prefs.setDouble('savingsCurrent', _savingsCurrent);
  }

  Future<void> setDailyReminderTime(String timeStr) async {
    _dailyReminderTime = timeStr;
    notifyListeners();
    final prefs = await _getPrefs();
    await prefs.setString('dailyReminderTime', timeStr);
  }

  Future<void> setCurrency(String newCurrency) async {
    _currency = newCurrency;
    notifyListeners();
    final prefs = await _getPrefs();
    await prefs.setString('currency', newCurrency);
  }
}
