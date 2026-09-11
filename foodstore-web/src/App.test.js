import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./api/category', () => ({ get: () => Promise.resolve({ data: { data: [] } }) }));
jest.mock('./api/tag', () => ({ getTags: () => Promise.resolve({ data: [] }) }));
jest.mock('./api/products', () => ({ getProducts: () => Promise.resolve({ data: { data: [], count: 0 } }) }));

test('renders the storefront and loads the catalog on the home route', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Enaknya sampai/ })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Cari menu' })).toBeInTheDocument();
    expect(await screen.findByText('Menu yang kamu cari belum ketemu')).toBeInTheDocument();
});
