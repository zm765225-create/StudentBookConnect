import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useApp } from '@/store/AppContext';
import { RootStackParamList } from '@/navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'AdvancedSettings'>; // Updated when added to RootStackParamList

interface SettingItemProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  multiline?: boolean;
  index: number;
}

function SettingItem({ label, value, onChangeText, placeholder, multiline, index }: SettingItemProps) {
  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 50)}
      style={styles.settingItem}
    >
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TextInput
        style={[styles.input, multiline && { minHeight: 80 }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.light.textSecondary}
        multiline={multiline}
        textAlign="right"
      />
    </Animated.View>
  );
}

export default function AdvancedSettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useApp();
  
  const [appTitle, setAppTitle] = useState(settings.customTexts?.appTitle || 'نظام إدارة الكتب');
  const [collegeName, setCollegeName] = useState(settings.customTexts?.collegeName || 'كلية التربية النوعية');
  const [departmentName, setDepartmentName] = useState(settings.customTexts?.departmentName || 'قسم الاقتصاد المنزلي');
  const [primaryColor, setPrimaryColor] = useState(settings.customColors?.primary || '#1A5F7A');
  const [secondaryColor, setSecondaryColor] = useState(settings.customColors?.secondary || '#159895');
  const [accentColor, setAccentColor] = useState(settings.customColors?.accent || '#57C5B6');

  const handleSave = () => {
    updateSettings({
      customTexts: {
        appTitle,
        collegeName,
        departmentName,
      },
      customColors: {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
      },
    });
    Alert.alert('نجح', 'تم حفظ الإعدادات بنجاح');
  };

  const handleReset = () => {
    Alert.alert(
      'إعادة تعيين',
      'هل تريد استعادة الإعدادات الافتراضية؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'نعم',
          style: 'destructive',
          onPress: () => {
            setAppTitle('نظام إدارة الكتب');
            setCollegeName('كلية التربية النوعية');
            setDepartmentName('قسم الاقتصاد المنزلي');
            setPrimaryColor('#1A5F7A');
            setSecondaryColor('#159895');
            setAccentColor('#57C5B6');
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
          <ThemedText style={styles.title}>إعدادات متقدمة</ThemedText>
          <ThemedText style={styles.subtitle}>تخصيص كامل للتطبيق والنصوص والألوان</ThemedText>
        </Animated.View>

        <ThemedText style={styles.sectionTitle}>النصوص والأسماء</ThemedText>
        <View style={styles.section}>
          <SettingItem
            label="اسم التطبيق"
            value={appTitle}
            onChangeText={setAppTitle}
            placeholder="أدخل اسم التطبيق"
            index={0}
          />
          <SettingItem
            label="اسم الكلية"
            value={collegeName}
            onChangeText={setCollegeName}
            placeholder="أدخل اسم الكلية"
            index={1}
          />
          <SettingItem
            label="اسم القسم"
            value={departmentName}
            onChangeText={setDepartmentName}
            placeholder="أدخل اسم القسم"
            index={2}
          />
        </View>

        <ThemedText style={styles.sectionTitle}>الألوان</ThemedText>
        <View style={styles.section}>
          <View style={styles.colorPickerItem}>
            <Animated.View entering={FadeInDown.delay(150)}>
              <ThemedText style={styles.label}>اللون الأساسي</ThemedText>
              <View style={styles.colorInputRow}>
                <TextInput
                  style={[styles.colorInput, { flex: 1 }]}
                  value={primaryColor}
                  onChangeText={setPrimaryColor}
                  placeholder="#000000"
                  placeholderTextColor={Colors.light.textSecondary}
                  textAlign="center"
                />
                <View 
                  style={[styles.colorPreview, { backgroundColor: primaryColor }]}
                />
              </View>
            </Animated.View>
          </View>

          <View style={styles.colorPickerItem}>
            <Animated.View entering={FadeInDown.delay(200)}>
              <ThemedText style={styles.label}>اللون الثانوي</ThemedText>
              <View style={styles.colorInputRow}>
                <TextInput
                  style={[styles.colorInput, { flex: 1 }]}
                  value={secondaryColor}
                  onChangeText={setSecondaryColor}
                  placeholder="#000000"
                  placeholderTextColor={Colors.light.textSecondary}
                  textAlign="center"
                />
                <View 
                  style={[styles.colorPreview, { backgroundColor: secondaryColor }]}
                />
              </View>
            </Animated.View>
          </View>

          <View style={styles.colorPickerItem}>
            <Animated.View entering={FadeInDown.delay(250)}>
              <ThemedText style={styles.label}>لون التأكيد</ThemedText>
              <View style={styles.colorInputRow}>
                <TextInput
                  style={[styles.colorInput, { flex: 1 }]}
                  value={accentColor}
                  onChangeText={setAccentColor}
                  placeholder="#000000"
                  placeholderTextColor={Colors.light.textSecondary}
                  textAlign="center"
                />
                <View 
                  style={[styles.colorPreview, { backgroundColor: accentColor }]}
                />
              </View>
            </Animated.View>
          </View>
        </View>

        <ThemedText style={styles.sectionTitle}>المعلومات</ThemedText>
        <View style={[styles.section, { marginBottom: Spacing.xl }]}>
          <View style={styles.infoItem}>
            <Feather name="info" size={20} color={Colors.light.primary} />
            <ThemedText style={styles.infoText}>
              استخدم هذه الصفحة لتخصيص كل شيء في التطبيق. يمكنك تغيير النصوص والألوان براحتك، كأنك تكتب على كراسة!
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Pressable style={styles.resetButton} onPress={handleReset}>
          <Feather name="rotate-ccw" size={20} color={Colors.light.error} />
          <ThemedText style={styles.resetButtonText}>إعادة تعيين</ThemedText>
        </Pressable>
        
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Feather name="check" size={20} color="#FFFFFF" />
          <ThemedText style={styles.saveButtonText}>حفظ</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundRoot,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
    textAlign: 'right',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.small,
    marginBottom: Spacing.lg,
  },
  settingItem: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  colorPickerItem: {
    marginBottom: Spacing.lg,
  },
  colorInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  colorInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  colorPreview: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.error,
    gap: Spacing.sm,
  },
  resetButtonText: {
    color: Colors.light.error,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.primary,
    gap: Spacing.sm,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
