import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useAppTheme } from './theme/theme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Screens
import HomeScreen from './screens/HomeScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import InsightsScreen from './screens/InsightsScreen';
import BillsScreen from './screens/BillsScreen';
import SettingsScreen from './screens/SettingsScreen';
import AddEditTransactionScreen from './screens/AddEditTransactionScreen';
import AlarmsScreen from './screens/AlarmsScreen';
import AddEditAlarmScreen from './screens/AddEditAlarmScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const { colors, isDark } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Transactions') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Insights') {
            iconName = focused ? 'pie-chart' : 'pie-chart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'Bills') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Alarms') {
            iconName = focused ? 'alarm' : 'alarm-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: isDark ? colors.background : colors.primary,
        tabBarInactiveTintColor: isDark ? '#222222' : colors.textSecondary,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 24,
          left: 24,
          right: 24,
          backgroundColor: isDark ? colors.primary : colors.surface,
          borderRadius: 30,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          paddingBottom: 0,
          height: 60,
        },
        tabBarItemStyle: {
          borderRadius: 30,
        },
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: isDark ? 0 : 1,
          borderBottomColor: colors.border,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: colors.text,
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Bills" component={BillsScreen} />
      <Tab.Screen name="Alarms" component={AlarmsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  // We can't immediately useAppTheme outside a robust Provider, but since App 
  // is just the root, let's wrap it correctly.
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { colors, isDark } = useAppTheme();
  
  return (
    <NavigationContainer theme={{
      dark: isDark,
      colors: {
        background: colors.background,
        card: colors.surface,
        border: colors.border,
      }
    }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen 
          name="AddEditTransaction" 
          component={AddEditTransactionScreen} 
          options={{ 
            presentation: 'modal', 
            headerShown: true, 
            title: 'Transaction',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerShadowVisible: false,
          }} 
        />
        <Stack.Screen 
          name="AddEditAlarm" 
          component={AddEditAlarmScreen} 
          options={{ 
            presentation: 'modal', 
            headerShown: true, 
            title: 'Alarm',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerShadowVisible: false,
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
