import { CATEGORIES, THEMES, money, uid, localDate, parseAmount, splitAmount, calculate, summaryText, validateData, demoTrip } from './logic.js';

const app = document.querySelector('#app');
const modal = document.querySelector('#modal');
const STORAGE_KEY = 'splitbuddy:v1:' + new URL('./', location.href).pathname;
const paths = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H4m6-6-6 6 6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  bag: '<rect x="4" y="7" width="16" height="14" rx="3"/><path d="M8 7V5a4 4 0 0 1 8 0v2M4 12h16M9 12v3h6v-3"/>',
  users: '<path d="M15 21v-3a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v3m18 0v-3a4 4 0 0 0-3-4M15 3a4 4 0 0 1 0 8"/><circle cx="9" cy="7" r="4"/>',
  wallet: '<path d="M19 8V5a2 2 0 0 0-2-2L5 6a3 3 0 0 0-2 3v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4M5 8h14a2 2 0 0 1 2 2v5h-6V9"/><path d="M17 12h.01"/>',
  receipt: '<path d="M5 3v18l3-2 4 2 4-2 3 2V3l-3 2-4-2-4 2ZM9 9h6M9 13h6"/>',
  archive: '<rect x="3" y="3" width="18" height="5" rx="1"/><path d="M5 8v13h14V8M10 12h4"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 11 3 3 5-5"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 1 1 5.2 2c-1.3.7-2.3 1-2.3 3m0 3h.01"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
  mountain: '<path d="m2 20 8-16 7 16H2Zm12-7 3-6 5 13h-5M7 10l3 2 3-2"/>',
  beach: '<path d="M3 15h18M3 19c3-3 6 3 9 0s6 3 9 0M3 23c3-3 6 3 9 0s6 3 9 0M12 3v2M5 6l2 2M19 6l-2 2"/><path d="M7 15a5 5 0 0 1 10 0"/>',
  city: '<path d="M3 21V9h8v12M11 21V3h9v18M6 13h2m-2 4h2m6-10h3m-3 4h3m-3 4h3M1 21h22"/>',
  food: '<path d="M4 3v6a3 3 0 0 0 6 0V3M7 3v18M17 13h4V3c-6 3-5 10-4 10Zm0 0v8"/>',
  bed: '<path d="M3 20V5m0 10h18v5M3 10h5a3 3 0 0 1 3 3v2m0-6h6a4 4 0 0 1 4 4v2M3 18h18"/>',
  car: '<path d="m5 10 2-6h10l2 6M3 10h18v9H3ZM5 19v2m14-2v2M6 14h2m8 0h2"/>',
  sparkles: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4m-2-2h4"/>',
  leaf: '<path d="M20 3C5 2 2 8 5 15c6 6 15 0 15-12ZM4 21l9-12"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  share: '<path d="M12 16V3m-4 4 4-4 4 4M7 10H4v11h16V10h-3"/>',
  edit: '<path d="m15 5 4 4M4 20l5-1L21 7a2.8 2.8 0 0 0-4-4L5 15Z"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',
  swap: '<path d="M3 7h17m-5-5 5 5-5 5M21 17H4m5-5-5 5 5 5"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 5h4m-2 14h.01"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.receipt}</svg>`;
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const dateText = s => new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(s + 'T12:00:00'));
const initials = name => name.trim().split(/\s+/).slice(-2).map(s => s[0]).join('').toUpperCase();
const avatar = (m, index = 0) => `<span class="avatar c${index % 5}" title="${esc(m.name)}">${esc(initials(m.name))}</span>`;
const avatars = members => `<div class="avatars">${members.slice(0, 4).map(avatar).join('')}${members.length > 4 ? `<span class="avatar">+${members.length - 4}</span>` : ''}</div>`;
const button = (action, label, ico, style = 'btn-secondary', extra = '') => `<button class="btn ${style}" data-action="${action}" ${extra}>${ico ? icon(ico) : ''}${label}</button>`;
const iconButton = (action, label, ico, extra = '') => `<button class="icon-btn" data-action="${action}" aria-label="${esc(label)}" title="${esc(label)}" ${extra}>${icon(ico)}</button>`;
const brand = () => `<button class="brand" data-action="home" aria-label="SplitBuddy by Bo — Trang chủ"><img src="./assets/icon.svg" alt=""><span class="brand-wordmark"><span class="brand-name">SplitBuddy</span><span class="brand-signature">by Bo</span></span></button>`;
let data, savedRaw = null, storageIssue = '', corruptRaw = null;
let filter = 'active', search = '', toastTimer, modalOpener;
try {
  savedRaw = localStorage.getItem(STORAGE_KEY);
  if (savedRaw) data = validateData(JSON.parse(savedRaw));
  else {
    data = { version: 1, trips: [demoTrip()] };
    const initialRaw = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, initialRaw);
    savedRaw = initialRaw;
  }
} catch (error) {
  corruptRaw = savedRaw;
  data = { version: 1, trips: [] };
  storageIssue = savedRaw ? 'Không đọc được dữ liệu đã lưu. Hãy tải bản dữ liệu gốc trong Sao lưu để kiểm tra hoặc khôi phục từ một bản sao lưu.' : 'Trình duyệt chưa cho phép lưu dữ liệu. Hãy bật lưu trữ và tải lại trang trước khi nhập chi tiêu.';
}
function toast(message) {
  const el = document.querySelector('#toast');
  el.textContent = message; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}
