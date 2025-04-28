import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Workspace from './Workspace';
describe('Workspace', () => {
  // Setup and teardown for localStorage mock
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      clear: () => {
        store = {};
      },
      removeItem: (key: string) => {
        delete store[key];
      }
    };
  })();

  // Replace the global localStorage with our mock before each test
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { 
      value: localStorageMock,
      writable: true 
    });
  });

  // Clear mock localStorage after each test
  afterEach(() => {
    localStorageMock.clear();
    vi.resetAllMocks();
  });

  it('displays no data message when localStorage is empty', () => {
    // Ensure localStorage is empty
    localStorage.removeItem('parsed-ics');
    
    // Render the component
    render(<Workspace />);
    
    // Check if the no data message is displayed
    expect(screen.getByText('No data uploaded yet')).toBeInTheDocument();
    
    // Verify that the development message is not shown
    expect(screen.queryByText(/bubbles will get built/i)).not.toBeInTheDocument();
  });

  it('displays development message when data is present in localStorage', () => {
    // Set mock data in localStorage
    localStorage.setItem('parsed-ics', JSON.stringify({ someData: 'test data' }));
    
    // Render the component
    render(<Workspace />);
    
    // Check if the development message is displayed
    expect(screen.getByText(/bubbles will get built/i)).toBeInTheDocument();
    
    // Verify that the no data message is not shown
    expect(screen.queryByText('No data uploaded yet')).not.toBeInTheDocument();
  });

  it('has the correct structure with padding for floating bar', () => {
    // Render the component
    const { container } = render(<Workspace />);
    
    // Check if the main container has the expected classes
    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass('relative');
    expect(mainContainer).toHaveClass('min-h-screen');
    expect(mainContainer).toHaveClass('pb-32'); // Check for padding at bottom for floating bar
    
    // Check if the content container has padding
    const contentContainer = container.querySelector('div > div > div');
    expect(contentContainer).toHaveClass('p-4');
  });

  it('renders correctly with JSON data in localStorage', () => {
    // Set complex JSON data in localStorage
    const complexData = {
      events: [
        { id: 1, title: 'Meeting', date: '2023-01-01' },
        { id: 2, title: 'Conference', date: '2023-01-15' }
      ],
      settings: {
        theme: 'dark',
        notifications: true
      }
    };
    
    localStorage.setItem('parsed-ics', JSON.stringify(complexData));
    
    // Render the component
    render(<Workspace />);
    
    // Check if the development message is displayed
    expect(screen.getByText(/bubbles will get built/i)).toBeInTheDocument();
  });

  it('renders correctly with non-JSON string data in localStorage', () => {
    // Set non-JSON string in localStorage
    localStorage.setItem('parsed-ics', 'Simple string value');
    
    // Render the component
    render(<Workspace />);
    
    // Even with invalid JSON, if the localStorage item exists,
    // it should display the development message
    expect(screen.getByText(/bubbles will get built/i)).toBeInTheDocument();
  });
});