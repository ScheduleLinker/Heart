import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import GlobalDragDrop from './GlobalDragDrop';

describe('GlobalDragDrop', () => {
  const onFilesDroppedMock = vi.fn();
  
  // Mock file data
  const createMockFile = (name: string, type: string, size: number = 1024) => {
    const file = new File(['mock file content'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    cleanup();
  });
  
  it('renders children correctly', () => {
    render(
      <GlobalDragDrop>
        <div data-testid="child-content">Test Content</div>
      </GlobalDragDrop>
    );
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
  
  it('shows overlay when dragging files', () => {
    render(
      <GlobalDragDrop onFilesDropped={onFilesDroppedMock}>
        <div>Test Content</div>
      </GlobalDragDrop>
    );
    
    // Initial state - overlay should not be visible
    expect(screen.queryByText(/Drop file\(s\) here/)).not.toBeInTheDocument();
    
    // Simulate drag enter
    fireEvent.dragEnter(document.body, {
      dataTransfer: {
        items: [{ kind: 'file' }],
      },
    });
    
    // Overlay should now be visible with PDF/ICS text
    expect(screen.getByText(/Drop file\(s\) here \(.pdf or .ics only\)/)).toBeInTheDocument();
    
    // Simulate drag leave
    fireEvent.dragLeave(document.body);
    
    // Overlay should be hidden again
    expect(screen.queryByText(/Drop file\(s\) here/)).not.toBeInTheDocument();
  });
  
  it('accepts PDF files and calls onFilesDropped', () => {
    render(
      <GlobalDragDrop onFilesDropped={onFilesDroppedMock} showFileList={true}>
        <div>Test Content</div>
      </GlobalDragDrop>
    );
    
    const pdfFile = createMockFile('document.pdf', 'application/pdf');
    
    // Simulate file drop
    fireEvent.drop(document.body, {
      dataTransfer: {
        files: [pdfFile],
        clearData: vi.fn(),
      },
    });
    
    // Check if callback was called with the PDF file
    expect(onFilesDroppedMock).toHaveBeenCalledTimes(1);
    expect(onFilesDroppedMock).toHaveBeenCalledWith([pdfFile]);
    
    // Check if file is displayed in file list
    expect(screen.getByText('document.pdf')).toBeInTheDocument();
  });
  
  it('accepts ICS files and calls onFilesDropped', () => {
    render(
      <GlobalDragDrop onFilesDropped={onFilesDroppedMock} showFileList={true}>
        <div>Test Content</div>
      </GlobalDragDrop>
    );
    
    const icsFile = createMockFile('calendar.ics', 'text/calendar');
    
    // Simulate file drop
    fireEvent.drop(document.body, {
      dataTransfer: {
        files: [icsFile],
        clearData: vi.fn(),
      },
    });
    
    // Check if callback was called with the ICS file
    expect(onFilesDroppedMock).toHaveBeenCalledTimes(1);
    expect(onFilesDroppedMock).toHaveBeenCalledWith([icsFile]);
    
    // Check if file is displayed in file list
    expect(screen.getByText('calendar.ics')).toBeInTheDocument();
  });
  
  it('accepts PDF files by extension even with different MIME type', () => {
    render(
      <GlobalDragDrop onFilesDropped={onFilesDroppedMock} showFileList={true}>
        <div>Test Content</div>
      </GlobalDragDrop>
    );
    
    // Some systems might report different MIME types
    const pdfFile = createMockFile('document.pdf', 'application/octet-stream');
    
    // Simulate file drop
    fireEvent.drop(document.body, {
      dataTransfer: {
        files: [pdfFile],
        clearData: vi.fn(),
      },
    });
    
    // Check if callback was called with the PDF file
    expect(onFilesDroppedMock).toHaveBeenCalledTimes(1);
    expect(onFilesDroppedMock).toHaveBeenCalledWith([pdfFile]);
  });
  
  it('accepts ICS files by extension even with different MIME type', () => {
    render(
      <GlobalDragDrop onFilesDropped={onFilesDroppedMock} showFileList={true}>
        <div>Test Content</div>
      </GlobalDragDrop>
    );
    
    // Some systems might report different MIME types
    const icsFile = createMockFile('calendar.ics', 'application/octet-stream');
    
    // Simulate file drop
    fireEvent.drop(document.body, {
      dataTransfer: {
        files: [icsFile],
        clearData: vi.fn(),
      },
    });
    
    // Check if callback was called with the ICS file
    expect(onFilesDroppedMock).toHaveBeenCalledTimes(1);
    expect(onFilesDroppedMock).toHaveBeenCalledWith([icsFile]);
  });
  
  it('rejects non-PDF and non-ICS files', async () => {
    render(
      <GlobalDragDrop onFilesDropped={onFilesDroppedMock} showFileList={true}>
        <div>Test Content</div>
      </GlobalDragDrop>
    );
    
    const imageFile = createMockFile('image.jpg', 'image/jpeg');
    
    // Simulate file drop
    fireEvent.drop(document.body, {
      dataTransfer: {
        files: [imageFile],
        clearData: vi.fn(),
      },
    });
    
    // Check if error message is displayed
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('Only .pdf and .ics files are allowed')).toBeInTheDocument();
    
    // Check that callback was not called
    expect(onFilesDroppedMock).not.toHaveBeenCalled();
    
    // Error should disappear after some time
    await waitFor(() => {
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    }, { timeout: 4000 });
  });
  
  it('accepts multiple valid files in one drop', () => {
    render(
      <GlobalDragDrop onFilesDropped={onFilesDroppedMock} showFileList={true}>
        <div>Test Content</div>
      </GlobalDragDrop>
    );
    
    const pdfFile = createMockFile('document.pdf', 'application/pdf');
    const icsFile = createMockFile('calendar.ics', 'text/calendar');
    
    // Simulate file drop with multiple files
    fireEvent.drop(document.body, {
      dataTransfer: {
        files: [pdfFile, icsFile],
        clearData: vi.fn(),
      },
    });
    
    // Check if callback was called with both files
    expect(onFilesDroppedMock).toHaveBeenCalledTimes(1);
    expect(onFilesDroppedMock).toHaveBeenCalledWith([pdfFile, icsFile]);
    
    // Check if both files are displayed
    expect(screen.getByText('document.pdf')).toBeInTheDocument();
    expect(screen.getByText('calendar.ics')).toBeInTheDocument();
  });
  
  it('filters out invalid files from mixed drop', () => {
    render(
      <GlobalDragDrop onFilesDropped={onFilesDroppedMock} showFileList={true}>
        <div>Test Content</div>
      </GlobalDragDrop>
    );
    
    const pdfFile = createMockFile('document.pdf', 'application/pdf');
    const imageFile = createMockFile('image.jpg', 'image/jpeg');
    const icsFile = createMockFile('calendar.ics', 'text/calendar');
    
    // Simulate file drop with mix of valid and invalid files
    fireEvent.drop(document.body, {
      dataTransfer: {
        files: [pdfFile, imageFile, icsFile],
        clearData: vi.fn(),
      },
    });
    
    // Check if callback was called with only valid files
    expect(onFilesDroppedMock).toHaveBeenCalledTimes(1);
    expect(onFilesDroppedMock).toHaveBeenCalledWith([pdfFile, icsFile]);
    
    // Check if only valid files are displayed
    expect(screen.getByText('document.pdf')).toBeInTheDocument();
    expect(screen.getByText('calendar.ics')).toBeInTheDocument();
    expect(screen.queryByText('image.jpg')).not.toBeInTheDocument();
  });
  
  it('accumulates files across multiple drops', () => {
    render(
      <GlobalDragDrop onFilesDropped={onFilesDroppedMock} showFileList={true}>
        <div>Test Content</div>
      </GlobalDragDrop>
    );
    
    // First drop
    const pdfFile = createMockFile('document.pdf', 'application/pdf');
    fireEvent.drop(document.body, {
      dataTransfer: {
        files: [pdfFile],
        clearData: vi.fn(),
      },
    });
    
    // Second drop
    const icsFile = createMockFile('calendar.ics', 'text/calendar');
    fireEvent.drop(document.body, {
      dataTransfer: {
        files: [icsFile],
        clearData: vi.fn(),
      },
    });
    
    // Check if both files are displayed
    expect(screen.getByText('document.pdf')).toBeInTheDocument();
    expect(screen.getByText('calendar.ics')).toBeInTheDocument();
    
    // Check callback calls
    expect(onFilesDroppedMock).toHaveBeenCalledTimes(2);
  });
  
  it('clears file list when delete button is clicked', () => {
    render(
      <GlobalDragDrop onFilesDropped={onFilesDroppedMock} showFileList={true}>
        <div>Test Content</div>
      </GlobalDragDrop>
    );
    
    const pdfFile = createMockFile('document.pdf', 'application/pdf');
    
    // Simulate file drop
    fireEvent.drop(document.body, {
      dataTransfer: {
        files: [pdfFile],
        clearData: vi.fn(),
      },
    });
    
    // Check file is displayed
    expect(screen.getByText('document.pdf')).toBeInTheDocument();
    
    // Click delete button
    fireEvent.click(screen.getByTestId('delete-button'));
    
    // Check file list is cleared
    expect(screen.queryByText('document.pdf')).not.toBeInTheDocument();
    expect(screen.queryByTestId('files-list')).not.toBeInTheDocument();
  });
  
  it('applies custom overlay class name', () => {
    render(
      <GlobalDragDrop overlayClassName="custom-test-overlay">
        <div>Test Content</div>
      </GlobalDragDrop>
    );
    
    // Simulate drag enter
    fireEvent.dragEnter(document.body, {
      dataTransfer: {
        items: [{ kind: 'file' }],
      },
    });
    
    // Check if custom class is applied
    const overlay = document.querySelector('.custom-test-overlay');
    expect(overlay).toBeInTheDocument();
  });
});