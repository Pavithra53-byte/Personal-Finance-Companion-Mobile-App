import 'package:flutter/material.dart';
import '../providers/finance_provider.dart';

class ProfileDialogHelper {
  static void showProfileDialog(BuildContext context, FinanceProvider provider) {
    final nameController = TextEditingController(text: provider.firstName);
    final ageController = TextEditingController(text: provider.age);
    final occController = TextEditingController(text: provider.occupation);
    final budgetController = TextEditingController(text: provider.monthlyBudget.toStringAsFixed(0));
    String selectedGender = provider.gender.isEmpty ? 'Other' : provider.gender;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Edit Profile'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(labelText: 'Name', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: ageController,
                  decoration: const InputDecoration(labelText: 'Age', border: OutlineInputBorder()),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: occController,
                  decoration: const InputDecoration(labelText: 'Occupation', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: selectedGender,
                  decoration: const InputDecoration(labelText: 'Gender', border: OutlineInputBorder()),
                  items: const [
                    DropdownMenuItem(value: 'Male', child: Text('Male')),
                    DropdownMenuItem(value: 'Female', child: Text('Female')),
                    DropdownMenuItem(value: 'Other', child: Text('Other')),
                  ],
                  onChanged: (val) {
                    if (val != null) {
                      setDialogState(() {
                        selectedGender = val;
                      });
                    }
                  },
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: budgetController,
                  decoration: const InputDecoration(labelText: 'Monthly Budget', border: OutlineInputBorder()),
                  keyboardType: TextInputType.number,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () {
                provider.updateProfile(
                  name: nameController.text,
                  age: ageController.text,
                  occupation: occController.text,
                  gender: selectedGender,
                  budget: double.tryParse(budgetController.text),
                );
                Navigator.pop(ctx);
              },
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }

  static IconData getGenderIcon(String gender) {
    if (gender.toLowerCase() == 'male') return Icons.boy;
    if (gender.toLowerCase() == 'female') return Icons.girl;
    return Icons.person;
  }
}
