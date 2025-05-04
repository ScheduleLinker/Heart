// ActionButtons.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // Import MemoryRouter
import ActionButtons from './ActionButtons'; // Your component that uses useNavigate

describe('ActionButtons Component', () => {
  it('renders FileUploadButton and CreateButton', () => {
    // Wrap the component in MemoryRouter to provide a routing context
    render(
      <MemoryRouter>
        <ActionButtons />
      </MemoryRouter>
    );


    expect(screen.getByTestId('file-upload-button')).toBeInTheDocument();
    expect(screen.getByTestId('create-button')).toBeInTheDocument();
  });
});
