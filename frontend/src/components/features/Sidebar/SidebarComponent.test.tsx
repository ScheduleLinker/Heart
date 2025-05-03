/// <reference types="vitest" />
import React from "react";
import {
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
  vi,
} from "vitest";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import SidebarComponent from "./SidebarComponent";

const originalLocation = window.location;

beforeAll(() => {
  // allow spying on reload()
  delete (window as any).location;
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { ...originalLocation, reload: vi.fn() },
  });
});

afterAll(() => {
  // restore original location
  delete (window as any).location;
  Object.defineProperty(window, "location", {
    configurable: true,
    value: originalLocation,
  });
});

describe("SidebarComponent (Vitest)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders the three toolbar items", () => {
    render(<SidebarComponent onCreateNode={vi.fn()} />);
    expect(screen.getByText("Upload")).toBeTruthy();
    expect(screen.getByText("Create Bubble")).toBeTruthy();
    expect(screen.getByText("Settings")).toBeTruthy();
  });

  it("opens the Create Bubble dialog and calls onCreateNode", async () => {
    const onCreateNode = vi.fn();
    render(<SidebarComponent onCreateNode={onCreateNode} />);

    fireEvent.click(screen.getByText("Create Bubble"));
    expect(screen.getByText("Create a Bubble!")).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText("Node label"), {
      target: { value: "My Node" },
    });
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "root" },
    });

    fireEvent.click(screen.getByText("Create"));
    await waitFor(() =>
      expect(onCreateNode).toHaveBeenCalledWith("My Node", "root")
    );
  });

  it("alerts when a non-ICS file is selected", () => {
    render(<SidebarComponent onCreateNode={vi.fn()} />);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const fileInput = document.querySelector('input[type="file"]')!;

    const txtFile = new File(["hello"], "hello.txt", { type: "text/plain" });
    fireEvent.change(fileInput, { target: { files: [txtFile] } });

    expect(alertSpy).toHaveBeenCalledWith(
      "Please select an .ics file only."
    );
  });

  it("uploads an .ics file, merges into localStorage, and reloads", async () => {
    // 1) stub fetch
    const fakeCalendar = { data: { events: [{ summary: "Event1" }] } };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(fakeCalendar),
      })
    );

    // 2) render & click Upload
    render(<SidebarComponent onCreateNode={vi.fn()} />);
    fireEvent.click(screen.getByText("Upload"));

    // 3) simulate file selection
    const fileInput = document.querySelector('input[type="file"]')!;
    const icsFile = new File(
      ["BEGIN:VCALENDAR\nEND:VCALENDAR"],
      "test.ics",
      { type: "text/calendar" }
    );
    fireEvent.change(fileInput, { target: { files: [icsFile] } });

    // 4) wait for fetch to be called
    await waitFor(() => expect(fetch).toHaveBeenCalled());

    // 5) localStorage should now hold an array with our fakeCalendar
    const stored = JSON.parse(localStorage.getItem("parsed-ics")!);
    expect(Array.isArray(stored)).toBe(true);
    expect(stored[0]).toEqual(fakeCalendar);

    // 6) window.location.reload was called
    expect(window.location.reload).toHaveBeenCalled();
  });

  it("clicking Upload triggers the hidden file picker", () => {
    render(<SidebarComponent onCreateNode={vi.fn()} />);
    const fileInput = document.querySelector('input[type="file"]')!;
    const clickSpy = vi.spyOn(fileInput, "click").mockImplementation(() => {});

    fireEvent.click(screen.getByText("Upload"));
    expect(clickSpy).toHaveBeenCalled();
  });
});
