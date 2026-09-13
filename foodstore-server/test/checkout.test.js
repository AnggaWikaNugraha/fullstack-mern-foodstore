const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function controller(file, dependencies) {
    const module = { exports: {} };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
        module, exports: module.exports,
        require: (name) => dependencies[name] || {},
        console,
    }, { filename: file });
    return module.exports;
}

const policy = { policyFor: () => ({ can: () => true }) };

test('address pagination is scoped to the requesting user and includes count', async () => {
    const queries = [];
    const addresses = [{ _id: 'address-1', user: 'user-1', nama: 'Rumah' }];
    const model = { find(query) {
        queries.push(JSON.parse(JSON.stringify(query)));
        return { countDocuments: async () => 5, limit: () => ({ skip: () => ({ sort: async () => addresses }) }) };
    } };
    const api = controller('app/delivery-address/controller.js', { './model': model, '../policy': policy });
    let result;
    await api.index({ user: { _id: 'user-1' }, query: { limit: 4, skip: 0 } }, { json: (data) => { result = data; } }, (error) => { throw error; });
    assert.deepEqual(queries, [{ user: 'user-1' }, { user: 'user-1' }]);
    assert.equal(result.count, 5);
    assert.deepEqual(result.data, addresses);
});

test('address lookup also enforces the requesting user', async () => {
    const queries = [];
    const model = { find(query) {
        queries.push(JSON.parse(JSON.stringify(query)));
        return { countDocuments: async () => 0, limit: () => ({ skip: () => ({ sort: async () => [] }) }) };
    } };
    const api = controller('app/delivery-address/controller.js', { './model': model, '../policy': policy });
    let result;
    await api.index({ user: { _id: 'user-1' }, query: { id: 'someone-elses-address' } }, { json: (data) => { result = data; } }, (error) => { throw error; });
    assert.deepEqual(queries, [{ user: 'user-1', _id: 'someone-elses-address' }, { user: 'user-1', _id: 'someone-elses-address' }]);
    assert.equal(result.count, 0);
    assert.equal(result.data.length, 0);
});

for (const [label, items] of [
    ['empty selection', []],
    ['insufficient stock', [{ qty: 3, product: { stock: 2 } }]],
    ['deleted product', [{ qty: 1, product: null }]],
]) {
    test(`order creation rejects ${label} before creating records`, async () => {
        let constructed = false;
        const api = controller('app/order/controller.js', {
            '../policy': policy,
            './model': function Order() { constructed = true; },
            '../cart-item/model': { find: () => ({ populate: async () => items }) },
        });
        let result;
        await api.store({ user: { _id: 'user-1' }, body: { delivery_address: 'address-1', delivery_fee: 10000 } }, { json: (data) => { result = data; } }, (error) => { throw error; });
        assert.equal(result.error, 1);
        assert.equal(constructed, false);
    });
}

test('order creation rejects an address that does not belong to the user', async () => {
    let query;
    const api = controller('app/order/controller.js', {
        '../policy': policy,
        '../cart-item/model': { find: () => ({ populate: async () => [{ qty: 1, product: { stock: 2 } }] }) },
        '../delivery-address/model': { findOne: async (value) => { query = JSON.parse(JSON.stringify(value)); return null; } },
    });
    let result;
    await api.store({ user: { _id: 'user-1' }, body: { delivery_address: 'address-2', delivery_fee: 10000 } }, { json: (data) => { result = data; } }, (error) => { throw error; });
    assert.deepEqual(query, { _id: 'address-2', user: 'user-1' });
    assert.equal(result.error, 1);
    assert.match(result.message, /Alamat pengiriman tidak ditemukan/);
});
