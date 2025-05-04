import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import FileUploadButton from './FileUploadButton';
import * as utils from '@/lib/utils';

// Create a mock navigate function
const navigateMock = vi.fn();

// Mock the react-router-dom's useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock
  };
});

// Mock the utility functions
vi.mock('@/lib/utils', () => ({
  FileUploadHandler: vi.fn(),
  localStorageDataValidation: vi.fn()
}));

describe('FileUploadButton', () => {
  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
    
    // Reset localStorage
    localStorage.clear();
    
    // Mock window.alert
    window.alert = vi.fn();
  });

  it('renders the upload button', () => {
    render(
      <BrowserRouter>
        <FileUploadButton />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('file-upload-button')).toBeInTheDocument();
    expect(screen.getByText('UPLOAD')).toBeInTheDocument();
  });

  it('shows an alert when a non-ics file is selected', async () => {
    render(
      <BrowserRouter>
        <FileUploadButton />
      </BrowserRouter>
    );
    
    const fileInput = screen.getByTestId('file-upload-button');
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(window.alert).toHaveBeenCalledWith('Please select a valid .ics file.');
    expect(utils.FileUploadHandler).not.toHaveBeenCalled();
  });

  it('processes ics file upload correctly', async () => {
    vi.mocked(utils.FileUploadHandler).mockResolvedValue(undefined);

    render(
      <BrowserRouter>
        <FileUploadButton />
      </BrowserRouter>
    );
    
    const fileInput = screen.getByTestId('file-upload-button');
    const file = new File(['test ics content'], 'calendar.ics', { type: 'text/calendar' });
    
    // Set up mock localStorage data
    const mockData = '{"events":[{"summary":"Test Event"}]}';
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(mockData);
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Verify processing state
    expect(screen.getByText('PROCESSING...')).toBeInTheDocument();
    
    await waitFor(() => {
      // Check if FileUploadHandler was called with the file
      expect(utils.FileUploadHandler).toHaveBeenCalledWith(file);
      
      // Check if localStorage was accessed
      expect(localStorage.getItem).toHaveBeenCalledWith('parsed-ics');
      
      // Check if data validation was performed
      expect(utils.localStorageDataValidation).toHaveBeenCalledWith(mockData);
      
      // Verify navigation was called
      expect(navigateMock).toHaveBeenCalledWith("/workspace");
    });
  });

  it('handles the case when no file is selected', () => {
    render(
      <BrowserRouter>
        <FileUploadButton />
      </BrowserRouter>
    );
    
    const fileInput = screen.getByTestId('file-upload-button');
    
    // Trigger change event without any files
    fireEvent.change(fileInput, { target: { files: [] } });
    
    // Nothing should happen, verify no functions were called
    expect(utils.FileUploadHandler).not.toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
  });
});