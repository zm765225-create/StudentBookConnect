import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
import { RootStackParamList } from '@/navigation/RootNavigator';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type RouteParams = RouteProp<RootStackParamList, 'StudentDetail'>;

interface OrderItemProps {
  productName: string;
  productPrice: number;
  selected: boolean;
  paid: boolean;
  delivered: boolean;
  onToggleSelected: () => void;
  onTogglePaid: () => void;
  onToggleDelivered: () => void;
  index: number;
}

function OrderItem({
  productName,
  productPrice,
  selected,
  paid,
  delivered,
  onToggleSelected,
  onTogglePaid,
  onToggleDelivered,
  index,
}: OrderItemProps) {
  return (
    <Animated.View entering={FadeInDown.delay(200 + index * 50).springify()} style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <ThemedText style={styles.orderName}>{productName}</ThemedText>
          <ThemedText style={styles.orderPrice}>{productPrice} جنيه</ThemedText>
        </View>
      </View>

      <View style={styles.orderActions}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggleSelected();
          }}
          style={[styles.actionButton, selected && styles.actionButtonActive]}
        >
          <Feather 
            name={selected ? 'check-square' : 'square'} 
            size={18} 
            color={selected ? Colors.light.warning : Colors.light.textSecondary} 
          />
          <ThemedText style={[styles.actionText, selected && { color: Colors.light.warning }]}>
            مختار
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => {
            if (!selected) {
              Alert.alert('تنبيه', 'يجب اختيار المنتج أولاً');
              return;
            }
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onTogglePaid();
          }}
          style={[styles.actionButton, paid && styles.actionButtonActive, !selected && styles.actionButtonDisabled]}
        >
          <Feather 
            name={paid ? 'check-square' : 'square'} 
            size={18} 
            color={paid ? Colors.light.success : selected ? Colors.light.textSecondary : Colors.light.border} 
          />
          <ThemedText style={[styles.actionText, paid && { color: Colors.light.success }, !selected && { color: Colors.light.border }]}>
            مدفوع
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => {
            if (!paid) {
              Alert.alert('تنبيه', 'يجب تسجيل الدفع أولاً');
              return;
            }
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggleDelivered();
          }}
          style={[styles.actionButton, delivered && styles.actionButtonActive, !paid && styles.actionButtonDisabled]}
        >
          <Feather 
            name={delivered ? 'check-square' : 'square'} 
            size={18} 
            color={delivered ? Colors.light.accent : paid ? Colors.light.textSecondary : Colors.light.border} 
          />
          <ThemedText style={[styles.actionText, delivered && { color: Colors.light.accent }, !paid && { color: Colors.light.border }]}>
            مستلم
          </ThemedText>
        </Pressable>
      </View>
    </Animated.View>
  );
}

