import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/tokens';

type TextFieldProps = TextInputProps & {
  label?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  rightElement?: React.ReactNode;
};

export function TextField({
  label,
  helper,
  error,
  disabled = false,
  containerStyle,
  rightElement,
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.danger
    : focused
      ? colors.primary
      : colors.border;

  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputRow}>
        <TextInput
          editable={!disabled}
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            { borderColor },
            Boolean(rightElement) && styles.inputWithRightElement,
            disabled && styles.inputDisabled,
          ]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          accessibilityState={{ disabled }}
          {...inputProps}
        />
        {rightElement ? <View style={styles.rightElement}>{rightElement}</View> : null}
      </View>
      {error ? (
        <Text style={[styles.helper, styles.errorText]}>{error}</Text>
      ) : helper ? (
        <Text style={styles.helper}>{helper}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  inputRow: {
    justifyContent: 'center',
  },
  input: {
    ...typography.body,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radii.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  inputWithRightElement: {
    paddingRight: spacing.xxl,
  },
  inputDisabled: {
    backgroundColor: colors.hairline,
    color: colors.textMuted,
  },
  rightElement: {
    position: 'absolute',
    right: spacing.sm,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helper: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  errorText: {
    color: colors.danger,
  },
});
