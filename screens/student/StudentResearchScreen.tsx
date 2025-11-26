import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Modal, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useApp } from '@/store/AppContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ResearchCardProps {
  name: string;
  deadline?: string;
  submitted: boolean;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  onUpload: () => void;
  index: number;
}

function ResearchCard({ name, deadline, submitted, status, onUpload, index }: ResearchCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getStatusConfig = () => {
    if (!submitted) return { color: Colors.light.warning, label: 'لم يتم التسليم', icon: 'clock' as const };
    switch (status) {
      case 'accepted': return { color: Colors.light.success, label: 'مقبول', icon: 'check-circle' as const };
      case 'rejected': return { color: Colors.light.error, label: 'مرفوض', icon: 'x-circle' as const };
      case 'reviewed': return { color: Colors.light.accent, label: 'تمت المراجعة', icon: 'eye' as const };
      default: return { color: Colors.light.secondary, label: 'قيد المراجعة', icon: 'loader' as const };
    }
  };

  const config = getStatusConfig();

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <AnimatedPressable
        style={[styles.researchCard, animatedStyle]}
        onPressIn={() => { scale.value = withSpring(0.98); }}
        onPressOut={() => { scale.value = withSpring(1); }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.researchIcon}>
            <Feather name="file-text" size={24} color={Colors.light.primary} />
          </View>
          <View style={styles.researchInfo}>
            <ThemedText style={styles.researchName}>{name}</ThemedText>
            {deadline ? (
              <ThemedText style={styles.researchDeadline}>موعد التسليم: {deadline}</ThemedText>
            ) : null}
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: config.color + '20' }]}>
          <Feather name={config.icon} size={14} color={config.color} />
          <ThemedText style={[styles.statusText, { color: config.color }]}>{config.label}</ThemedText>
        </View>

        {!submitted ? (
          <Pressable 
            style={({ pressed }) => [styles.uploadButton, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onUpload();
            }}
          >
            <Feather name="upload" size={18} color="#FFFFFF" />
            <ThemedText style={styles.uploadButtonText}>رفع البحث</ThemedText>
          </Pressable>
        ) : null}
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function StudentResearchScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { researches, currentStudentId, getStudentById, updateStudentResearch, addMessage } = useApp();

  const currentStudent = currentStudentId ? getStudentById(currentStudentId) : null;

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const buttonScale = useSharedValue(1);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleUpload = (researchId: string) => {
    if (!currentStudentId) return;
    updateStudentResearch(currentStudentId, researchId, { submitted: true, status: 'pending' });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('تم', 'تم رفع البحث بنجاح');
  };

  const handleSendNote = () => {
    if (!noteText.trim() || !currentStudentId || !currentStudent) return;
    addMessage(currentStudentId, currentStudent.name, noteText.trim());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setNoteText('');
    setShowNoteModal(false);
    Alert.alert('تم', 'تم إرسال الملاحظة للمسؤول');
  };

  if (!currentStudent) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.emptyState, { paddingTop: insets.top + Spacing['5xl'] }]}>
          <Feather name="user" size={64} color={Colors.light.textSecondary} />
          <ThemedText style={styles.emptyTitle}>سجل بياناتك أولاً</ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            انتقل لصفحة "بياناتي" لتسجيل بياناتك
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: tabBarHeight + 100 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
          <ThemedText style={styles.title}>الأبحاث</ThemedText>
          <ThemedText style={styles.subtitle}>متابعة وتسليم الأبحاث المطلوبة</ThemedText>
        </Animated.View>

        {researches.length > 0 ? (
          <View style={styles.researchList}>
            {researches.map((research, index) => {
              const studentResearch = currentStudent.researches.find(r => r.researchId === research.id);
              return (
                <ResearchCard
                  key={research.id}
                  name={research.name}
                  deadline={research.deadline}
                  submitted={studentResearch?.submitted || false}
                  status={studentResearch?.status || 'pending'}
                  onUpload={() => handleUpload(research.id)}
                  index={index}
                />
              );
            })}
          </View>
        ) : (
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.noResearchCard}>
            <Feather name="file-text" size={48} color={Colors.light.textSecondary} />
            <ThemedText style={styles.noResearchText}>لا توجد أبحاث مطلوبة حالياً</ThemedText>
          </Animated.View>
        )}
      </ScrollView>

      <AnimatedPressable
        onPress={() => setShowNoteModal(true)}
        onPressIn={() => { buttonScale.value = withSpring(0.95); }}
        onPressOut={() => { buttonScale.value = withSpring(1); }}
        style={[styles.fab, buttonStyle, { bottom: tabBarHeight + Spacing.xl }]}
      >
        <Feather name="message-square" size={24} color="#FFFFFF" />
      </AnimatedPressable>

      <Modal
        visible={showNoteModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowNoteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowNoteModal(false)} />
          <Animated.View entering={FadeInDown.springify()} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>إرسال ملاحظة للمسؤول</ThemedText>
              <Pressable onPress={() => setShowNoteModal(false)}>
                <Feather name="x" size={24} color={Colors.light.text} />
              </Pressable>
            </View>
            <TextInput
              style={styles.noteInput}
              placeholder="اكتب ملاحظتك هنا..."
              placeholderTextColor={Colors.light.textSecondary}
              value={noteText}
              onChangeText={setNoteText}
              multiline
              textAlignVertical="top"
              textAlign="right"
            />
            <Pressable
              style={({ pressed }) => [styles.sendButton, { opacity: pressed ? 0.8 : 1 }]}
              onPress={handleSendNote}
            >
              <ThemedText style={styles.sendButtonText}>إرسال</ThemedText>
              <Feather name="send" size={18} color="#FFFFFF" />
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
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
  researchList: {
    gap: Spacing.md,
  },
  researchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  researchIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  researchInfo: {
    flex: 1,
  },
  researchName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'right',
  },
  researchDeadline: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
    textAlign: 'right',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  uploadButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  noResearchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing['3xl'],
    alignItems: 'center',
    ...Shadows.small,
  },
  noResearchText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: Spacing.lg,
  },
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.xl,
    paddingBottom: Spacing['4xl'],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  noteInput: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    fontSize: 16,
    color: Colors.light.text,
    minHeight: 120,
    marginBottom: Spacing.lg,
  },
  sendButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['3xl'],
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
