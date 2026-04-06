import 'package:flutter/material.dart';

class AppTheme {
  static const Color lightPrimary = Color(0xFF4F46E5);
  static const Color lightPrimaryLight = Color(0xFF818CF8);
  static const Color lightBackground = Color(0xFFF8FAFC);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightText = Color(0xFF1E293B);
  static const Color lightTextSecondary = Color(0xFF64748B);
  static const Color lightBorder = Color(0xFFE2E8F0);
  static const Color lightSuccess = Color(0xFF10B981);
  static const Color lightDanger = Color(0xFFEF4444);

  static const Color darkPrimary = Color(0xFFB6FF00);
  static const Color darkPrimaryLight = Color(0xFFFFBE5D);
  static const Color darkBackground = Color(0xFF08080E);
  static const Color darkSurface = Color(0xFF22222C);
  static const Color darkText = Color(0xFFFFFFFF);
  static const Color darkTextSecondary = Color(0xFFA0A5B5);
  static const Color darkBorder = Color(0xFF2A2A35);
  static const Color darkSuccess = Color(0xFFB6FF00);
  static const Color darkWarning = Color(0xFFFFBE5D);
  static const Color darkDanger = Color(0xFFFD5D5D);

  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      primaryColor: lightPrimary,
      scaffoldBackgroundColor: lightBackground,
      cardColor: lightSurface,
      colorScheme: const ColorScheme.light(
        primary: lightPrimary,
        secondary: lightPrimaryLight,
        background: lightBackground,
        surface: lightSurface,
        error: lightDanger,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: lightBackground,
        elevation: 0,
        iconTheme: IconThemeData(color: lightText),
        titleTextStyle: TextStyle(color: lightText, fontSize: 20, fontWeight: FontWeight.bold),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      primaryColor: darkPrimary,
      scaffoldBackgroundColor: darkBackground,
      cardColor: darkSurface,
      colorScheme: const ColorScheme.dark(
        primary: darkPrimary,
        secondary: darkPrimaryLight,
        background: darkBackground,
        surface: darkSurface,
        error: darkDanger,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: darkBackground,
        elevation: 0,
        iconTheme: IconThemeData(color: darkText),
        titleTextStyle: TextStyle(color: darkText, fontSize: 20, fontWeight: FontWeight.bold),
      ),
    );
  }
}
