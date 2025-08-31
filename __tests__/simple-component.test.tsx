// Simple test to verify Jest setup is working
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, Text, TouchableOpacity } from 'react-native';

// Simple component without complex dependencies
const SimpleButton = ({ onPress, text }: { onPress: () => void; text: string }) => {
  return (
    <TouchableOpacity onPress={onPress} testID="simple-button">
      <Text testID="button-text">{text}</Text>
    </TouchableOpacity>
  );
};

describe('Simple Component Test', () => {
  it('should render correctly', () => {
    const { getByTestId } = render(<SimpleButton onPress={() => {}} text="Click Me" />);

    const button = getByTestId('simple-button');
    const text = getByTestId('button-text');

    expect(button).toBeTruthy();
    expect(text).toBeTruthy();
  });

  it('should handle press events', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(<SimpleButton onPress={mockOnPress} text="Click Me" />);

    const button = getByTestId('simple-button');
    fireEvent.press(button);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should display the correct text', () => {
    const { getByText } = render(<SimpleButton onPress={() => {}} text="Test Button" />);

    expect(getByText('Test Button')).toBeTruthy();
  });
});
