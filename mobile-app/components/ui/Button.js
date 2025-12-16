import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Custom Button Component matching web app design
 * Variants: primary, secondary, outline, text
 * Sizes: small, medium, large
 */
const Button = ({
  children,
  onPress,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  ...props
}) => {
  const { theme } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 16, fontSize: 13 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 32, fontSize: 17 };
      case 'medium':
      default:
        return { paddingVertical: 12, paddingHorizontal: 24, fontSize: 15 };
    }
  };

  const sizeStyles = getSizeStyles();

  const getButtonContent = () => (
    <View style={styles.contentContainer}>
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? '#ffffff' : theme.colors.primary} />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.text,
              { fontSize: sizeStyles.fontSize },
              variant === 'primary' && { color: '#ffffff', fontWeight: '600' },
              variant === 'secondary' && { color: '#ffffff', fontWeight: '600' },
              variant === 'outline' && { color: theme.colors.primary, fontWeight: '600' },
              variant === 'text' && { color: theme.colors.primary, fontWeight: '500' },
              disabled && { color: theme.colors.text.disabled },
              textStyle,
            ]}
          >
            {children}
          </Text>
        </>
      )}
    </View>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={[
          styles.button,
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
          style,
        ]}
        {...props}
      >
        <LinearGradient
          colors={disabled ? ['#94a3b8', '#94a3b8'] : [theme.colors.primary, theme.colors.primaryDark]}
          style={[
            styles.gradient,
            {
              paddingVertical: sizeStyles.paddingVertical,
              paddingHorizontal: sizeStyles.paddingHorizontal,
            }
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {getButtonContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={[
          styles.button,
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
          style,
        ]}
        {...props}
      >
        <LinearGradient
          colors={disabled ? ['#94a3b8', '#94a3b8'] : [theme.colors.secondary, theme.colors.secondaryDark]}
          style={[
            styles.gradient,
            {
              paddingVertical: sizeStyles.paddingVertical,
              paddingHorizontal: sizeStyles.paddingHorizontal,
            }
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {getButtonContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.button,
        {
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
        },
        variant === 'outline' && {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: disabled ? theme.colors.border : theme.colors.primary,
        },
        variant === 'text' && {
          backgroundColor: 'transparent',
        },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {getButtonContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    textAlign: 'center',
    fontWeight: '600',
  },
  fullWidth: {
    width: '100%',
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default Button;
