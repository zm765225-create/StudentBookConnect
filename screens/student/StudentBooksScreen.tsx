import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useApp } from '@/store/AppContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface BookCardProps {
  name: string;
  price: number;
  isSelected: boolean;
  onToggle: () => void;
  index: number;
}

function BookCard({ name, price, isSelected, onToggle, index }: BookCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.95, { damping: 15 });
    setTimeout(() => {
      scale.value = withSpring(1);
    }, 100);
    onToggle();
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <AnimatedPressable
        onPress={handlePress}
        style={[
          styles.bookCard,
          isSelected && styles.bookCardSelected,
          animatedStyle,
        ]}
      >
        <View style={styles.bookInfo}>
          <View style={styles.bookIcon}>
            <Feather 
              name="book" 
              size={24} 
              color={isSelected ? Colors.light.primary : Colors.light.textSecondary} 
            />
          </View>
          <View style={styles.bookDetails}>
            <ThemedText style={styles.bookName}>{name}</ThemedText>
            <ThemedText style={styles.bookPrice}>{price} جنيه</ThemedText>
          </View>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected ? (
            <Feather name="check" size={16} color="#FFFFFF" />
          ) : null}
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function StudentBooksScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { products, currentStudentId, getStudentById, updateStudentOrder, addMessage } = useApp();

  const currentStudent = currentStudentId ? getStudentById(currentStudentId) : null;
  const [localSelections, setLocalSelections] = useState<{ [key: string]: boolean }>(
    currentStudent?.orders.reduce((acc, order) => ({ ...acc, [order.productId]: order.selected }), {}) || {}
  );

  const buttonScale = useSharedValue(1);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const selectedProducts = products.filter(p => localSelections[p.id]);
  const total = selectedProducts.reduce((sum, p) => sum + p.price, 0);

  const handleToggle = (productId: string) => {
    setLocalSelections(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleSubmit = () => {
    if (!currentStudentId || !currentStudent) {
      Alert.alert('تنبيه', 'الرجاء تسجيل بياناتك أولاً');
      return;
    }

    if (selectedProducts.length === 0) {
      Alert.alert('تنبيه', 'الرجاء اختيار منتج واحد على الأقل');
      return;
    }

    products.forEach(product => {
      updateStudentOrder(currentStudentId, product.id, 'selected', !!localSelections[product.id]);
    });

    const selectedNames = selectedProducts.map(p => p.name).join('، ');
    addMessage(
      currentStudentId,
      currentStudent.name,
      `طلب جديد: ${selectedNames} - الإجمالي: ${total} جنيه`
    );

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('تم', 'تم إرسال طلبك بنجاح');
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
          <ThemedText style={styles.title}>اختيار الكتب</ThemedText>
          <ThemedText style={styles.subtitle}>اختر الكتب التي تريد شراءها</ThemedText>
        </Animated.View>

        <View style={styles.booksContainer}>
          {products.map((product, index) => (
            <BookCard
              key={product.id}
              name={product.name}
              price={product.price}
              isSelected={!!localSelections[product.id]}
              onToggle={() => handleToggle(product.id)}
              index={index}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: tabBarHeight + Spacing.lg }]}>
        <View style={styles.totalContainer}>
          <ThemedText style={styles.totalLabel}>الإجمالي</ThemedText>
          <ThemedText style={styles.totalAmount}>{total} جنيه</ThemedText>
        </View>
        <AnimatedPressable
          onPress={handleSubmit}
          onPressIn={() => { buttonScale.value = withSpring(0.96); }}
          onPressOut={() => { buttonScale.value = withSpring(1); }}
          style={[styles.submitButton, buttonStyle, selectedProducts.length === 0 && styles.submitButtonDisabled]}
          disabled={selectedProducts.length === 0}
        >
          <ThemedText style={styles.submitButtonText}>إرسال الطلب</ThemedText>
          <Feather name="send" size={20} color="#FFFFFF" />
        </AnimatedPressable>
      </View>
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
  booksContainer: {
    gap: Spacing.md,
  },
  bookCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.small,
  },
  bookCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: 'rgba(26, 95, 122, 0.05)',
  },
  bookInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bookIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  bookDetails: {
    flex: 1,
  },
  bookName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
    textAlign: 'right',
  },
  bookPrice: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
    textAlign: 'right',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    ...Shadows.medium,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'right',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    height: 48,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
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
