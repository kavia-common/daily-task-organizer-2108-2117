import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app title', () => {
  render(<App />);
  const title = screen.getByText(/daily task organizer/i);
  expect(title).toBeInTheDocument();
});

test('renders input to add a new task', () => {
  render(<App />);
  const input = screen.getByPlaceholderText(/add a new task/i);
  expect(input).toBeInTheDocument();
});
