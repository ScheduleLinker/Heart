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

    // Overlay should now be visible with ICS text
    expect(screen.getByText(/Drop file\(s\) here \(.ics only\)/)).toBeInTheDocument();

    // Simulate drag leave
    fireEvent.dragLeave(document.body);

    // Overlay should be hidden again
    expect(screen.queryByText(/Drop file\(s\) here/)).not.toBeInTheDocument();
  });

  it('accepts ICS files regardless of MIME type', () => {
    render(
      <GlobalDragDrop onFilesDropped={onFilesDroppedMock} showFileList={true}>
        <div>Test Content</div>
      </GlobalDragDrop>
    );

    // Create ICS files with different MIME types
    const icsFile1 = createMockFile('calendar.ics', 'text/calendar');
    const icsFile2 = createMockFile('event.ics', 'application/octet-stream');

    // Simulate file drop
    fireEvent.drop(document.body, {
      dataTransfer: {
        files: [icsFile1, icsFile2],
        clearData: vi.fn(),
      },
    });

    // Check if callback was called with both ICS files
    expect(onFilesDroppedMock).toHaveBeenCalledTimes(1);
    expect(onFilesDroppedMock).toHaveBeenCalledWith([icsFile1, icsFile2]);

    // Check if both files are displayed in the file list
    expect(screen.getByText('calendar.ics')).toBeInTheDocument();
    expect(screen.getByText('event.ics')).toBeInTheDocument();
  });

  it('rejects non-ICS files', async () => {
    render(
      <GlobalDragDrop onFilesDropped={onFilesDroppedMock} showFileList={true}>
        <div>Test Content</div>
      </GlobalDragDrop>
    );

    const pdfFile = createMockFile('document.pdf', 'application/pdf');
    const imageFile = createMockFile('image.jpg', 'image/jpeg');

    // Simulate file drop with invalid files
    fireEvent.drop(document.body, {
      dataTransfer: {
        files: [pdfFile, imageFile],
        clearData: vi.fn(),
      },
    });

    // Check if error message is displayed
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('Only .ics files are allowed')).toBeInTheDocument();

    // Check that callback was not called
    expect(onFilesDroppedMock).not.toHaveBeenCalled();

    // Error should disappear after some time
    await waitFor(() => {
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    }, { timeout: 4000 });
  });

  it('filters out invalid files from mixed drop', () => {
    render(
      <GlobalDragDrop onFilesDropped={onFilesDroppedMock} showFileList={true}>
        <div>Test Content</div>
      </GlobalDragDrop>
    );

    const icsFile = createMockFile('calendar.ics', 'text/calendar');
    const pdfFile = createMockFile('document.pdf', 'application/pdf');

    // Simulate file drop with mix of valid and invalid files
    fireEvent.drop(document.body, {
      dataTransfer: {
        files: [icsFile, pdfFile],
        clearData: vi.fn(),
      },
    });

    // Check if callback was called with only the valid ICS file
    expect(onFilesDroppedMock).toHaveBeenCalledTimes(1);
    expect(onFilesDroppedMock).toHaveBeenCalledWith([icsFile]);

    // Check if only the valid file is displayed
    expect(screen.getByText('calendar.ics')).toBeInTheDocument();
    expect(screen.queryByText('document.pdf')).not.toBeInTheDocument();
  });

  it('clears file list when delete button is clicked', () => {
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

    // Check file is displayed
    expect(screen.getByText('calendar.ics')).toBeInTheDocument();

    // Click delete button
    fireEvent.click(screen.getByTestId('delete-button'));

    // Check file list is cleared
    expect(screen.queryByText('calendar.ics')).not.toBeInTheDocument();
    expect(screen.queryByTestId('files-list')).not.toBeInTheDocument();
  });
});