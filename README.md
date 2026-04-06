# Personal Finance Companion 💰

A high-quality, production-ready React Native (Expo) mobile application designed to help users track their income and expenses gracefully.

## ✨ Features

- **Dashboard:** Instantly view balance, income, expenses, and a custom savings goal tracker.
- **Transactions Management:** Add, edit, and delete transactions with full validation.
- **Categorization:** Categorized spending with custom icons and organized lists grouped by date.
- **Visual Insights:** See your spending habits via a weekly Bar Chart and an all-time Category Breakdown Pie Chart!
- **Persistence:** All data seamlessly persists entirely offline using `AsyncStorage`.
- **Haptic Feedback:** Physical interactions feel more premium with integrated `expo-haptics`.

## 🏗 Build & Architecture

This application was developed using **React Native with Expo**, adhering strictly to modern mobile UI/UX principles. Rather than relying on heavy component libraries, styling is managed through a central `theme.js` utility using vanilla React Native `StyleSheet`, resulting in highly performant and predictable rendering.

### Tech Stack
- **Framework:** React Native / Expo
- **State Management:** Zustand (for highly performant, lightweight state logic)
- **Local Storage:** `AsyncStorage` via Zustand's persist middleware
- **Navigation:** React Navigation (Bottom Tabs + Native Stack)
- **Charts:** `react-native-gifted-charts`

### Project Structure
```text
/assets       - Static assets (icons, splash)
/components   - Reusable UI elements (Card, Button, Input, TransactionItem)
/screens      - Core user flows (Home, Transactions, Insights, AddEdit)
/state        - Zustand store for app-wide state
/theme        - Centralized design system (colors, typography, spacing)
/utils        - Helpers and mock data
```

## 🚀 Setup & Installation

**Prerequisites:** You will need [Node.js](https://nodejs.org/) installed to run this project locally.

1. **Open your terminal** and navigate to this folder:
   ```bash
   cd "Personal Finance Companion"
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Start the Expo server:**
   ```bash
   npx expo start
   ```

4. **View the App:**
   - Scan the QR code shown in your terminal using the **Expo Go** application on iOS or Android.
   - Alternatively, press `w` to open in a web browser.

## 🎨 Design Decisions & Assumptions

- **Aesthetic:** Chose a bright, iOS-style minimal aesthetic (Indigo/Emerald) specifically to provide immediate clarity to the user.
- **Functional Components:** All state is tracked in a single manageable store to prevent unnecessary prop-drilling or Context wrappers, boosting React render performance.
- **Pre-filled Data:** Upon first load, the app creates mock transactions to populate the graphs so the user immediately understands the product's value. This can be removed in `state/useFinanceStore.js`.
