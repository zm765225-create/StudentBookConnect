import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useApp, AppLog, LogType } from '@/store/AppContext';
import { RootStackParamList } from '@/navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Logs'>; // Updated when added to RootStackParamList

const logTypeLabels: Record<LogType, { label: string; icon: string; color: string }> = {
  student_added: { label: 'إضافة طالب', icon: 'user-plus', color: '#27AE60' },
  student_updated: { label: 'تحديث طالب', icon: 'user-check', color: '#3498DB' },
  student_deleted: { label: 'حذف طالب', icon: 'user-x', color: '#E74C3C' },
  payment: { label: 'دفع', icon: 'dollar-sign', color: '#F39C12' },
  delivery: { label: 'تسليم', icon: 'package', color: '#1A5F7A' },
  research_submitted: { label: 'تسليم بحث', icon: 'file-text', color: '#9B59B6' },
  product_added: { label: 'إضافة منتج', icon: 'plus-circle', color: '#27AE60' },
  product_updated: { label: 'تحديث منتج', icon: 'edit', color: '#3498DB' },
  product_deleted: { label: 'حذف منتج', icon: 'trash', color: '#E74C3C' },
  admin_login: { label: 'تسجيل دخول', icon: 'log-in', color: '#2ECC71' },
  admin_logout: { label: 'تسجيل خروج', icon: 'log-out', color: '#E74C3C' },
  settings_changed: { label: 'تغيير الإعدادات', icon: 'settings', color: '#8E44AD' },
};

export default function LogsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { logs, getLogs, clearLogs } = useApp();
  const [selectedType, setSelectedType] = useState<LogType | null>(null);

  const filteredLogs = selectedType ? getLogs(selectedType) : logs;

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar-EG', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatFullDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderLog = ({ item, index }: { item: AppLog; index: number }) => {
    const typeInfo = logTypeLabels[item.type];
    
    return (
      <Animated.View 
        key={item.id}
        entering={FadeInDown.delay(index * 30)}
        style={styles.logItem}
      >
        <View style={[styles.logIcon, { backgroundColor: typeInfo.color + '20' }]}>
          <Feather name={typeInfo.icon as any} size={20} color={typeInfo.color} />
        </View>
        <View style={styles.logContent}>
          <ThemedText style={styles.logType}>{typeInfo.label}</ThemedText>
          <ThemedText style={styles.logDescription}>{item.description}</ThemedText>
          <ThemedText style={styles.logTime}>{formatDate(item.timestamp)}</ThemedText>
        </View>
      </Animated.View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.header}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        <Pressable
          style={[
            styles.filterButton,
            !selectedType && { backgroundColor: Colors.light.primary }
          ]}
          onPress={() => setSelectedType(null)}
        >
          <ThemedText style={[
            styles.filterText,
            !selectedType && { color: '#FFFFFF' }
          ]}>الكل</ThemedText>
        </Pressable>
        
        {(Object.keys(logTypeLabels) as LogType[]).map(type => (
          <Pressable
            key={type}
            style={[
              styles.filterButton,
              selectedType === type && { backgroundColor: Colors.light.primary }
            ]}
            onPress={() => setSelectedType(type)}
          >
            <ThemedText style={[
              styles.filterText,
              selectedType === type && { color: '#FFFFFF' }
            ]}>
              {logTypeLabels[type].label}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {filteredLogs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="inbox" size={48} color={Colors.light.textSecondary} />
          <ThemedText style={styles.emptyText}>لا توجد سجلات</ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredLogs}
          renderItem={renderLog}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + Spacing.xl }
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pressable
        style={styles.clearButton}
        onPress={() => clearLogs()}
      >
        <Feather name="trash-2" size={20} color="#FFFFFF" />
        <ThemedText style={styles.clearButtonText}>مسح السجلات</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundRoot,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  filterScroll: {
    gap: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#FFFFFF',
    marginRight: Spacing.sm,
    ...Shadows.small,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.text,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  logItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  logIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.lg,
  },
  logContent: {
    flex: 1,
  },
  logType: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
    textAlign: 'right',
  },
  logDescription: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 4,
    textAlign: 'right',
  },
  logTime: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    opacity: 0.7,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  clearButton: {
    position: 'absolute',
    bottom: Spacing.xl,
    left: Spacing.lg,
    backgroundColor: Colors.light.error,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.medium,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