export default function StudentDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteParams>();
  const { studentId } = route.params;

  const { 
    getStudentById, 
    products, 
    updateStudent, 
    updateStudentOrder, 
    deleteStudent 
  } = useApp();

  const student = getStudentById(studentId);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(student?.name || '');
  const [editSection, setEditSection] = useState(student?.section || '');
  const [editPhone, setEditPhone] = useState(student?.phone || '');

  const buttonScale = useSharedValue(1);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  if (!student) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.emptyState, { paddingTop: insets.top + 100 }]}>
          <Feather name="alert-circle" size={48} color={Colors.light.error} />
          <ThemedText style={styles.emptyTitle}>الطالب غير موجود</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      Alert.alert('تنبيه', 'الرجاء إدخال اسم الطالب');
      return;
    }
    updateStudent(studentId, {
      name: editName.trim(),
      section: editSection.trim(),
      phone: editPhone.trim(),
    });
    setIsEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDelete = () => {
    Alert.alert(
      'حذف الطالب',
      `هل أنت متأكد من حذف "${student.name}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            deleteStudent(studentId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handlePayAll = () => {
    student.orders.forEach(order => {
      if (order.selected && !order.paid) {
        updateStudentOrder(studentId, order.productId, 'paid', true);
      }
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeliverPaid = () => {
    student.orders.forEach(order => {
      if (order.paid && !order.delivered) {
        updateStudentOrder(studentId, order.productId, 'delivered', true);
      }
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const totalAmount = student.orders.reduce((sum, order) => {
    if (order.selected) {
      const product = products.find(p => p.id === order.productId);
      return sum + (product?.price || 0);
    }
    return sum;
  }, 0);

  const paidAmount = student.orders.reduce((sum, order) => {
    if (order.paid) {
      const product = products.find(p => p.id === order.productId);
      return sum + (product?.price || 0);
    }
    return sum;
  }, 0);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 80, paddingBottom: insets.bottom + Spacing['3xl'] }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.springify()} style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <ThemedText style={styles.avatarText}>{student.name.charAt(0)}</ThemedText>
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="الاسم"
                placeholderTextColor={Colors.light.textSecondary}
                textAlign="right"
              />
              <TextInput
                style={styles.input}
                value={editSection}
                onChangeText={setEditSection}
                placeholder="رقم السكشن"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="number-pad"
                textAlign="right"
              />
              <TextInput
                style={styles.input}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="رقم التليفون"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="phone-pad"
                textAlign="right"
              />
              <View style={styles.editActions}>
                <Pressable
                  onPress={handleSaveEdit}
                  style={({ pressed }) => [styles.saveButton, { opacity: pressed ? 0.8 : 1 }]}
                >
                  <ThemedText style={styles.saveButtonText}>حفظ</ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => setIsEditing(false)}
                  style={({ pressed }) => [styles.cancelButton, { opacity: pressed ? 0.8 : 1 }]}
                >
                  <ThemedText style={styles.cancelButtonText}>إلغاء</ThemedText>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              <ThemedText style={styles.studentName}>{student.name}</ThemedText>
              <View style={styles.studentMeta}>
                {student.section ? (
                  <View style={styles.metaItem}>
                    <Feather name="hash" size={14} color={Colors.light.textSecondary} />
                    <ThemedText style={styles.metaText}>سكشن {student.section}</ThemedText>
                  </View>
                ) : null}
                {student.phone ? (
                  <View style={styles.metaItem}>
                    <Feather name="phone" size={14} color={Colors.light.textSecondary} />
                    <ThemedText style={styles.metaText}>{student.phone}</ThemedText>
                  </View>
                ) : null}
              </View>
              <Pressable
                onPress={() => setIsEditing(true)}
                style={({ pressed }) => [styles.editButton, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Feather name="edit-2" size={16} color={Colors.light.primary} />
                <ThemedText style={styles.editButtonText}>تعديل البيانات</ThemedText>
              </Pressable>
            </>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>إجمالي الطلب</ThemedText>
            <ThemedText style={styles.summaryValue}>{totalAmount} جنيه</ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>المدفوع</ThemedText>
            <ThemedText style={[styles.summaryValue, { color: Colors.light.success }]}>{paidAmount} جنيه</ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>المتبقي</ThemedText>
            <ThemedText style={[styles.summaryValue, { color: Colors.light.error }]}>{totalAmount - paidAmount} جنيه</ThemedText>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.quickActions}>
          <AnimatedPressable
            onPress={handlePayAll}
            onPressIn={() => { buttonScale.value = withSpring(0.96); }}
            onPressOut={() => { buttonScale.value = withSpring(1); }}
            style={[styles.quickButton, buttonStyle]}
          >
            <Feather name="credit-card" size={18} color="#FFFFFF" />
            <ThemedText style={styles.quickButtonText}>دفع الكل</ThemedText>
          </AnimatedPressable>
          <AnimatedPressable
            onPress={handleDeliverPaid}
            onPressIn={() => { buttonScale.value = withSpring(0.96); }}
            onPressOut={() => { buttonScale.value = withSpring(1); }}
            style={[styles.quickButton, styles.quickButtonSecondary, buttonStyle]}
          >
            <Feather name="check-circle" size={18} color={Colors.light.primary} />
            <ThemedText style={styles.quickButtonTextSecondary}>تسليم المدفوع</ThemedText>
          </AnimatedPressable>
        </Animated.View>

        <ThemedText style={styles.sectionTitle}>المنتجات</ThemedText>

        <View style={styles.ordersList}>
          {products.map((product, index) => {
            const order = student.orders.find(o => o.productId === product.id) || {
              productId: product.id,
              selected: false,
              paid: false,
              delivered: false,
            };
            return (
              <OrderItem
                key={product.id}
                productName={product.name}
                productPrice={product.price}
                selected={order.selected}
                paid={order.paid}
                delivered={order.delivered}
                onToggleSelected={() => updateStudentOrder(studentId, product.id, 'selected', !order.selected)}
                onTogglePaid={() => updateStudentOrder(studentId, product.id, 'paid', !order.paid)}
                onToggleDelivered={() => updateStudentOrder(studentId, product.id, 'delivered', !order.delivered)}
                index={index}
              />
            );
          })}
        </View>

        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => [styles.deleteButton, { opacity: pressed ? 0.8 : 1 }]}
        >
          <Feather name="trash-2" size={18} color={Colors.light.error} />
          <ThemedText style={styles.deleteButtonText}>حذف الطالب</ThemedText>
        </Pressable>
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
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  studentName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  studentMeta: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  editButtonText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  editForm: {
    width: '100%',
    gap: Spacing.md,
  },
  input: {
    height: 48,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    color: Colors.light.text,
  },
  editActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
    ...Shadows.small,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  quickButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.light.primary,
    height: 48,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  quickButtonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quickButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.md,
    textAlign: 'right',
  },
  ordersList: {
    gap: Spacing.md,
    marginBottom: Spacing['3xl'],
  },
  orderItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'right',
  },
  orderPrice: {
    fontSize: 14,
    color: Colors.light.primary,
    marginTop: 2,
    textAlign: 'right',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  actionButtonActive: {
    backgroundColor: Colors.light.backgroundSecondary,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  deleteButtonText: {
    fontSize: 16,
    color: Colors.light.error,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    color: Colors.light.text,
    marginTop: Spacing.lg,
  },
});
