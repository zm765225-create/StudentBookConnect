import React from 'react';
import { Platform, StyleSheet, View, Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useApp } from '@/store/AppContext';
import { RootStackParamList } from '@/navigation/RootNavigator';
import { ThemedText } from '@/components/ThemedText';

import AdminStudentsScreen from '@/screens/admin/AdminStudentsScreen';
import AdminInventoryScreen from '@/screens/admin/AdminInventoryScreen';
import AdminTreasuryScreen from '@/screens/admin/AdminTreasuryScreen';
import AdminSettingsScreen from '@/screens/admin/AdminSettingsScreen';

export type AdminTabParamList = {
  Students: undefined;
  Inventory: undefined;
  Treasury: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

function MessagesButton() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { messages } = useApp();
  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <Pressable
      onPress={() => navigation.navigate('Messages')}
      style={({ pressed }) => [
        styles.messagesButton,
        { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] },
      ]}
    >
      <Feather name="message-circle" size={24} color="#FFFFFF" />
      {unreadCount > 0 ? (
        <View style={styles.badge}>
          <ThemedText style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</ThemedText>
        </View>
      ) : null}
    </Pressable>
  );
}

export default function AdminTabNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        initialRouteName="Students"
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
          name="Students"
          component={AdminStudentsScreen}
          options={{
            title: 'الطلاب',
            tabBarIcon: ({ color, size }) => (
              <Feather name="users" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Inventory"
          component={AdminInventoryScreen}
          options={{
            title: 'المخزون',
            tabBarIcon: ({ color, size }) => (
              <Feather name="package" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Treasury"
          component={AdminTreasuryScreen}
          options={{
            title: 'الخزينة',
            tabBarIcon: ({ color, size }) => (
              <Feather name="dollar-sign" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={AdminSettingsScreen}
          options={{
            title: 'الإعدادات',
            tabBarIcon: ({ color, size }) => (
              <Feather name="settings" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      <MessagesButton />
    </View>
  );
}

const styles = StyleSheet.create({
  messagesButton: {
    position: 'absolute',
    bottom: 100,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.light.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
