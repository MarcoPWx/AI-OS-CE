describe('Simple Test', () => {
  test('should work', () => {
    expect(1 + 1).toBe(2);
  });

  test('should handle strings', () => {
    expect('hello').toBe('hello');
  });

  test('should handle arrays', () => {
    expect([1, 2, 3]).toHaveLength(3);
  });
});
