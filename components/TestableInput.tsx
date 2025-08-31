import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface TestableInputProps extends Omit<TextInputProps, 'testID'> {
  testID: string;
  label?: string;
  error?: string;
  required?: boolean;
  secureTextEntry?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

/**
 * Input component with data-testid for E2E testing
 */
export const TestableInput: React.FC<TestableInputProps> = ({
  testID,
  label,
  error,
  required = false,
  secureTextEntry = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  value,
  onChangeText,
  placeholder,
  editable = true,
  ...props
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  const toggleSecureEntry = () => {
    setIsSecure(!isSecure);
  };

  const getInputStyle = () => {
    const styles = [inputStyles.input];

    if (leftIcon) {
      styles.push(inputStyles.inputWithLeftIcon);
    }

    if (rightIcon || secureTextEntry) {
      styles.push(inputStyles.inputWithRightIcon);
    }

    if (error) {
      styles.push(inputStyles.inputError);
    }

    if (isFocused) {
      styles.push(inputStyles.inputFocused);
    }

    if (!editable) {
      styles.push(inputStyles.inputDisabled);
    }

    return styles;
  };

  return (
    <View style={inputStyles.container} testID={`${testID}-container`}>
      {label && (
        <Text style={inputStyles.label} testID={`${testID}-label`}>
          {label}
          {required && <Text style={inputStyles.required}> *</Text>}
        </Text>
      )}

      <View style={inputStyles.inputContainer}>
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={20}
            color="#666"
            style={inputStyles.leftIcon}
            testID={`${testID}-left-icon`}
          />
        )}

        <TextInput
          {...props}
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          secureTextEntry={isSecure}
          editable={editable}
          style={getInputStyle()}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={label || placeholder}
          accessibilityHint={error || undefined}
          accessibilityState={{
            disabled: !editable,
          }}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={toggleSecureEntry}
            style={inputStyles.rightIcon}
            testID={`${testID}-toggle-secure`}
            accessibilityLabel={isSecure ? 'Show password' : 'Hide password'}
          >
            <Icon name={isSecure ? 'visibility' : 'visibility-off'} size={20} color="#666" />
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={inputStyles.rightIcon}
            testID={`${testID}-right-icon`}
            disabled={!onRightIconPress}
          >
            <Icon name={rightIcon} size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={inputStyles.error} testID={`${testID}-error`}>
          {error}
        </Text>
      )}
    </View>
  );
};

const inputStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FFF',
  },
  inputWithLeftIcon: {
    paddingLeft: 44,
  },
  inputWithRightIcon: {
    paddingRight: 44,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  inputFocused: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  inputDisabled: {
    backgroundColor: '#F5F5F5',
    color: '#999',
  },
  leftIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  rightIcon: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  error: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
    marginLeft: 4,
  },
});
