/**
 * A simple fileupload button test
 * 
 * @test
 * tests if button rendered correctly
 * tests if button transitions from (upload) to (processing)
 * test if file uploaded is an .ics file
 * test if the incorrect file type is rejected.
 */


import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileUploadButton from './FileUploadButton'; // Adjust path if needed
import { describe, it, expect, vi } from 'vitest';

describe('FileUploadButton Component', () => {
  it('renders correctly with initial state', () => {
    render(<FileUploadButton />);

    // Check if the label (acting as button) is present
    expect(screen.getByText('UPLOAD')).toBeInTheDocument();
  });

  it('shows "PROCESSING..." when a valid file is uploaded and reverts after processing', async () => {
    render(<FileUploadButton />);

    const fileInput = screen.getByLabelText(/upload/i);
    const file = new File(["BEGIN:VCALENDAR"], "event.ics", { type: "text/calendar" });

    // Simulate file selection
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Expect text to change to "PROCESSING..."
    expect(screen.getByText('PROCESSING...')).toBeInTheDocument();

    // Wait for the process to finish (simulate API call delay)
    await waitFor(() => expect(screen.getByText('UPLOAD')).toBeInTheDocument(), { timeout: 1200 });
  });

  it('rejects invalid file types', () => {
    render(<FileUploadButton />);
    
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {}); // Mock alert

    const fileInput = screen.getByLabelText(/upload/i);
    const invalidFile = new File(["data"], "image.png", { type: "image/png" });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    // Ensure alert was called
    expect(alertMock).toHaveBeenCalledWith('Please select an .ics file.');
    
    alertMock.mockRestore(); // Cleanup mock
  });
});
