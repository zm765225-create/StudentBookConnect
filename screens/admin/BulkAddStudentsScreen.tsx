import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView, Alert } from 'react-native';
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

export default function BulkAddStudentsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { bulkAddStudents } = useApp();

  const [text, setText] = useState('');
  const buttonScale = useSharedValue(1);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const parsedNames = text
    .split(/[\n,،]/)
    .map(name => name.trim())
    .filter(name => name.length > 0);

  const handleAdd = () => {
    if (parsedNames.length === 0) {
      Alert.alert('تنبيه', 'الرجاء إدخال أسماء الطلاب');
      return;
    }

    Alert.alert(
      'تأكيد الإضافة',
      `سيتم إضافة ${parsedNames.length} طالب. هل تريد المتابعة؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'إضافة',
          onPress: () => {
            bulkAddStudents(parsedNames);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 80, paddingBottom: insets.bottom + Spacing['3xl'] }
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
          <View style={styles.iconContainer}>
            <Feather name="upload" size={32} color={Colors.light.primary} />
          </View>
          <ThemedText style={styles.title}>إضافة طلاب بالجملة</ThemedText>
          <ThemedText style={styles.subtitle}>انسخ قائمة الأسماء والصقها هنا</ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.card}>
          <View style={styles.instructions}>
            <ThemedText style={styles.instructionsTitle}>التعليمات:</ThemedText>
            <ThemedText style={styles.instructionsText}>
              - أدخل اسم كل طالب في سطر جديد{'\n'}
              - أو افصل الأسماء بفاصلة (،){'\n'}
              - يمكنك نسخ القائمة من Excel أو أي ملف نصي
            </ThemedText>
          </View>

          <TextInput
            style={styles.textArea}
            placeholder="أحمد محمد علي
فاطمة حسن محمود
محمد أحمد سعيد
..."
            placeholderTextColor={Colors.light.textSecondary}
            value={text}
            onChangeText={setText}
            multiline
            textAlignVertical="top"
            textAlign="right"
          />

          {parsedNames.length > 0 ? (
            <View style={styles.preview}>
              <ThemedText style={styles.previewTitle}>
                الأسماء المستخرجة ({parsedNames.length}):
              </ThemedText>
              <View style={styles.namesList}>
                {parsedNames.slice(0, 10).map((name, index) => (
                  <View key={index} style={styles.nameChip}>
                    <ThemedText style={styles.nameChipText}>{name}</ThemedText>
                  </View>
                ))}
                {parsedNames.length > 10 ? (
                  <View style={styles.nameChip}>
                    <ThemedText style={styles.nameChipText}>+{parsedNames.length - 10} آخرين</ThemedText>
                  </View>
                ) : null}
              </View>
            </View>
          ) : null}

          <AnimatedPressable
            onPress={handleAdd}
            onPressIn={() => { buttonScale.value = withSpring(0.96); }}
            onPressOut={() => { buttonScale.value = withSpring(1); }}
            style={[styles.addButton, buttonStyle, parsedNames.length === 0 && styles.addButtonDisabled]}
            disabled={parsedNames.length === 0}
          >
            <Feather name="users" size={20} color="#FFFFFF" />
            <ThemedText style={styles.addButtonText}>
              إضافة {parsedNames.length > 0 ? `${parsedNames.length} طالب` : 'الطلاب'}
            </ThemedText>
          </AnimatedPressable>
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundRoot,
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    ...Shadows.small,
  },
  instructions: {
    backgroundColor: Colors.light.primary + '10',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: Spacing.sm,
    textAlign: 'right',
  },
  instructionsText: {
    fontSize: 13,
    color: Colors.light.text,
    textAlign: 'right',
  },
  textArea: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    fontSize: 16,
    color: Colors.light.text,
    minHeight: 200,
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  preview: {
    marginBottom: Spacing.lg,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.md,
    textAlign: 'right',
  },
  namesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  nameChip: {
    backgroundColor: Colors.light.primary + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  nameChipText: {
    fontSize: 12,
    color: Colors.light.primary,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.small,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
