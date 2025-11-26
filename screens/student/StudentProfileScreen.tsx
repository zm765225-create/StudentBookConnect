import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useApp } from '@/store/AppContext';
import { RootStackParamList } from '@/navigation/RootNavigator';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function StudentProfileScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { currentStudentId, getStudentById, addStudent, updateStudent, setCurrentStudent } = useApp();

  const currentStudent = currentStudentId ? getStudentById(currentStudentId) : null;

  const [name, setName] = useState(currentStudent?.name || '');
  const [section, setSection] = useState(currentStudent?.section || '');
  const [phone, setPhone] = useState(currentStudent?.phone || '');
  const [isSaved, setIsSaved] = useState(!!currentStudent);

  const buttonScale = useSharedValue(1);
  const checkScale = useSharedValue(0);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('تنبيه', 'الرجاء إدخال الاسم');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (currentStudent) {
      updateStudent(currentStudent.id, { name: name.trim(), section: section.trim(), phone: phone.trim() });
    } else {
      const newStudent = addStudent({ name: name.trim(), section: section.trim(), phone: phone.trim(), academicYear: '25' });
      setCurrentStudent(newStudent.id);
    }

    setIsSaved(true);
    checkScale.value = withSpring(1, { damping: 10 });
    setTimeout(() => {
      checkScale.value = withSpring(0);
    }, 2000);
  };

  const handleExit = () => {
    setCurrentStudent(null);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'ModeSelection' }],
      })
    );
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + Spacing['3xl'], paddingBottom: tabBarHeight + Spacing['3xl'] }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
            <View style={styles.avatarContainer}>
              <Feather name="user" size={40} color={Colors.light.primary} />
            </View>
            <ThemedText style={styles.title}>بياناتي</ThemedText>
            <ThemedText style={styles.subtitle}>أدخل بياناتك للمتابعة</ThemedText>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>الاسم بالكامل</ThemedText>
              <View style={styles.inputWrapper}>
                <Feather name="user" size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="أدخل اسمك"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={name}
                  onChangeText={(text) => { setName(text); setIsSaved(false); }}
                  textAlign="right"
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
                  onChangeText={(text) => { setSection(text); setIsSaved(false); }}
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
                  onChangeText={(text) => { setPhone(text); setIsSaved(false); }}
                  keyboardType="phone-pad"
                  textAlign="right"
                />
              </View>
            </View>

            <AnimatedPressable
              onPress={handleSave}
              onPressIn={() => { buttonScale.value = withSpring(0.96); }}
              onPressOut={() => { buttonScale.value = withSpring(1); }}
              style={[styles.saveButton, buttonStyle]}
            >
              <Animated.View style={[styles.checkIcon, checkStyle]}>
                <Feather name="check" size={24} color="#FFFFFF" />
              </Animated.View>
              <ThemedText style={styles.saveButtonText}>
                {isSaved ? 'تم الحفظ' : 'حفظ البيانات'}
              </ThemedText>
            </AnimatedPressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Pressable
              onPress={handleExit}
              style={({ pressed }) => [styles.exitButton, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Feather name="log-out" size={20} color={Colors.light.error} />
              <ThemedText style={styles.exitButtonText}>خروج</ThemedText>
            </Pressable>
          </Animated.View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
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
  saveButton: {
    backgroundColor: Colors.light.primary,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    ...Shadows.small,
  },
  checkIcon: {
    marginRight: Spacing.sm,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  exitButtonText: {
    fontSize: 16,
    color: Colors.light.error,
  },
});