function save(mutator, { recovery = false } = {}) {
  if (storageIssue && !recovery) throw new Error(storageIssue);
  const currentRaw = localStorage.getItem(STORAGE_KEY);
  if (!recovery && currentRaw !== savedRaw) throw new Error('Dữ liệu đã thay đổi ở tab khác. Đóng biểu mẫu rồi tải lại trang để tránh ghi đè.');
  const draft = structuredClone(data);
  mutator(draft);
  validateData(draft);
  const raw = JSON.stringify(draft);
  try { localStorage.setItem(STORAGE_KEY, raw); }
  catch { throw new Error('Không lưu được: bộ nhớ trình duyệt đầy hoặc bị chặn. Hãy xuất bản sao lưu và giải phóng dung lượng.'); }
  data = draft; savedRaw = raw; storageIssue = ''; corruptRaw = null;
}
function changeTrip(id, mutator) { save(d => { const t = d.trips.find(t => t.id === id); if (!t) throw new Error('Không tìm thấy chuyến đi.'); mutator(t); }); }
function route() {
  const parts = location.hash.slice(1).split('/');
  if (parts[0] === 'trip') {
    const trip = data.trips.find(t => t.id === parts[1]);
    if (trip) return { page: 'trip', trip, tab: ['expenses', 'members', 'summary'].includes(parts[2]) ? parts[2] : 'expenses' };
  }
  return { page: parts[0] === 'data' ? 'data' : parts[0] === 'archive' ? 'archive' : 'home' };
}
function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }
function footer() { return `<footer class="footer-note"><span>${icon('heart')} Chia tiền rõ ràng, giữ trọn cuộc vui.</span><span>SplitBuddy · Made for good company</span></footer>`; }
function navLink(action, label, ico, active, extra = '') { return `<button class="nav-link ${active ? 'active' : ''}" data-action="${action}">${icon(ico)}${label}${extra}</button>`; }
function render() {
  const r = route();
  const activeTrips = data.trips.filter(t => !t.archived);
  document.title = `${r.trip ? r.trip.name : r.page === 'data' ? 'Sao lưu dữ liệu' : 'Chuyến đi của bạn'} · SplitBuddy`;
  app.innerHTML = `<div class="shell">
    <aside class="sidebar"><div class="sidebar-brand">${brand()}</div>
      <nav aria-label="Điều hướng chính">
      ${navLink('home', 'Chuyến đi của tôi', 'bag', r.page === 'home' || r.page === 'trip', `<span class="nav-count">${activeTrips.length}</span>`)}
      ${navLink('archive', 'Đã lưu trữ', 'archive', r.page === 'archive')}
      ${navLink('data', 'Sao lưu dữ liệu', 'shield', r.page === 'data')}
      </nav><div class="sidebar-divider"></div><p class="sidebar-label">GẦN ĐÂY</p>
      ${activeTrips.slice(0, 4).map(t => `<button class="recent-link" data-action="open-trip" data-id="${t.id}"><span class="recent-dot"></span><span>${esc(t.name)}</span></button>`).join('') || '<p class="small muted" style="padding:0 14px">Hẹn một chuyến đi mới nhé.</p>'}
      <div class="sidebar-bottom"><div class="local-card"><div class="local-title">${icon('lock')} Chỉ trên thiết bị của bạn</div><p>Không tài khoản. Không máy chủ.<br>Những cuộc vui là của riêng bạn.</p></div><div class="version"><span>SplitBuddy v1.0</span><span>Made with care ♡</span></div></div>
    </aside><div class="workspace"><header class="topbar"><div class="mobile-brand">${brand()}</div><div class="breadcrumb">${icon('home')}<span>/</span><strong>${r.trip ? esc(r.trip.name) : r.page === 'data' ? 'Sao lưu dữ liệu' : r.page === 'archive' ? 'Đã lưu trữ' : 'Chuyến đi của tôi'}</strong></div><div class="top-actions"><span class="saved-indicator">${storageIssue ? 'Cần kiểm tra lưu trữ' : 'Lưu trên thiết bị'}</span>${iconButton('help', 'Hướng dẫn sử dụng', 'help')}</div></header>
    <main id="main" class="content" tabindex="-1">${storageIssue ? `<div role="alert" class="banner warn">${icon('shield')}<span>${esc(storageIssue)}</span></div>` : ''}${r.page === 'trip' ? tripPage(r) : r.page === 'data' ? dataPage() : homePage(r.page === 'archive')}${footer()}</main></div>
    <nav class="mobile-nav" aria-label="Điều hướng di động"><button data-action="home" class="${['home', 'trip'].includes(r.page) ? 'active' : ''}">${icon('bag')}Chuyến đi</button><button data-action="archive" class="${r.page === 'archive' ? 'active' : ''}">${icon('archive')}Lưu trữ</button><button data-action="new-trip" class="new-button" aria-label="Tạo chuyến đi mới">${icon('plus')}</button><button data-action="data" class="${r.page === 'data' ? 'active' : ''}">${icon('shield')}Sao lưu</button><button data-action="help">${icon('help')}Hướng dẫn</button></nav>
  </div>`;
}
function homePage(archived) {
  const trips = data.trips.filter(t => !t.archived);
  const real = trips.filter(t => !t.demo);
  const total = real.reduce((sum, t) => sum + BigInt(calculate(t).total), 0n);
  const count = real.reduce((sum, t) => sum + t.expenses.length, 0);
  return `<section class="page-heading"><div><h1>${archived ? 'Những cuộc vui đã qua' : 'Chuyến đi của bạn'}</h1><p>${archived ? 'Kỷ niệm giữ lại, chi tiêu vẫn rõ ràng.' : 'Cùng nhau đi, cùng nhau chia sẻ.'}</p></div>${button('new-trip', 'Tạo chuyến đi', 'plus', 'btn-primary')}</section>
  ${archived ? '' : `<section class="hero"><div class="hero-copy"><div class="eyebrow">${icon('leaf')} GOOD TIMES, FAIR SHARES</div><h2>Vui hết mình.<br><em>Chia tiền nhẹ tênh.</em></h2><p>Từ một bữa ăn đến những chuyến đi xa,<br>SplitBuddy lo phần chia, bạn lo phần vui.</p><button class="hero-link" data-action="help">Khám phá cách chia tiền ${icon('arrow')}</button></div><img class="hero-art" src="./assets/adventure.svg" alt="Minh họa hóa đơn đã chia đều giữa núi rừng xanh"></section>
    <section class="stats" aria-label="Thống kê các chuyến đi thật đang hoạt động"><div class="stat"><span class="stat-icon">${icon('bag')}</span><div><p class="stat-label">Chuyến đi đang mở</p><p class="stat-value">${real.length}<span class="unit">chuyến</span></p></div></div><div class="stat"><span class="stat-icon">${icon('wallet')}</span><div><p class="stat-label">Tổng chi tiêu</p><p class="stat-value">${money(total)}</p></div></div><div class="stat"><span class="stat-icon">${icon('receipt')}</span><div><p class="stat-label">Khoản chi đã ghi</p><p class="stat-value">${count}<span class="unit">khoản</span></p></div></div></section>`}
    <section><div class="section-top"><h2>${archived ? 'Chuyến đi đã lưu trữ' : 'Những cuộc vui của bạn'} <span class="muted small" id="trip-count">(${data.trips.filter(t => t.archived === archived).length})</span></h2><div class="trip-tools">${archived ? '' : `<div class="segmented" aria-label="Lọc chuyến đi"><button data-action="filter" data-filter="active" class="${filter === 'active' ? 'active' : ''}" aria-pressed="${filter === 'active'}">Đang mở</button><button data-action="filter" data-filter="all" class="${filter === 'all' ? 'active' : ''}" aria-pressed="${filter === 'all'}">Tất cả</button></div>`}<label class="search">${icon('search')}<input id="trip-search" aria-label="Tìm chuyến đi" placeholder="Tìm chuyến đi..." value="${esc(search)}"></label></div></div><div id="trip-grid" class="trip-grid">${tripCards(archived)}</div></section>`;
}
function tripCards(archived) {
  const trips = data.trips.filter(t => (archived ? t.archived : filter === 'all' || !t.archived) && t.name.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')));
  return trips.map(t => `<article class="trip-card"><button class="trip-open" data-action="open-trip" data-id="${t.id}" aria-label="Mở ${esc(t.name)}"><div class="trip-cover ${t.theme}"><span class="cover-hill"></span><span class="cover-sun"></span>${icon(t.theme, 'cover-icon')}<span class="pill">${t.demo ? '✦ Dữ liệu mẫu' : t.archived ? 'Đã lưu trữ' : 'Đang mở'}</span><span class="cover-caption">${t.theme === 'mountain' ? 'INTO THE GREEN' : t.theme === 'beach' ? 'SUN, SEA & US' : t.theme === 'food' ? 'FOOD & FRIENDS' : 'LITTLE ADVENTURES'}</span></div><div class="trip-body"><h3>${esc(t.name)}</h3><div class="trip-date">${icon('calendar')}${dateText(t.date)}</div><div class="trip-meta">${avatars(t.members)}<span>${t.members.length} thành viên · ${t.expenses.length} khoản chi</span></div></div><div class="trip-footer"><span>TỔNG CHI TIÊU<br><strong>${money(calculate(t).total)}</strong></span>${icon('arrow')}</div></button></article>`).join('') +
    (!trips.length ? `<div class="search-empty">${search ? 'Chưa tìm thấy chuyến đi phù hợp.' : archived ? 'Chưa có chuyến đi được lưu trữ. Bạn có thể lưu trữ trong phần chỉnh sửa chuyến đi.' : 'Cuộc vui tiếp theo bắt đầu từ đây. Tạo chuyến đi và mời tên những người bạn nhé.'}</div>` : '') +
    (!archived && !search ? `<button class="create-card" data-action="new-trip"><span class="create-plus">${icon('plus')}</span><strong>Lên kèo tiếp thôi!</strong><p>Một chuyến đi mới,<br>thêm nhiều kỷ niệm đẹp.</p></button>${trips.length === 1 ? `<aside class="showcase-card"><div class="eyebrow" style="color:#94a480;margin-bottom:22px">ÍT TÍNH TOÁN, NHIỀU NIỀM VUI</div><h3>Chốt sổ trong một nốt nhạc.</h3><p>Ghi khoản chi, chọn người tham gia. Phần còn lại cứ để SplitBuddy.</p><div class="help-step"><span>1</span><div><strong>Ghi lại khoản chi</strong></div></div><div class="help-step"><span>2</span><div><strong>Xem ai cần trả ai</strong></div></div><div class="help-step"><span>3</span><div><strong>Copy, gửi vào nhóm</strong></div></div></aside>` : ''}` : '');
}
function tripPage({ trip: t, tab }) {
  return `<button class="back-link" data-action="home">${icon('back')} Tất cả chuyến đi</button>
  <section class="page-heading trip-heading"><div><h1 class="long-name">${esc(t.name)}</h1><div class="detail-meta"><span>${icon('calendar')}${dateText(t.date)}</span><span>${icon('users')}${t.members.length} thành viên</span><span class="pill">${t.archived ? 'Đã lưu trữ' : 'Đang mở'}</span></div></div><div class="heading-actions">${iconButton('edit-trip', 'Chỉnh sửa chuyến đi', 'edit')}${iconButton('share-trip', 'Chia sẻ tổng kết', 'share')}</div></section>
  ${t.demo ? `<div class="banner">${icon('sparkles')}<span>Đây là chuyến đi mẫu để bạn khám phá. Không tính vào thống kê chi tiêu của bạn.</span></div>` : ''}
  ${t.archived ? `<div class="banner">${icon('archive')}<span>Chuyến đi đang được lưu trữ. Bạn vẫn có thể cập nhật thông tin hoặc mở lại trong phần chỉnh sửa.</span></div>` : ''}
  <nav class="tabs" aria-label="Nội dung chuyến đi">${[['expenses', 'Khoản chi', 'receipt', t.expenses.length], ['members', 'Thành viên', 'users', t.members.length], ['summary', 'Chốt sổ', 'swap', null]].map(([id, label, ico, count]) => `<button class="tab ${tab === id ? 'active' : ''}" data-action="tab" data-tab="${id}" ${tab === id ? 'aria-current="page"' : ''}>${icon(ico)}${label}${count !== null ? `<span class="tab-count">${count}</span>` : ''}</button>`).join('')}</nav>
  ${tab === 'members' ? membersPage(t) : tab === 'summary' ? summaryPage(t) : expensesPage(t)}`;
}
function emptyState(ico, title, text, action, label) { return `<div class="empty">${icon(ico)}<h3>${title}</h3><p>${text}</p>${action ? button(action, label, 'plus', 'btn-primary') : ''}</div>`; }
function expensesPage(t) {
  const { total } = calculate(t);
  const expenses = [...t.expenses].reverse().sort((a, b) => b.date.localeCompare(a.date));
  const sums = Object.entries(CATEGORIES).map(([key, cat]) => ({ ...cat, value: t.expenses.filter(e => e.category === key).reduce((s, e) => s + e.amount, 0) })).filter(c => c.value);
  return `<div class="detail-grid"><section class="panel"><div class="panel-head"><h2>Lịch sử chi tiêu <span class="muted small">(${t.expenses.length})</span></h2>${button('new-expense', 'Thêm khoản chi', 'plus', 'btn-primary')}</div>${expenses.length ? expenses.map(e => `<button class="expense" data-action="edit-expense" data-id="${e.id}" aria-label="Sửa khoản chi ${esc(e.title)}"><span class="category-icon ${CATEGORIES[e.category].color}">${icon(CATEGORIES[e.category].icon)}</span><div class="expense-info"><div class="expense-title">${esc(e.title)}</div><div class="expense-sub">${esc(t.members.find(m => m.id === e.payerId).name)} trả · ${e.participantIds.length === t.members.length ? 'Cả nhóm' : e.participantIds.length + ' người tham gia'}</div></div><div class="expense-amount">${money(e.amount)}<small>${dateText(e.date)}</small></div></button>`).join('') : emptyState('receipt', 'Chưa có khoản chi nào', 'Bữa ăn đầu tiên hay tiền xe? Ghi lại ngay nhé.', t.members.length ? 'new-expense' : 'new-member', t.members.length ? 'Thêm khoản chi đầu tiên' : 'Thêm thành viên trước')}</section><aside class="detail-aside"><div class="overview-total"><p>TỔNG CHI TIÊU CHUYẾN ĐI</p><strong>${money(total)}</strong><div class="divider"></div><div class="split-label"><span>Đã ghi lại</span><b>${t.expenses.length} khoản chi</b></div></div><div class="panel category-breakdown"><h3>Chi tiêu vào đâu?</h3>${sums.length ? sums.map(c => `<div class="category-row"><span>${c.label}</span><b>${money(c.value)}</b></div><div class="bar"><span style="width:${Math.round(c.value / total * 100)}%"></span></div>`).join('') : '<p class="small muted">Biểu đồ sẽ xuất hiện khi bạn thêm khoản chi.</p>'}</div><p class="tip">Mỗi khoản chi có thể có những người tham gia khác nhau. Chỉ người được chọn mới chia khoản đó.</p></aside></div>`;
}
function membersPage(t) {
  const { rows } = calculate(t);
  return `<div class="section-top" style="flex-direction:row;align-items:center"><h2>Cùng chung cuộc vui</h2>${button('new-member', 'Thêm thành viên', 'plus', 'btn-primary')}</div>${rows.length ? `<div class="member-grid">${rows.map((m, i) => `<article class="member-card">${avatar(m, i)}<div class="member-name"><h3>${esc(m.name)}</h3><p>Đã trả ${money(m.paid)}</p></div>${iconButton('edit-member', 'Sửa tên ' + m.name, 'edit', `data-id="${m.id}"`)}${iconButton('delete-member', 'Xóa ' + m.name, 'trash', `data-id="${m.id}"`)}</article>`).join('')}</div><p class="member-note">${icon('shield')} Thành viên đã có trong khoản chi sẽ được giữ lại để lịch sử luôn chính xác. Hãy sửa hoặc xóa những khoản chi liên quan trước khi xóa thành viên.</p>` : emptyState('users', 'Ai sẽ đi cùng bạn?', 'Thêm tên mọi người trước khi bắt đầu chia chi phí.', 'new-member', 'Thêm thành viên')}`;
}
function summaryPage(t) {
  const { rows, total, transfers, optimal } = calculate(t);
  const member = id => t.members.find(m => m.id === id);
  return `<section class="stats"><div class="stat"><span class="stat-icon">${icon('wallet')}</span><div><p class="stat-label">Tổng chi tiêu</p><p class="stat-value">${money(total)}</p></div></div><div class="stat"><span class="stat-icon">${icon('users')}</span><div><p class="stat-label">Thành viên</p><p class="stat-value">${t.members.length}<span class="unit">người</span></p></div></div><div class="stat"><span class="stat-icon">${icon('swap')}</span><div><p class="stat-label">Cần chuyển tiền</p><p class="stat-value">${transfers.length}<span class="unit">lượt</span></p></div></div></section>
  <section class="panel"><div class="panel-head"><h2>Rõ ràng từng đồng</h2><span class="small muted">Đơn vị: VNĐ</span></div><div class="table-scroll"><table class="balance-table"><thead><tr><th>Thành viên</th><th>Đã trả</th><th>Phần chịu</th><th>Còn lại</th></tr></thead><tbody>${rows.map((r, i) => `<tr><td><span class="balance-name">${avatar(r, i)}${esc(r.name)}</span></td><td>${money(r.paid)}</td><td>${money(r.share)}</td><td class="${r.balance > 0 ? 'positive' : r.balance < 0 ? 'negative' : 'muted'}">${r.balance > 0 ? '+' : r.balance < 0 ? '−' : ''}${money(Math.abs(r.balance))}</td></tr>`).join('')}</tbody></table></div>${!rows.length ? '<p class="panel-body small muted">Thêm thành viên và khoản chi để xem bảng tổng kết.</p>' : ''}</section>
  <p class="small muted" style="margin-top:12px;font-size:11px">Số dương (+): cần nhận lại · Số âm (−): cần trả thêm.</p>
  <section class="panel settlement"><div class="panel-head"><h2>${icon('swap')} Chuyển thế này là xong!</h2><span class="pill">${optimal ? 'Ít giao dịch nhất' : 'Gợi ý rút gọn'}</span></div>${transfers.length ? transfers.map((tr, i) => `<div class="transfer"><span class="transfer-number">0${i + 1}</span><span class="transfer-who">${avatar(member(tr.from), t.members.indexOf(member(tr.from)))}${esc(member(tr.from).name)}</span>${icon('arrow', 'arrow')}<span class="transfer-who">${avatar(member(tr.to), t.members.indexOf(member(tr.to)))}${esc(member(tr.to).name)}</span><strong>${money(tr.amount)}</strong></div>`).join('') : emptyState('check', t.expenses.length ? 'Cả nhóm đã cân bằng!' : 'Chưa cần chuyển tiền', t.expenses.length ? 'Mỗi người đã trả đúng phần chi phí của mình.' : 'Thêm khoản chi để SplitBuddy tính giúp bạn.')}</section>
  ${!optimal ? '<div class="note-box">Nhóm có trên 16 người còn dư/nợ: gợi ý ghép số dư lớn nhất, bảo đảm cân bằng nhưng không bảo đảm ít giao dịch nhất.</div>' : ''}
  ${t.expenses.some(e => e.amount % e.participantIds.length) ? '<div class="note-box">Khoản chia lẻ được làm tròn đến đồng: những người đầu trong danh sách tham gia đã lưu nhận thêm 1đ chi phí, để tổng tiền luôn khớp.</div>' : ''}
  <div class="summary-actions">${button('share-trip', 'Xem & chia sẻ', 'share')}${button('copy-summary', 'Sao chép tổng kết', 'copy', 'btn-primary')}</div><p class="small muted" style="text-align:right;font-size:11px">Dán vào Zalo hoặc Messenger để cả nhóm cùng kiểm tra.</p>`;
}
function dataPage() {
  return `<section class="page-heading"><div><h1>Dữ liệu của riêng bạn</h1><p>Mang theo những chuyến đi, dù đổi thiết bị.</p></div></section><div class="banner">${icon('lock')}<span>Dữ liệu chỉ nằm trong trình duyệt này, không tự đồng bộ. Xóa dữ liệu trình duyệt có thể làm mất các chuyến đi; hãy sao lưu định kỳ.</span></div><div class="data-grid"><section class="panel"><div class="panel-body">${icon('download')}<h2>Giữ một bản sao an toàn</h2><p>Tải tất cả ${data.trips.length} chuyến đi cùng thành viên và khoản chi vào một tệp để lưu lại.</p>${button('export-data', 'Xuất bản sao lưu', 'download', 'btn-primary')}</div></section><section class="panel"><div class="panel-body">${icon('upload')}<h2>Tiếp tục từ bản sao lưu</h2><p>Mở tệp SplitBuddy đã xuất trước đó. Bạn sẽ xem số chuyến đi và xác nhận trước khi thay dữ liệu hiện tại.</p>${button('import-data', 'Nhập bản sao lưu', 'upload')}</div></section></div>${corruptRaw ? `<div class="note-box raw-warning">Dữ liệu gốc vẫn được giữ nguyên. ${button('export-raw', 'Tải dữ liệu gốc để kiểm tra', 'download')}</div>` : ''}<div class="panel" style="margin-top:24px"><div class="panel-body"><h3 style="margin-bottom:8px">Làm quen với SplitBuddy</h3><p class="small muted" style="margin-bottom:16px">Tạo một chuyến đi mẫu với 4 người và 3 khoản chi để thử cách chia tiền.</p>${button('add-demo', 'Thêm chuyến đi mẫu', 'sparkles', 'btn-soft')}</div></div>`;
}

function openModal(title, body) {
  modalOpener = document.activeElement;
  if (modal.open) modal.close();
  modal.innerHTML = `<div class="modal-header"><h2 id="modal-title">${title}</h2>${iconButton('close-modal', 'Đóng hộp thoại', 'close')}</div><div class="modal-body">${body}</div>`;
  modal.showModal();
  requestAnimationFrame(() => { modal.querySelector('[autofocus]')?.focus(); });
}
function closeModal() { modal.close(); modal.innerHTML = ''; if (modalOpener?.isConnected) modalOpener.focus(); }
function formError(message) { const error = modal.querySelector('.form-error'); if (error) error.textContent = message; else toast(message); }
function onForm(callback) {
  modal.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    try { callback(new FormData(event.currentTarget)); } catch (e) { formError(e.message); }
  });
}
function actions(label = 'Lưu', deleteAction = '') { return `<div class="form-error" role="alert"></div><div class="modal-actions">${deleteAction ? `<button type="button" class="btn delete-action" data-action="${deleteAction}">${icon('trash')}Xóa</button>` : ''}<button type="button" class="btn btn-secondary" data-action="close-modal">Hủy</button><button type="submit" class="btn btn-primary">${icon('check')}${label}</button></div>`; }
function field(label, content) { return `<label class="field"><span class="field-label">${label}</span>${content}</label>`; }
function assertUniqueName(t, name, except) { if (t.members.some(m => m.id !== except && m.name.toLocaleLowerCase('vi') === name.toLocaleLowerCase('vi'))) throw new Error('Tên này đã có trong nhóm. Thêm biệt danh để dễ phân biệt nhé.'); }
function tripForm(t) {
  openModal(t ? 'Chỉnh sửa chuyến đi' : 'Lên kèo mới thôi!', `<p class="modal-desc">${t ? 'Một cái tên để nhớ, một cuộc vui để giữ.' : 'Đặt tên cuộc vui và thêm những người sẽ đi cùng bạn.'}</p><form id="trip-form">${field('Tên chuyến đi / sự kiện', `<input name="name" maxlength="80" required autofocus placeholder="Ví dụ: Đà Lạt cùng hội bạn" value="${esc(t?.name || '')}">`)}${field('Ngày bắt đầu', `<input name="date" type="date" required value="${t?.date || localDate()}">`)}<div class="field"><span class="field-label">Chọn một chút cảm hứng</span><div class="theme-options">${Object.entries(THEMES).map(([key, label]) => `<label class="theme-option"><input type="radio" name="theme" value="${key}" ${(t?.theme || 'mountain') === key ? 'checked' : ''}><span>${icon(key)}${label}</span></label>`).join('')}</div></div>${t ? `<label class="participant"><input type="checkbox" name="archived" ${t.archived ? 'checked' : ''}><span>Lưu trữ chuyến đi này</span></label>` : field('Thành viên tham gia', '<textarea name="members" placeholder="An, Bình, Cường, Dũng"></textarea><small>Phân cách bằng dấu phẩy hoặc xuống dòng. Có thể thêm sau.</small>')}${actions(t ? 'Lưu thay đổi' : 'Tạo chuyến đi', t ? 'delete-trip' : '')}</form>`);
  onForm(form => {
    const name = form.get('name').trim();
    if (!name) throw new Error('Bạn chưa đặt tên chuyến đi.');
    if (t) changeTrip(t.id, item => { item.name = name; item.date = form.get('date'); item.theme = form.get('theme'); item.archived = form.has('archived'); });
    else {
      const names = form.get('members').split(/[,\n]/).map(s => s.trim()).filter(Boolean);
      if (names.some(n => n.length > 40)) throw new Error('Tên thành viên không quá 40 ký tự.');
      if (new Set(names.map(n => n.toLocaleLowerCase('vi'))).size !== names.length) throw new Error('Có tên thành viên bị trùng. Thêm biệt danh để phân biệt nhé.');
      const trip = { id: uid(), name, date: form.get('date'), theme: form.get('theme'), archived: false, demo: false, members: names.map(name => ({ id: uid(), name })), expenses: [] };
      save(d => { if (d.trips.length >= 200) throw new Error('Đã đạt giới hạn 200 chuyến đi. Xuất sao lưu rồi xóa chuyến không cần thiết nhé.'); d.trips.unshift(trip); });
      closeModal(); go('#trip/' + trip.id + '/expenses'); toast('Đã tạo chuyến đi. Cuộc vui bắt đầu!'); return;
    }
    closeModal(); render(); toast('Đã lưu chuyến đi.');
  });
}
function memberForm(t, m) {
  openModal(m ? 'Sửa tên thành viên' : 'Thêm bạn đồng hành', `<p class="modal-desc">Tên hoặc biệt danh giúp mọi người dễ nhận ra nhau.</p><form>${field(m ? 'Tên thành viên' : 'Tên thành viên (mỗi dòng một người)', m ? `<input name="name" required maxlength="40" value="${esc(m.name)}" autofocus>` : '<textarea name="name" required autofocus placeholder="An\nBình"></textarea>')}${actions(m ? 'Lưu tên' : 'Thêm thành viên')}</form>`);
  onForm(form => {
    const names = m ? [form.get('name').trim()] : form.get('name').split(/[,\n]/).map(s => s.trim()).filter(Boolean);
    if (!names.length || names.some(n => !n || n.length > 40)) throw new Error('Nhập tên từ 1 đến 40 ký tự cho mỗi người.');
    changeTrip(t.id, trip => {
      if (m) { assertUniqueName(trip, names[0], m.id); trip.members.find(item => item.id === m.id).name = names[0]; }
      else for (const name of names) { assertUniqueName(trip, name); if (trip.members.length >= 100) throw new Error('Mỗi chuyến đi tối đa 100 thành viên.'); trip.members.push({ id: uid(), name }); }
    });
    closeModal(); render(); toast(m ? 'Đã cập nhật tên.' : `Đã thêm ${names.length} thành viên.`);
  });
}
function expenseForm(t, e) {
  if (!t.members.length) { toast('Thêm ít nhất một thành viên trước nhé.'); memberForm(t); return; }
  const selected = e?.participantIds || t.members.map(m => m.id);
  openModal(e ? 'Chỉnh sửa khoản chi' : 'Thêm một khoản chi', `<p class="modal-desc">Ai trả trước cũng được. SplitBuddy sẽ tính phần còn lại.</p><form id="expense-form">${field('Tên khoản chi', `<input name="title" maxlength="80" required autofocus placeholder="Ví dụ: Bữa tối lẩu bò" value="${esc(e?.title || '')}">`)}<div class="field-row">${field('Số tiền (VNĐ)', `<input name="amount" inputmode="numeric" autocomplete="off" maxlength="18" required placeholder="0" value="${e ? new Intl.NumberFormat('vi-VN').format(e.amount) : ''}">`)}${field('Danh mục', `<select name="category">${Object.entries(CATEGORIES).map(([key, c]) => `<option value="${key}" ${(e?.category || 'food') === key ? 'selected' : ''}>${c.label}</option>`).join('')}</select>`)}</div><div class="field-row">${field('Người trả tiền', `<select name="payerId">${t.members.map((m, i) => `<option value="${m.id}" ${(e ? e.payerId === m.id : i === 0) ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select>`)}${field('Ngày chi', `<input name="date" type="date" required value="${e?.date || localDate()}">`)}</div><div class="field"><div class="select-heading"><span>Ai tham gia khoản này?</span><button class="text-btn" type="button" data-action="toggle-participants">Chọn / bỏ tất cả</button></div><div class="participants">${t.members.map(m => `<label class="participant"><input type="checkbox" name="participantIds" value="${m.id}" ${selected.includes(m.id) ? 'checked' : ''}><span>${esc(m.name)}</span><small data-share="${m.id}"></small></label>`).join('')}</div><small id="split-hint">Chia đều cho những người được chọn.</small></div>${field('Ghi chú (không bắt buộc)', `<textarea name="note" maxlength="500" placeholder="Một chút ghi chú cho cả nhóm…">${esc(e?.note || '')}</textarea>`)}${actions(e ? 'Lưu thay đổi' : 'Lưu khoản chi', e ? 'delete-expense' : '')}</form>`);
  modal.dataset.expenseId = e?.id || '';
  modal.dataset.participantOrder = JSON.stringify(e?.participantIds || []);
  modal.querySelector('[name="amount"]').addEventListener('input', updateSplitPreview);
  modal.querySelectorAll('[name="participantIds"]').forEach(el => el.addEventListener('change', updateSplitPreview));
  updateSplitPreview();
  onForm(form => {
    const title = form.get('title').trim();
    if (!title) throw new Error('Nhập tên khoản chi trước nhé.');
    const amount = parseAmount(form.get('amount'));
    const participantIds = selectedParticipants();
    if (!participantIds.length) throw new Error('Chọn ít nhất một người tham gia khoản chi.');
    const item = { id: e?.id || uid(), title, amount, payerId: form.get('payerId'), participantIds, date: form.get('date'), category: form.get('category'), note: form.get('note').trim() };
    changeTrip(t.id, trip => {
      if (e) trip.expenses[trip.expenses.findIndex(x => x.id === e.id)] = item;
      else { if (trip.expenses.length >= 5000) throw new Error('Mỗi chuyến đi tối đa 5.000 khoản chi. Hãy tạo chuyến đi mới.'); trip.expenses.push(item); }
    });
    closeModal(); render(); toast(e ? 'Đã cập nhật khoản chi.' : 'Đã ghi lại khoản chi.');
  });
}
function selectedParticipants() {
  const selected = [...modal.querySelectorAll('[name="participantIds"]:checked')].map(el => el.value);
  // Preserve stored remainder allocation even after names/members have changed.
  const previous = JSON.parse(modal.dataset.participantOrder || '[]');
  return [...previous.filter(id => selected.includes(id)), ...selected.filter(id => !previous.includes(id))];
}
function updateSplitPreview() {
  modal.querySelectorAll('[data-share]').forEach(el => { el.textContent = ''; });
  const ids = selectedParticipants();
  const hint = modal.querySelector('#split-hint');
  if (!ids.length) { hint.textContent = 'Chọn ít nhất một người tham gia.'; return; }
  try {
    const amount = parseAmount(modal.querySelector('[name="amount"]').value);
    for (const part of splitAmount(amount, ids)) modal.querySelector(`[data-share="${part.id}"]`).textContent = money(part.amount);
    hint.textContent = `Chia cho ${ids.length} người${amount % ids.length ? ' · Tiền dư chia thêm 1đ theo thứ tự tham gia đã lưu.' : ' · Mỗi người ' + money(amount / ids.length) + '.'}`;
  } catch { hint.textContent = `Chia đều cho ${ids.length} người được chọn.`; }
}
function confirmAction(title, message, callback, label = 'Xác nhận', danger = false) {
  openModal(title, `<p class="confirm-message">${message}</p><div class="form-error" role="alert"></div><div class="modal-actions"><button class="btn btn-secondary" data-action="close-modal">Quay lại</button><button id="confirm-action" class="btn ${danger ? 'btn-danger' : 'btn-primary'}">${label}</button></div>`);
  modal.querySelector('#confirm-action').addEventListener('click', () => { try { callback(); } catch (e) { formError(e.message); } });
}
async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(text); return; } catch { /* Use the selection fallback on browsers that deny Clipboard API. */ }
  }
  const field = document.createElement('textarea');
  field.value = text; field.style.cssText = 'position:fixed;top:0;left:-9999px';
  const parent = modal.open ? modal : document.body;
  parent.append(field); field.focus(); field.select(); field.setSelectionRange(0, text.length);
  let ok;
  try { ok = document.execCommand('copy'); } finally { field.remove(); }
  if (!ok) throw new Error('Trình duyệt chưa cho phép sao chép. Hãy chọn nội dung tổng kết và sao chép thủ công.');
}
function shareTrip(t) {
  openModal('Gửi một tin, chốt cả nhóm', `<p class="modal-desc">Lịch sử chi tiêu và kết quả đã sẵn sàng để gửi vào Zalo, Messenger hoặc bất kỳ nhóm chat nào.</p><textarea class="copy-text" readonly aria-label="Nội dung tổng kết">${esc(summaryText(t))}</textarea><div class="form-error" role="alert"></div><div class="modal-actions">${navigator.share ? button('native-share', 'Chia sẻ', 'share') : ''}${button('copy-summary', 'Sao chép', 'copy', 'btn-primary')}</div>`);
}
function help() {
  openModal('Chia tiền, giữ niềm vui', `<p class="modal-desc">Một góc nhỏ cho những chuyến đi thật vui.</p>${[['Tạo chuyến đi & thêm bạn', 'Đặt tên sự kiện, nhập thành viên. Mỗi chuyến đi có sổ chi tiêu riêng.'], ['Ghi lại các khoản chi', 'Nhập số tiền, chọn người trả và những người tham gia. Người trả có thể không tham gia khoản đó.'], ['Chốt sổ & gửi vào nhóm', 'Xem ai cần chuyển cho ai, rồi sao chép tổng kết gửi Zalo hoặc Messenger. Đây là gợi ý, ứng dụng không thực hiện chuyển tiền.']].map(([title, text], i) => `<div class="help-step"><span>${i + 1}</span><div><strong>${title}</strong><p>${text}</p></div></div>`).join('')}<div class="install-note">${icon('phone')} <strong>Đưa SplitBuddy ra màn hình iPhone</strong><br>Mở URL bằng Safari → nút Chia sẻ → Thêm vào Màn hình chính. Sau lần tải đầu thành công, bạn có thể dùng ngoại tuyến khi ứng dụng đã lưu bộ nhớ đệm.</div><p class="small muted" style="margin-top:18px;font-size:11px;line-height:1.8">Mỗi trình duyệt giữ một bản dữ liệu riêng. Hãy xuất sao lưu trước khi xóa dữ liệu trình duyệt, đổi URL hoặc chuyển thiết bị.</p><div class="modal-actions">${button('close-modal', 'Bắt đầu thôi', 'check', 'btn-primary')}</div>`);
}
function download(contents, name) {
  const url = URL.createObjectURL(new Blob([contents], { type: 'application/json;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = name;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
async function handleAction(event) {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  const r = route(); const t = r.trip;
  try {
    switch (action) {
      case 'home': search = ''; filter = 'active'; go('#home'); break;
      case 'archive': search = ''; go('#archive'); break;
      case 'data': go('#data'); break;
      case 'help': help(); break;
      case 'new-trip': tripForm(); break;
      case 'edit-trip': if (t) tripForm(t); break;
      case 'open-trip': go('#trip/' + el.dataset.id + '/expenses'); break;
      case 'filter': filter = el.dataset.filter; render(); break;
      case 'tab': if (t) go('#trip/' + t.id + '/' + el.dataset.tab); break;
      case 'close-modal': closeModal(); break;
      case 'new-member': if (t) memberForm(t); break;
      case 'edit-member': if (t) memberForm(t, t.members.find(m => m.id === el.dataset.id)); break;
      case 'new-expense': if (t) expenseForm(t); break;
      case 'edit-expense': if (t) expenseForm(t, t.expenses.find(e => e.id === el.dataset.id)); break;
      case 'toggle-participants': {
        const inputs = [...modal.querySelectorAll('[name="participantIds"]')];
        const all = inputs.every(input => input.checked);
        inputs.forEach(input => { input.checked = !all; }); updateSplitPreview(); break;
      }
      case 'delete-member': {
        const m = t?.members.find(m => m.id === el.dataset.id); if (!m) break;
        if (t.expenses.some(e => e.payerId === m.id || e.participantIds.includes(m.id))) { toast('Thành viên đã có khoản chi. Sửa hoặc xóa khoản chi liên quan trước nhé.'); break; }
        confirmAction('Xóa thành viên?', `Xóa <strong>${esc(m.name)}</strong> khỏi chuyến đi này?`, () => { changeTrip(t.id, trip => { trip.members = trip.members.filter(item => item.id !== m.id); }); closeModal(); render(); toast('Đã xóa thành viên.'); }, 'Xóa thành viên', true); break;
      }
      case 'delete-expense': {
        const id = modal.dataset.expenseId; const expense = t?.expenses.find(e => e.id === id); if (!expense) break;
        confirmAction('Xóa khoản chi?', `Xóa <strong>${esc(expense.title)}</strong> (${money(expense.amount)})? Bảng chốt sổ sẽ được tính lại.`, () => { changeTrip(t.id, trip => { trip.expenses = trip.expenses.filter(e => e.id !== id); }); closeModal(); render(); toast('Đã xóa khoản chi.'); }, 'Xóa khoản chi', true); break;
      }
      case 'delete-trip': if (t) confirmAction('Xóa chuyến đi?', `<strong>${esc(t.name)}</strong> và toàn bộ ${t.expenses.length} khoản chi sẽ bị xóa. Thao tác này không thể hoàn tác; bạn có thể xuất sao lưu trước.`, () => { save(d => { d.trips = d.trips.filter(item => item.id !== t.id); }); closeModal(); go('#home'); toast('Đã xóa chuyến đi.'); }, 'Xóa chuyến đi', true); break;
      case 'share-trip': if (t) shareTrip(t); break;
      case 'copy-summary': if (t) { try { await copyText(summaryText(t)); toast('Đã sao chép. Dán vào nhóm chat thôi!'); } catch (e) { if (!modal.open) shareTrip(t); formError(e.message); } } break;
      case 'native-share': if (t && navigator.share) { try { await navigator.share({ title: 'Tổng kết — ' + t.name, text: summaryText(t) }); } catch (e) { if (e.name !== 'AbortError') formError('Không mở được menu chia sẻ. Bạn có thể sao chép nội dung.'); } } break;
      case 'export-data': download(JSON.stringify({ ...data, exportedAt: new Date().toISOString() }, null, 2), `splitbuddy-${localDate()}.json`); toast('Đã tạo tệp sao lưu.'); break;
      case 'export-raw': if (corruptRaw) download(corruptRaw, `splitbuddy-du-lieu-goc-${localDate()}.json`); break;
      case 'import-data': document.querySelector('#import-file').click(); break;
      case 'add-demo': save(d => d.trips.unshift(demoTrip())); render(); toast('Đã thêm chuyến đi mẫu.'); break;
    }
  } catch (error) { if (modal.open) formError(error.message); else toast(error.message); }
}
document.addEventListener('click', handleAction);
app.addEventListener('input', event => {
  if (event.target.id === 'trip-search') { search = event.target.value; document.querySelector('#trip-grid').innerHTML = tripCards(route().page === 'archive'); }
});
modal.addEventListener('click', event => { if (event.target === modal) { const rect = modal.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeModal(); } });
document.querySelector('#import-file').addEventListener('change', async event => {
  const file = event.target.files[0]; event.target.value = '';
  if (!file) return;
  try {
    if (file.size > 10 * 1024 * 1024) throw new Error('Chỉ nhận tệp sao lưu tối đa 10 MB.');
    const incoming = validateData(JSON.parse(await file.text()));
    confirmAction('Khôi phục bản sao lưu?', `Tệp có <strong>${incoming.trips.length} chuyến đi</strong>. Dữ liệu này sẽ thay thế ${data.trips.length} chuyến đi hiện tại. Hãy xuất bản sao lưu hiện tại trước nếu bạn muốn giữ lại.`, () => {
      save(d => { d.trips = incoming.trips; }, { recovery: true }); closeModal(); go('#home'); toast('Đã khôi phục bản sao lưu.');
    }, 'Khôi phục dữ liệu');
  } catch (e) { toast(e instanceof SyntaxError ? 'Tệp này không phải bản sao lưu JSON hợp lệ.' : e.message); }
});
window.addEventListener('hashchange', () => { if (modal.open) closeModal(); render(); window.scrollTo(0, 0); });
window.addEventListener('storage', event => {
  if (event.key !== STORAGE_KEY) return;
  if (modal.open) { toast('Dữ liệu đổi ở tab khác. Đóng biểu mẫu và tải lại trước khi lưu.'); return; }
  try { data = event.newValue ? validateData(JSON.parse(event.newValue)) : { version: 1, trips: [] }; savedRaw = event.newValue; storageIssue = ''; render(); toast('Đã cập nhật dữ liệu từ tab khác.'); }
  catch { storageIssue = 'Dữ liệu thay đổi ở tab khác nhưng không đọc được. Hãy tải lại trang để kiểm tra.'; render(); }
});
render();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === '127.0.0.1' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('./sw.js').catch(() => { /* Online use remains available if offline caching is unsupported. */ });
}
