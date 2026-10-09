import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, splitAmount, parseAmount, settle, validateData, summaryText, validDate } from '../docs/logic.js';

function fixture() {
  const members = ['An', 'Bình', 'Cường', 'Dũng'].map((name, i) => ({ id: 'm' + i, name }));
  const ids = members.map(m => m.id);
  const expense = (id, amount, payerId, participantIds = ids) => ({ id, title: id, amount, payerId, participantIds, date: '2026-10-09', category: 'food', note: '' });
  return { version: 1, trips: [{ id: 'trip1', name: 'Đi Đà Lạt', date: '2026-10-09', theme: 'mountain', archived: false, demo: false, members, expenses: [expense('hotel', 2000000, 'm0'), expense('dinner', 1200000, 'm1'), expense('taxi', 300000, 'm2', ids.slice(0, 3))] }] };
}
function assertSettled(rows, transfers) {
  const balances = new Map(rows.map(r => [r.id, r.balance]));
  for (const t of transfers) {
    assert.ok(Number.isSafeInteger(t.amount) && t.amount > 0);
    assert.notEqual(t.from, t.to);
    balances.set(t.from, balances.get(t.from) + t.amount);
    balances.set(t.to, balances.get(t.to) - t.amount);
  }
  for (const balance of balances.values()) assert.ok(balance === 0);
}
// Independent exhaustive oracle, only used on small generated inputs.
function minimumTransfers(values) {
  const balances = values.filter(Boolean);
  function search(start) {
    while (start < balances.length && balances[start] === 0) start++;
    if (start === balances.length) return 0;
    let best = Infinity;
    for (let i = start + 1; i < balances.length; i++) {
      if (balances[start] * balances[i] >= 0) continue;
      balances[i] += balances[start];
      best = Math.min(best, 1 + search(start + 1));
      balances[i] -= balances[start];
    }
    return best;
  }
  return search(0);
}
test('user example has exact balances and three minimal transfers', () => {
  const result = calculate(fixture().trips[0]);
  assert.equal(result.total, 3500000);
  assert.deepEqual(result.rows.map(r => [r.paid, r.share, r.balance]), [[2000000, 900000, 1100000], [1200000, 900000, 300000], [300000, 900000, -600000], [0, 800000, -800000]]);
  assert.equal(result.transfers.length, 3);
  assert.equal(result.optimal, true);
  assertSettled(result.rows, result.transfers);
});
test('indivisible amounts preserve every đồng with deterministic remainder allocation', () => {
  assert.deepEqual(splitAmount(100, ['a', 'b', 'c']), [{ id: 'a', amount: 34 }, { id: 'b', amount: 33 }, { id: 'c', amount: 33 }]);
  assert.deepEqual(splitAmount(1, ['a', 'b', 'c']).map(x => x.amount), [1, 0, 0]);
  assert.throws(() => splitAmount(100, []));
  assert.throws(() => splitAmount(100, ['a', 'a']));
});
test('payer may be outside the participant list', () => {
  const t = fixture().trips[0];
  t.expenses = [{ ...t.expenses[0], amount: 101, participantIds: ['m1', 'm2'] }];
  const result = calculate(t);
  assert.deepEqual(result.rows.map(r => r.balance), [101, -51, -50, 0]);
  assertSettled(result.rows, result.transfers);
});
test('renaming never changes balances; edited and deleted expenses recalculate', () => {
  const t = fixture().trips[0];
  const before = calculate(t).rows.map(r => r.balance);
  t.members[0].name = 'Zed';
  assert.deepEqual(calculate(t).rows.map(r => r.balance), before);
  t.expenses[0].amount = 4000000;
  assert.equal(calculate(t).total, 5500000);
  t.expenses = [];
  assert.equal(calculate(t).total, 0);
  assert.equal(calculate(t).transfers.length, 0);
});
test('parses Vietnamese grouping but rejects decimals, exponent notation and unsafe amounts', () => {
  for (const [value, expected] of [['150000', 150000], ['150.000', 150000], ['1.000.000.000.000', 1000000000000]]) assert.equal(parseAmount(value), expected);
  for (const value of ['', '0', '-1', '1e6', '1,500', '2.50', '12.34.567', 'NaN', 'Infinity', '1000000000001', '1 000']) assert.throws(() => parseAmount(value));
});
test('exact settlement improves on largest-first greedy counterexample', () => {
  const rows = [-8, -7, -5, 12, 8].map((balance, i) => ({ id: String(i), balance }));
  const result = settle(rows);
  assert.equal(result.transfers.length, 3);
  assertSettled(rows, result.transfers);
});
test('minimum count agrees with independent oracle on 150 deterministic cases', () => {
  let seed = 18273;
  const rand = () => ((seed = (1664525 * seed + 1013904223) >>> 0) % 15) - 7;
  for (let example = 0; example < 150; example++) {
    const values = Array.from({ length: 2 + example % 6 }, rand);
    values.push(-values.reduce((sum, value) => sum + value, 0));
    const rows = values.map((balance, i) => ({ id: String(i), balance }));
    const result = settle(rows);
    assert.equal(result.transfers.length, minimumTransfers(values));
    assertSettled(rows, result.transfers);
  }
});
test('16 active balances use exact optimization and larger groups use safe fallback', () => {
  const exactRows = Array.from({ length: 16 }, (_, i) => ({ id: String(i), balance: i % 2 ? -100 : 100 }));
  assert.equal(settle(exactRows).optimal, true);
  assert.equal(settle(exactRows).transfers.length, 8);
  const rows = Array.from({ length: 20 }, (_, i) => ({ id: String(i), balance: i % 2 ? -100 : 100 }));
  const result = settle(rows);
  assert.equal(result.optimal, false);
  assertSettled(rows, result.transfers);
  assert.throws(() => settle([{ id: 'a', balance: 1 }]));
});
test('backup validates references, duplicates, dates, amounts and known categories', () => {
  assert.doesNotThrow(() => validateData(fixture()));
  const mutations = [
    d => d.version = 2,
    d => d.trips[0].members[1].id = 'm0',
    d => d.trips[0].members[1].name = 'AN',
    d => d.trips[0].expenses[0].payerId = 'missing',
    d => d.trips[0].expenses[0].participantIds = [],
    d => d.trips[0].expenses[0].participantIds = ['m0', 'm0'],
    d => d.trips[0].expenses[0].amount = 3.5,
    d => d.trips[0].expenses[0].category = '__proto__',
    d => d.trips[0].theme = 'constructor',
    d => d.trips[0].expenses[1].id = 'hotel',
    d => d.trips[0].date = '2026-02-30',
    d => d.trips[0].members[0].id = '<script>',
  ];
  for (const mutate of mutations) { const d = fixture(); mutate(d); assert.throws(() => validateData(d)); }
  assert.equal(validDate('2024-02-29'), true);
  assert.equal(validDate('2026-02-29'), false);
});
test('summary includes expense participation, each balance and exact settlement', () => {
  const text = summaryText(fixture().trips[0]);
  assert.ok(text.includes('3.500.000đ'));
  assert.ok(text.includes('An, Bình, Cường'));
  assert.ok(text.includes('nhận lại 1.100.000đ'));
  assert.ok(text.includes('trả thêm 600.000đ'));
  assert.ok(text.includes('Ít giao dịch nhất'));
});
