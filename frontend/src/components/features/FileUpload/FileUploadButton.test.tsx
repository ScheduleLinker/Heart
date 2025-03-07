// FileUploadButton.test.tsx
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import FileUploadButton from "./FileUploadButton";
import { describe, expect, test, vi } from "vitest";

// Mock the fetch API using vitest's vi.fn()
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: "File uploaded successfully!" }),
  })
) as unknown as typeof fetch;

describe("FileUploadButton", () => {
  test("alerts user on successful file upload", async () => {
    render(<FileUploadButton />);
    
    // Query the file input by its test id
    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
    
    // Create a dummy .ics file
    const file = new File(["BEGIN:VCALENDAR\nEND:VCALENDAR"], "test.ics", {
      type: "text/calendar",
    });

    // Simulate file selection
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for fetch to be called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  test("alerts user when non-.ics file is selected", () => {
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<FileUploadButton />);

    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;

    // Create a dummy non-.ics file
    const file = new File(["Some content"], "test.txt", {
      type: "text/plain",
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(alertMock).toHaveBeenCalledWith("Please select a valid .ics file.");
    alertMock.mockRestore();
  });
});
