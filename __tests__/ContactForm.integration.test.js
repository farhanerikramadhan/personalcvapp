// __tests__/ContactForm.integration.test.js (opsional, kalau memang ada)
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ContactForm from '../components/ContactForm';

describe('<ContactForm /> integration', () => {
  it('menampilkan error saat submit kosong', async () => {
    const { getByText, getByTestId } = render(<ContactForm onSubmit={jest.fn()} />);
    fireEvent.press(getByTestId('submit-button'));
    await waitFor(() => {
      expect(getByText(/nama/i)).toBeTruthy();
    });
  });
});