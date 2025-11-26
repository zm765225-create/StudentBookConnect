import React from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useApp, Message } from '@/store/AppContext';

interface MessageCardProps {
  message: Message;
  onMarkRead: () => void;
  index: number;
}

function MessageCard({ message, onMarkRead, index }: MessageCardProps) {
  const timeAgo = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diff = now.getTime() - messageDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `منذ ${days} يوم`;
    if (hours > 0) return `منذ ${hours} ساعة`;
    if (minutes > 0) return `منذ ${minutes} دقيقة`;
    return 'الآن';
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <Pressable
        onPress={() => {
          if (!message.read) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onMarkRead();
          }
        }}
        style={[styles.messageCard, !message.read && styles.messageCardUnread]}
      >
        <View style={styles.messageHeader}>
          <View style={styles.senderInfo}>
            <View style={[styles.avatar, !message.read && styles.avatarUnread]}>
              <ThemedText style={styles.avatarText}>{message.studentName.charAt(0)}</ThemedText>
            </View>
            <View style={styles.senderDetails}>
              <ThemedText style={styles.senderName}>{message.studentName}</ThemedText>
              <ThemedText style={styles.messageTime}>{timeAgo(message.timestamp)}</ThemedText>
            </View>
          </View>
          {!message.read ? (
            <View style={styles.unreadBadge}>
              <ThemedText style={styles.unreadText}>جديد</ThemedText>
            </View>
          ) : null}
        </View>
        <ThemedText style={styles.messageContent}>{message.content}</ThemedText>
        {!message.read ? (
          <View style={styles.markReadContainer}>
            <Feather name="check" size={14} color={Colors.light.primary} />
            <ThemedText style={styles.markReadText}>اضغط للتحديد كمقروء</ThemedText>
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const { messages, markMessageRead } = useApp();

  const sortedMessages = [...messages].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={sortedMessages}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + 80, paddingBottom: insets.bottom + Spacing['3xl'] }
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Animated.View entering={FadeInDown.springify()} style={styles.header}>
            <ThemedText style={styles.title}>الرسائل</ThemedText>
            {unreadCount > 0 ? (
              <ThemedText style={styles.subtitle}>{unreadCount} رسالة غير مقروءة</ThemedText>
            ) : (
              <ThemedText style={styles.subtitle}>جميع الرسائل مقروءة</ThemedText>
            )}
          </Animated.View>
        }
        renderItem={({ item, index }) => (
          <MessageCard
            message={item}
            onMarkRead={() => markMessageRead(item.id)}
            index={index}
          />
        )}
        ListEmptyComponent={
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.emptyState}>
            <Feather name="message-circle" size={64} color={Colors.light.textSecondary} />
            <ThemedText style={styles.emptyTitle}>لا توجد رسائل</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              ستظهر هنا الرسائل والملاحظات من الطلاب
            </ThemedText>
          </Animated.View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundRoot,
  },
  listContent: {
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
  messageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  messageCardUnread: {
    borderRightWidth: 4,
    borderRightColor: Colors.light.primary,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  avatarUnread: {
    backgroundColor: Colors.light.primary,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  senderDetails: {
    flex: 1,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'right',
  },
  messageTime: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
    textAlign: 'right',
  },
  unreadBadge: {
    backgroundColor: Colors.light.primary + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  messageContent: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'right',
  },
  markReadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: Spacing.xs,
  },
  markReadText: {
    fontSize: 12,
    color: Colors.light.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['5xl'],
  },
  emptyTitle: {
    fontSize: 18,
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
