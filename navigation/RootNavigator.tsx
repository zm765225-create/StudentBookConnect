import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getCommonScreenOptions } from '@/navigation/screenOptions';
import { useTheme } from '@/hooks/useTheme';

import ModeSelectionScreen from '@/screens/ModeSelectionScreen';
import AdminLoginScreen from '@/screens/AdminLoginScreen';
import StudentLoginScreen from '@/screens/StudentLoginScreen';
import StudentTabNavigator from '@/navigation/StudentTabNavigator';
import AdminTabNavigator from '@/navigation/AdminTabNavigator';
import StudentDetailScreen from '@/screens/admin/StudentDetailScreen';
import AddStudentScreen from '@/screens/admin/AddStudentScreen';
import BulkAddStudentsScreen from '@/screens/admin/BulkAddStudentsScreen';
import AddProductScreen from '@/screens/admin/AddProductScreen';
import AddResearchScreen from '@/screens/admin/AddResearchScreen';
import MessagesScreen from '@/screens/admin/MessagesScreen';
import LogsScreen from '@/screens/admin/LogsScreen';
import AdvancedSettingsScreen from '@/screens/admin/AdvancedSettingsScreen';

export type RootStackParamList = {
  ModeSelection: undefined;
  AdminLogin: undefined;
  StudentLogin: undefined;
  StudentPortal: undefined;
  AdminDashboard: undefined;
  StudentDetail: { studentId: string };
  AddStudent: undefined;
  BulkAddStudents: undefined;
  AddProduct: { productId?: string };
  AddResearch: { researchId?: string };
  Messages: undefined;
  Logs: undefined;
  AdvancedSettings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="ModeSelection"
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark, transparent: false }),
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="ModeSelection" 
        component={ModeSelectionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AdminLogin" 
        component={AdminLoginScreen}
        options={{ 
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerBackTitle: 'رجوع',
        }}
      />
      <Stack.Screen 
        name="StudentLogin" 
        component={StudentLoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="StudentPortal" 
        component={StudentTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="StudentDetail" 
        component={StudentDetailScreen}
        options={{ 
          headerShown: true,
          headerTransparent: true,
          headerTitle: 'تفاصيل الطالب',
          headerBackTitle: 'رجوع',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="AddStudent" 
        component={AddStudentScreen}
        options={{ 
          headerShown: true,
          headerTransparent: true,
          headerTitle: 'إضافة طالب',
          headerBackTitle: 'رجوع',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="BulkAddStudents" 
        component={BulkAddStudentsScreen}
        options={{ 
          headerShown: true,
          headerTransparent: true,
          headerTitle: 'إضافة طلاب بالجملة',
          headerBackTitle: 'رجوع',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="AddProduct" 
        component={AddProductScreen}
        options={{ 
          headerShown: true,
          headerTransparent: true,
          headerTitle: 'إضافة منتج',
          headerBackTitle: 'رجوع',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="AddResearch" 
        component={AddResearchScreen}
        options={{ 
          headerShown: true,
          headerTransparent: true,
          headerTitle: 'إضافة بحث',
          headerBackTitle: 'رجوع',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{ 
          headerShown: true,
          headerTransparent: true,
          headerTitle: 'الرسائل',
          headerBackTitle: 'رجوع',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="Logs" 
        component={LogsScreen}
        options={{ 
          headerShown: true,
          headerTransparent: true,
          headerTitle: 'السجلات والأنشطة',
          headerBackTitle: 'رجوع',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="AdvancedSettings" 
        component={AdvancedSettingsScreen}
        options={{ 
          headerShown: true,
          headerTransparent: true,
          headerTitle: 'إعدادات متقدمة',
          headerBackTitle: 'رجوع',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}
