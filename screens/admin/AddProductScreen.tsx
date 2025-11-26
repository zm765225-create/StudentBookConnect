import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
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

type RouteParams = RouteProp<RootStackParamList, 'AddProduct'>;

export default function AddProductScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteParams>();
  const productId = route.params?.productId;

  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const existingProduct = productId ? products.find(p => p.id === productId) : null;

  const [name, setName] = useState(existingProduct?.name || '');
  const [price, setPrice] = useState(existingProduct?.price?.toString() || '');
  const [stock, setStock] = useState(existingProduct?.stock?.toString() || '100');

  const buttonScale = useSharedValue(1);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('تنبيه', 'الرجاء إدخال اسم المنتج');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('تنبيه', 'الرجاء إدخال سعر صحيح');
      return;
    }

    const stockNum = parseInt(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      Alert.alert('تنبيه', 'الرجاء إدخال كمية صحيحة');
      return;
    }

    if (existingProduct) {
      updateProduct(productId!, {
        name: name.trim(),
        price: priceNum,
        stock: stockNum,
      });
    } else {
      addProduct({
        name: name.trim(),
        price: priceNum,
        stock: stockNum,
      });
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!existingProduct) return;

    Alert.alert(
      'حذف المنتج',
      `هل أنت متأكد من حذف "${existingProduct.name}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            deleteProduct(productId!);
            navigation.goBack();
          },
        },
      ]
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
            { paddingTop: insets.top + 80, paddingBottom: insets.bottom + Spacing['3xl'] }
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.springify()} style={styles.header}>
            <View style={styles.iconContainer}>
              <Feather name="package" size={32} color={Colors.light.primary} />
            </View>
            <ThemedText style={styles.title}>
              {existingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {existingProduct ? 'تعديل بيانات المنتج' : 'أدخل بيانات المنتج الجديد'}
            </ThemedText>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.form}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>اسم المنتج *</ThemedText>
              <View style={styles.inputWrapper}>
                <Feather name="tag" size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="مثال: كتاب الحياكة"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={name}
                  onChangeText={setName}
                  textAlign="right"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>السعر (جنيه) *</ThemedText>
              <View style={styles.inputWrapper}>
                <Feather name="dollar-sign" size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="مثال: 120"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  textAlign="right"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>الكمية المتاحة</ThemedText>
              <View style={styles.inputWrapper}>
                <Feather name="box" size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="مثال: 100"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={stock}
                  onChangeText={setStock}
                  keyboardType="numeric"
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
              <Feather name={existingProduct ? 'check' : 'plus'} size={20} color="#FFFFFF" />
              <ThemedText style={styles.saveButtonText}>
                {existingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
              </ThemedText>
            </AnimatedPressable>

            {existingProduct ? (
              <Pressable
                onPress={handleDelete}
                style={({ pressed }) => [styles.deleteButton, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Feather name="trash-2" size={18} color={Colors.light.error} />
                <ThemedText style={styles.deleteButtonText}>حذف المنتج</ThemedText>
              </Pressable>
            ) : null}
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
  saveButton: {
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
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  deleteButtonText: {
    fontSize: 16,
    color: Colors.light.error,
  },
});
