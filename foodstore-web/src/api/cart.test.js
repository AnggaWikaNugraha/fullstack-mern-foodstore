import axios from 'axios';
import store from '../app/store';
import { getCart, cartState } from './cart';
import { setItems } from '../features/Cart/actions';

jest.mock('axios');
jest.mock('../app/store', () => ({ getState: jest.fn(), dispatch: jest.fn() }));
beforeEach(() => {
    jest.clearAllMocks();
    cartState.skipNextSave = false;
    store.getState.mockReturnValue({ auth: { token: 'test-token' } });
});

test('concurrent cart loads share a request and do not trigger a save', async () => {
    const items = [{ _id: 'burger', qty: 1, checked: true }];
    axios.get.mockResolvedValue({ data: items });
    expect(await Promise.all([getCart(), getCart()])).toEqual([true, true]);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toHaveBeenCalledWith(setItems(items));
    expect(cartState.skipNextSave).toBe(true);
});

test.each(['network', 'API'])('%s failure returns a retryable failure without clearing cart', async (kind) => {
    if (kind === 'network') axios.get.mockRejectedValue(new Error('Offline'));
    else axios.get.mockResolvedValue({ data: { error: 1 } });
    expect(await getCart()).toBe(false);
    expect(store.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ items: expect.anything() }));
    axios.get.mockResolvedValue({ data: [] });
    expect(await getCart()).toBe(true);
});

test('a response from an old session cannot replace the current cart', async () => {
    let resolve;
    axios.get.mockReturnValue(new Promise((done) => { resolve = done; }));
    const request = getCart();
    store.getState.mockReturnValue({ auth: { token: 'another-token' } });
    resolve({ data: [{ _id: 'old-user-item' }] });
    expect(await request).toBe(false);
    expect(store.dispatch).not.toHaveBeenCalled();
});
