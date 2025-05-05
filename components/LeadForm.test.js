// components/LeadForm.test.js

import { render, screen, fireEvent } from '@testing-library/react';
import LeadForm from './LeadForm'; // Your Lead Form component

describe('LeadForm Validation', () => {
  test('shows error when the name is empty', () => {
    render(<LeadForm />);

    fireEvent.submit(screen.getByTestId('lead-form'));

    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  test('shows error when the email is invalid', () => {
    render(<LeadForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' },
    });
    fireEvent.submit(screen.getByTestId('lead-form'));

    expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
  });
});
