import { render, screen } from '@testing-library/react';
import ActionButtons from './ActionButtons';
import { describe, it, expect } from 'vitest';

describe('ActionButtons Component', () => {
  it('renders FileUploadButton and CreateButton', () => {
    render(<ActionButtons />);
    
    // Check if FileUploadButton and CreateButton are in the document
    expect(screen.getByText(/create/i)).toBeInTheDocument();
    expect(screen.getByText(/upload/i)).toBeInTheDocument();
  });
});
