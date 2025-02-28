import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateButton from './CreateButton'; // Adjust path if needed
import { describe, it, expect } from 'vitest';

describe('CreateButton Component', () => {
  it('renders correctly with initial state', () => {
    render(<CreateButton />);
    
    // Check for initial button text
    expect(screen.getByText('CREATE')).toBeInTheDocument();
  });

  it('changes to "INITIALIZING..." when clicked and reverts after delay', async () => {
    render(<CreateButton />);
    
    const button = screen.getByRole('button');

    // Click the button
    fireEvent.click(button);

    // Expect the text to change to "INITIALIZING..."
    expect(screen.getByText('INITIALIZING...')).toBeInTheDocument();

    // Wait for the text to revert back
    await waitFor(() => expect(screen.getByText('CREATE')).toBeInTheDocument(), { timeout: 1000 });
  });

  it('disables the button while creating', async () => {
    render(<CreateButton />);
    
    const button = screen.getByRole('button');

    // Click to start creation
    fireEvent.click(button);
    
    // Ensure button is disabled
    expect(button).toBeDisabled();

    // Wait for the process to finish
    await waitFor(() => expect(button).not.toBeDisabled(), { timeout: 1000 });
  });
});
