import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Notifications from 'expo-notifications';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Placeholder screens
const HomeScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Home</Text></View>;
const ReviewScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Review</Text></View>;
const StatsScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Stats</Text></View>;

const App = () => {
  useEffect(() => {
    // Setup notifications
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Review" component={ReviewScreen} />
        <Tab.Screen name="Stats" component={StatsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
