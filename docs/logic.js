export const MAX_AMOUNT = 1_000_000_000_000;
export const CATEGORIES = {
  food: { label: 'Ăn uống', icon: 'food', color: 'orange' },
  stay: { label: 'Lưu trú', icon: 'bed', color: 'purple' },
  transport: { label: 'Di chuyển', icon: 'car', color: 'blue' },
  fun: { label: 'Vui chơi', icon: 'sparkles', color: 'pink' },
  other: { label: 'Khác', icon: 'receipt', color: 'green' },
};
export const THEMES = { mountain: 'Núi & rừng', beach: 'Biển xanh', city: 'Phố xá', food: 'Ăn cùng nhau' };
export const money = value => new Intl.NumberFormat('vi-VN').format(value) + 'đ';
export const uid = () => crypto.randomUUID();
export function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function validDate(date) {
  return typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date;
}
export function parseAmount(raw) {
  const text = String(raw).trim();
  // Accept plain đồng or Vietnamese thousands grouping, never decimals or exponents.
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)$/.test(text)) throw new Error('Nhập số tiền nguyên đồng, ví dụ 150000 hoặc 150.000.');
  const amount = Number(text.replaceAll('.', ''));
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > MAX_AMOUNT) throw new Error('Số tiền phải từ 1đ đến 1.000.000.000.000đ.');
  return amount;
}
export function splitAmount(amount, participantIds) {
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > MAX_AMOUNT || !participantIds.length || new Set(participantIds).size !== participantIds.length) throw new Error('Khoản chia không hợp lệ.');
  const base = Math.floor(amount / participantIds.length);
  const remainder = amount % participantIds.length;
  // The saved participant order is stable: renaming members cannot change a split.
  return participantIds.map((id, i) => ({ id, amount: base + (i < remainder ? 1 : 0) }));
}
export function calculate(trip) {
  const rows = trip.members.map(m => ({ ...m, paid: 0, share: 0, balance: 0 }));
  const byId = new Map(rows.map(m => [m.id, m]));
  let total = 0;
  for (const expense of trip.expenses) {
    if (!byId.has(expense.payerId)) throw new Error('Người trả tiền không tồn tại.');
    total += expense.amount;
    if (!Number.isSafeInteger(total)) throw new Error('Tổng tiền vượt giới hạn tính toán.');
    byId.get(expense.payerId).paid += expense.amount;
    for (const part of splitAmount(expense.amount, expense.participantIds)) {
      if (!byId.has(part.id)) throw new Error('Thành viên khoản chi không tồn tại.');
      byId.get(part.id).share += part.amount;
    }
  }
  for (const row of rows) row.balance = row.paid - row.share;
  return { total, rows, ...settle(rows) };
}
function greedy(rows) {
  const debtors = rows.filter(r => r.balance < 0).map(r => ({ id: r.id, value: -r.balance }));
  const creditors = rows.filter(r => r.balance > 0).map(r => ({ id: r.id, value: r.balance }));
  const result = [];
  while (debtors.length && creditors.length) {
    debtors.sort((a, b) => b.value - a.value || a.id.localeCompare(b.id));
    creditors.sort((a, b) => b.value - a.value || a.id.localeCompare(b.id));
    const amount = Math.min(debtors[0].value, creditors[0].value);
    result.push({ from: debtors[0].id, to: creditors[0].id, amount });
    debtors[0].value -= amount;
    creditors[0].value -= amount;
    if (!debtors[0].value) debtors.shift();
    if (!creditors[0].value) creditors.shift();
  }
  return result;
}
export function settle(rows) {
  const active = rows.filter(r => r.balance !== 0);
  if (rows.some(r => !Number.isSafeInteger(r.balance)) || rows.reduce((s, r) => s + r.balance, 0) !== 0) throw new Error('Số dư không cân bằng.');
  if (active.length > 16) return { transfers: greedy(active), optimal: false };
  if (!active.length) return { transfers: [], optimal: true };
  // Maximize disjoint zero-sum groups in O(n * 2^n). A group of k people
  // requires k-1 transfers, so maximizing groups minimizes transfer count.
  const size = 1 << active.length;
  const sums = new Float64Array(size);
  const groups = new Int8Array(size);
  const parent = new Int8Array(size);
  for (let mask = 1; mask < size; mask++) {
    const low = mask & -mask;
    sums[mask] = sums[mask ^ low] + active[31 - Math.clz32(low)].balance;
    let best = -1;
    for (let bits = mask; bits; bits &= bits - 1) {
      const bit = bits & -bits;
      const score = groups[mask ^ bit];
      if (score > best) { best = score; parent[mask] = 31 - Math.clz32(bit); }
    }
    groups[mask] = best + (sums[mask] === 0 ? 1 : 0);
  }
  let mask = size - 1;
  const partitions = [];
  let group = [];
  while (mask) {
    const i = parent[mask];
    group.push(active[i]);
    mask ^= 1 << i;
    if (sums[mask] === 0) { partitions.push(group); group = []; }
  }
  return { transfers: partitions.flatMap(greedy), optimal: true };
}
export function summaryText(trip) {
  const { total, rows, transfers, optimal } = calculate(trip);
  const name = id => trip.members.find(m => m.id === id)?.name || '?';
  return [
    `📊 TỔNG KẾT CHI TIÊU — ${trip.name}${trip.demo ? ' (DỮ LIỆU MẪU)' : ''}`,
    `Tổng cộng: ${money(total)} · ${trip.members.length} thành viên`, '',
    '📝 LỊCH SỬ CHI TIÊU',
    ...trip.expenses.map((e, i) => `${i + 1}. ${e.title}: ${money(e.amount)}\n   ${name(e.payerId)} trả · ${e.participantIds.length === trip.members.length ? 'Cả nhóm' : e.participantIds.map(name).join(', ')} · ${e.date.split('-').reverse().join('/')}`),
    ...(trip.expenses.length ? [] : ['Chưa có khoản chi.']), '',
    '👥 CHI TIẾT TỪNG NGƯỜI',
    ...rows.map(r => `• ${r.name}: đã trả ${money(r.paid)} · phần chịu ${money(r.share)} · ${r.balance > 0 ? 'nhận lại' : r.balance < 0 ? 'trả thêm' : 'cân bằng'}${r.balance ? ' ' + money(Math.abs(r.balance)) : ''}`), '',
    `⚖️ ${optimal ? 'KẾT QUẢ CHUYỂN TIỀN (Ít giao dịch nhất)' : 'GỢI Ý CHUYỂN TIỀN'}`,
    ...transfers.map(t => `• ${name(t.from)} ➡️ ${name(t.to)}: ${money(t.amount)}`),
    ...(transfers.length ? [] : ['Không cần chuyển tiền.']), '',
    ...(trip.expenses.some(e => e.amount % e.participantIds.length) ? ['Tiền dư được chia thêm 1đ cho những người đầu trong danh sách tham gia đã lưu.', ''] : []),
    'Mọi người kiểm tra lại giúp mình nhé!'
  ].join('\n');
}
const textOk = (x, max = 80) => typeof x === 'string' && x.trim().length > 0 && x.length <= max;
const idOk = x => typeof x === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(x);
export function validateData(data) {
  const fail = () => { throw new Error('Tệp dữ liệu không hợp lệ hoặc không tương thích với SplitBuddy.'); };
  if (!data || data.version !== 1 || !Array.isArray(data.trips) || data.trips.length > 200) fail();
  const tripIds = new Set();
  for (const t of data.trips) {
    if (!t || !idOk(t.id) || tripIds.has(t.id) || !textOk(t.name) || !Object.hasOwn(THEMES, t.theme) || !validDate(t.date) || typeof t.archived !== 'boolean' || typeof t.demo !== 'boolean' || !Array.isArray(t.members) || t.members.length > 100 || !Array.isArray(t.expenses) || t.expenses.length > 5000) fail();
    tripIds.add(t.id);
    const members = new Set();
    const names = new Set();
    for (const m of t.members) {
      if (!m || !idOk(m.id) || members.has(m.id) || !textOk(m.name, 40) || names.has(m.name.trim().toLocaleLowerCase('vi'))) fail();
      members.add(m.id); names.add(m.name.trim().toLocaleLowerCase('vi'));
    }
    const expenseIds = new Set();
    for (const e of t.expenses) {
      if (!e || !idOk(e.id) || expenseIds.has(e.id) || !textOk(e.title) || !Number.isSafeInteger(e.amount) || e.amount <= 0 || e.amount > MAX_AMOUNT || !Object.hasOwn(CATEGORIES, e.category) || !validDate(e.date) || !members.has(e.payerId) || !Array.isArray(e.participantIds) || !e.participantIds.length || new Set(e.participantIds).size !== e.participantIds.length || e.participantIds.some(id => !members.has(id)) || typeof e.note !== 'string' || e.note.length > 500) fail();
      expenseIds.add(e.id);
    }
    calculate(t);
  }
  return data;
}
export function demoTrip() {
  const members = ['An', 'Bình', 'Cường', 'Dũng'].map(name => ({ id: uid(), name }));
  const ids = members.map(m => m.id);
  const date = localDate();
  return { id: uid(), name: 'Đà Lạt cùng hội bạn', date, theme: 'mountain', archived: false, demo: true, members,
    expenses: [
      { id: uid(), title: 'Homestay giữa rừng thông', amount: 2000000, payerId: ids[0], participantIds: [...ids], category: 'stay', date, note: '' },
      { id: uid(), title: 'Bữa tối lẩu bò', amount: 1200000, payerId: ids[1], participantIds: [...ids], category: 'food', date, note: '' },
      { id: uid(), title: 'Taxi về homestay', amount: 300000, payerId: ids[2], participantIds: ids.slice(0, 3), category: 'transport', date, note: 'Dũng không đi chuyến này.' },
    ] };
}
