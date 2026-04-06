import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function setupDailyReminder(timeInput, isEnabled) {
  // Cancel all existing to avoid stacking old schedules
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  if (!isEnabled) {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }

  const [hourString, minuteString] = timeInput.split(':');
  const hour = parseInt(hourString, 10);
  const minute = parseInt(minuteString, 10);

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Log Your Finances 💸",
        body: 'Did you spend any money today? Take a quick moment to record your transactions!',
      },
      trigger: {
        hour: hour,
        minute: minute,
        repeats: true,
      },
    });
    return true;
  } catch (error) {
    console.error("Error scheduling notification:", error);
    return false;
  }
}

export async function scheduleSpecificReminder(title, body, triggerDate) {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return null;

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
      },
      trigger: {
        date: triggerDate, // specific exact Date object
      },
    });
    return id;
  } catch (error) {
    console.log("Error scheduling exact notification", error);
    return null;
  }
}
