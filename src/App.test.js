import { render, screen, within, act, fireEvent } from '@testing-library/react';
import App from './App';

const ITEMS = [
  { id: 1, name: 'Aurora Lamp', category: 'Home', price: 39.99, rating: 4.4 },
  { id: 2, name: 'Trailblazer Backpack', category: 'Outdoors', price: 69.5, rating: 4.7 },
  { id: 3, name: 'Breeze Running Shoes', category: 'Sports', price: 89.0, rating: 4.2 },
  { id: 4, name: 'Nimbus Headphones', category: 'Electronics', price: 129.99, rating: 4.6 },
  { id: 5, name: 'Sierra Water Bottle', category: 'Outdoors', price: 19.99, rating: 4.1 },
  { id: 6, name: 'Echo Bluetooth Speaker', category: 'Electronics', price: 49.0, rating: 4.3 },
  { id: 7, name: 'Velvet Throw', category: 'Home', price: 24.5, rating: 4.0 },
  { id: 8, name: 'Summit Tent', category: 'Outdoors', price: 199.0, rating: 4.5 },
  { id: 9, name: 'Comet Keyboard', category: 'Electronics', price: 59.99, rating: 4.4 },
  { id: 10, name: 'Canyon Yoga Mat', category: 'Sports', price: 29.0, rating: 4.1 },
  { id: 11, name: 'Harbor Mug Set', category: 'Home', price: 18.0, rating: 3.9 },
  { id: 12, name: 'Photon Desk Lamp', category: 'Home', price: 34.0, rating: 4.2 },
  { id: 13, name: 'Pebble Earbuds', category: 'Electronics', price: 79.0, rating: 4.0 },
  { id: 14, name: 'Marathon Socks', category: 'Sports', price: 12.0, rating: 3.8 },
  { id: 15, name: 'Alpine Jacket', category: 'Outdoors', price: 149.0, rating: 4.6 }
];

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => ITEMS });
  window.localStorage.clear();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

async function waitForDataLoad() {
  // Initial artificial network delay in App (600ms)
  await act(async () => { jest.advanceTimersByTime(600); });
}

test('filters by search term (case-insensitive, partial match)', async () => {
  render(<App />);
  await waitForDataLoad();

  const search = screen.getByRole('searchbox', { name: /search by name/i });
  fireEvent.change(search, { target: { value: 'lamp' } });

  // Debounce delay 300ms
  await act(async () => { jest.advanceTimersByTime(300); });

  // Expect lamp items visible
  expect(screen.getByRole('heading', { name: /Aurora Lamp/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Photon Desk Lamp/i })).toBeInTheDocument();

  // And a non-matching item not present
  expect(screen.queryByRole('heading', { name: /Summit Tent/i })).toBeNull();
});

test('sorts by price descending (highest first)', async () => {
  render(<App />);
  await waitForDataLoad();

  const sortBy = screen.getByLabelText(/sort by field/i);
  fireEvent.change(sortBy, { target: { value: 'price' } });
  const sortDir = screen.getByLabelText(/sort direction/i);
  fireEvent.change(sortDir, { target: { value: 'desc' } });

  // First card should be the highest price item: Summit Tent ($199.00)
  const list = screen.getByRole('list');
  const firstCard = within(list).getAllByRole('listitem')[0];
  expect(within(firstCard).getByRole('heading', { name: /Summit Tent/i })).toBeInTheDocument();
});

test('favourite toggling persists across reload', async () => {
  const { unmount } = render(<App />);
  await waitForDataLoad();

  // Find Aurora Lamp card and toggle favourite
  const card = screen.getByRole('listitem', { name: /Aurora Lamp/i });
  const favBtn = within(card).getByRole('button');
  fireEvent.click(favBtn);
  expect(favBtn).toHaveAttribute('aria-pressed', 'true');

  // Re-render App (simulate page reload)
  unmount();
  render(<App />);
  await waitForDataLoad();

  const card2 = screen.getByRole('listitem', { name: /Aurora Lamp/i });
  const favBtn2 = within(card2).getByRole('button');
  expect(favBtn2).toHaveAttribute('aria-pressed', 'true');
});
