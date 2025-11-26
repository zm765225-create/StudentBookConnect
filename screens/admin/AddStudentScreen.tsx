import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useApp } from '@/store/AppContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AddStudentScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { addStudent } = useApp();

  const [name, setName] = useState('');
  const [section, setSection] = useState('');
  const [phone, setPhone] = useState('');

  const buttonScale = useSharedValue(1);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert('تنبيه', 'الرجاء إدخال اسم الطالب');
      return;
    }

    addStudent({
      name: name.trim(),
      section: section.trim(),
      phone: phone.trim(),
      academicYear: '25',
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={[styles.content, { paddingTop: insets.top + 80 }]}>
          <Animated.View entering={FadeInDown.springify()} style={styles.header}>
            <View style={styles.iconContainer}>
              <Feather name="user-plus" size={32} color={Colors.light.primary} />
            </View>
            <ThemedText style={styles.title}>إضافة طالب جديد</ThemedText>
            <ThemedText style={styles.subtitle}>أدخل بيانات الطالب</ThemedText>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.form}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>الاسم بالكامل *</ThemedText>
              <View style={styles.inputWrapper}>
                <Feather name="user" size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="أدخل اسم الطالب"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={name}
                  onChangeText={setName}
                  textAlign="right"
                  autoFocus
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>رقم السكشن</ThemedText>
              <View style={styles.inputWrapper}>
                <Feather name="hash" size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="مثال: 1"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={section}
                  onChangeText={setSection}
                  keyboardType="number-pad"
                  textAlign="right"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>رقم التليفون</ThemedText>
              <View style={styles.inputWrapper}>
                <Feather name="phone" size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="01xxxxxxxxx"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  textAlign="right"
                />
              </View>
            </View>

            <AnimatedPressable
              onPress={handleAdd}
              onPressIn={() => { buttonScale.value = withSpring(0.96); }}
              onPressOut={() => { buttonScale.value = withSpring(1); }}
              style={[styles.addButton, buttonStyle]}
            >
              <Feather name="plus" size={20} color="#FFFFFF" />
              <ThemedText style={styles.addButtonText}>إضافة الطالب</ThemedText>
            </AnimatedPressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundRoot,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    ...Shadows.small,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
    textAlign: 'right',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  inputIcon: {
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    height: Spacing.inputHeight,
    fontSize: 16,
    color: Colors.light.text,
    paddingHorizontal: Spacing.md,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    ...Shadows.small,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
