import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/hooks/useTheme';
import { Colors } from '@/constants/theme';

import StudentBooksScreen from '@/screens/student/StudentBooksScreen';
import StudentStatusScreen from '@/screens/student/StudentStatusScreen';
import StudentResearchScreen from '@/screens/student/StudentResearchScreen';
import StudentProfileScreen from '@/screens/student/StudentProfileScreen';

export type StudentTabParamList = {
  Books: undefined;
  Status: undefined;
  Research: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<StudentTabParamList>();

export default function StudentTabNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Profile"
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Platform.select({
            ios: 'transparent',
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={100}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Profile"
        component={StudentProfileScreen}
        options={{
          title: 'بياناتي',
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Books"
        component={StudentBooksScreen}
        options={{
          title: 'الكتب',
          tabBarIcon: ({ color, size }) => (
            <Feather name="book-open" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Status"
        component={StudentStatusScreen}
        options={{
          title: 'حالة الطلب',
          tabBarIcon: ({ color, size }) => (
            <Feather name="check-circle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Research"
        component={StudentResearchScreen}
        options={{
          title: 'الأبحاث',
          tabBarIcon: ({ color, size }) => (
            <Feather name="file-text" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
