// GlobalDragDrop.test.tsx
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import GlobalDragDrop from './GlobalDragDrop';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, beforeEach, vi, expect } from 'vitest';

// Mock the utils functions
vi.mock('@/lib/utils', () => ({
  FileUploadHandler: vi.fn().mockResolvedValue(undefined),
  localStorageDataValidation: vi.fn(),
}));

import { FileUploadHandler, localStorageDataValidation } from '@/lib/utils';

// Mock useNavigate from react-router-dom
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('GlobalDragDrop Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('shows overlay on drag and navigates after valid file drop', async () => {
    // Create a dummy .ics file
    const dummyFile = new File(['dummy content'], 'test.ics', {
      type: 'text/calendar',
    });

    render(
      <MemoryRouter>
        <GlobalDragDrop>
          <div>Test Content</div>
        </GlobalDragDrop>
      </MemoryRouter>
    );

    // Simulate drag enter event to show overlay
    fireEvent.dragEnter(document.body, {
      dataTransfer: {
        items: [{ kind: 'file', type: 'text/calendar' }],
      },
    });

    // The overlay should be visible with the drop prompt text
    expect(screen.getByText(/Release to Upload/i)).toBeInTheDocument();

    // Simulate drop event with valid file data
    fireEvent.drop(document.body, {
      dataTransfer: {
        files: [dummyFile],
        items: [
          {
            kind: 'file',
            type: 'text/calendar',
            getAsFile: () => dummyFile,
          },
        ],
      },
    });

    // Wait for asynchronous operations
    await waitFor(() => {
      // Ensure the overlay is removed
      expect(screen.queryByText(/Release to Upload/i)).not.toBeInTheDocument();
      // Check that FileUploadHandler is called
      expect(FileUploadHandler).toHaveBeenCalled();
      // Check that localStorageDataValidation is called
      expect(localStorageDataValidation).toHaveBeenCalled();
      // And that navigation to /workspace occurred
      expect(mockedNavigate).toHaveBeenCalledWith('/workspace');
    });
  });

  it('shows error if dropped file is not a .ics file', async () => {
    const dummyFile = new File(['dummy content'], 'test.txt', {
      type: 'text/plain',
    });

    render(
      <MemoryRouter>
        <GlobalDragDrop>
          <div>Test Content</div>
        </GlobalDragDrop>
      </MemoryRouter>
    );

    // Simulate drag enter event
    fireEvent.dragEnter(document.body, {
      dataTransfer: {
        items: [{ kind: 'file', type: 'text/plain' }],
      },
    });

    // The overlay should appear
    expect(screen.getByText(/Release to Upload/i)).toBeInTheDocument();

    // Simulate drop event with an invalid file type
    fireEvent.drop(document.body, {
      dataTransfer: {
        files: [dummyFile],
        items: [
          {
            kind: 'file',
            type: 'text/plain',
            getAsFile: () => dummyFile,
          },
        ],
      },
    });

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Only \.ics files are allowed/i)).toBeInTheDocument();
      // Navigation should not be triggered on error
      expect(mockedNavigate).not.toHaveBeenCalled();
    });
  });
});
