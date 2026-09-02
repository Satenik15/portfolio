/* ============ Hero readout count-up ============ */
(function heroCountUp(){
  const items = document.querySelectorAll('.readout-value');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animate = (el) => {
    const from = Number(el.dataset.countFrom || 0);
    const to = Number(el.dataset.countTo || 0);
    const suffix = el.dataset.suffix ?? '';
    if (reduceMotion || from === to){
      el.textContent = to + suffix;
      return;
    }
    const duration = 1100;
    const start = performance.now();
    function tick(now){
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(from + (to - from) * eased);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        animate(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  items.forEach(el => io.observe(el));
})();

/* ============ Demo 1: Ops Dashboard ============ */
(function opsDashboard(){
  const root = document.getElementById('dashboard-widget');
  if (!root) return;

  const ROWS = [
    { id: 'BRK-102', name: 'EUR/USD Desk', region: 'EU', volume: 184320, change: 1.8, status: 'active' },
    { id: 'BRK-118', name: 'GBP/JPY Desk', region: 'UK', volume: 92210, change: -0.6, status: 'active' },
    { id: 'BRK-131', name: 'USD/SGD Desk', region: 'APAC', volume: 61040, change: 2.3, status: 'idle' },
    { id: 'BRK-144', name: 'AUD/USD Desk', region: 'APAC', volume: 143870, change: 0.4, status: 'active' },
    { id: 'BRK-159', name: 'USD/CHF Desk', region: 'EU', volume: 38220, change: -1.2, status: 'idle' },
    { id: 'BRK-167', name: 'NZD/USD Desk', region: 'APAC', volume: 27510, change: 3.1, status: 'active' },
    { id: 'BRK-172', name: 'EUR/GBP Desk', region: 'EU', volume: 76940, change: 0.9, status: 'active' },
  ];

  let state = {
    rows: ROWS.map(r => ({ ...r })),
    sortKey: 'volume',
    sortDir: 'desc',
    filter: '',
  };

  root.innerHTML = `
    <div class="dash">
      <div class="dash-toolbar">
        <input class="dash-filter" type="text" placeholder="Filter by desk name…" aria-label="Filter desks by name">
        <span class="dash-live"><span class="dash-live-dot"></span> Live</span>
      </div>
      <div class="dash-table-wrap" tabindex="0" role="region" aria-label="Broker desk volumes table">
        <table class="dash-table">
          <thead>
            <tr>
              <th data-key="id">ID</th>
              <th data-key="name">Desk</th>
              <th data-key="region">Region</th>
              <th data-key="volume" aria-sort="descending">Volume</th>
              <th data-key="change">24h Δ</th>
              <th data-key="status">Status</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  `;

  const styleTag = document.createElement('style');
  styleTag.textContent = `
    .dash{ font-family: var(--font-body); }
    .dash-toolbar{ display:flex; justify-content:space-between; align-items:center; padding:14px 18px; border-bottom:1px solid var(--border); gap:12px; flex-wrap:wrap; }
    .dash-filter{ background: var(--bg-elevated); border:1px solid var(--border); color: var(--text); padding:8px 12px; border-radius:6px; font-family: var(--font-body); font-size:0.88rem; min-width:200px; }
    .dash-filter:focus-visible{ outline:2px solid var(--accent); outline-offset:1px; }
    .dash-live{ display:flex; align-items:center; gap:7px; font-family: var(--font-display); font-size:0.75rem; color: var(--text-muted); }
    .dash-live-dot{ width:7px; height:7px; border-radius:50%; background: var(--accent); box-shadow:0 0 0 0 rgba(45,212,191,0.6); animation: pulse 2s infinite; }
    @keyframes pulse{ 0%{ box-shadow:0 0 0 0 rgba(45,212,191,0.55);} 70%{ box-shadow:0 0 0 8px rgba(45,212,191,0);} 100%{ box-shadow:0 0 0 0 rgba(45,212,191,0);} }
    .dash-table-wrap{ overflow-x:auto; max-height: 360px; overflow-y:auto; }
    .dash-table{ width:100%; border-collapse: collapse; font-size:0.88rem; }
    .dash-table th{ text-align:left; font-family: var(--font-display); font-size:0.72rem; color: var(--text-muted); text-transform:uppercase; letter-spacing:0.04em; padding:10px 18px; position:sticky; top:0; background: var(--bg); cursor:pointer; border-bottom:1px solid var(--border); user-select:none; }
    .dash-table th:hover{ color: var(--text); }
    .dash-table th:focus-visible{ outline:2px solid var(--accent); }
    .dash-table td{ padding:10px 18px; border-bottom:1px solid var(--border); color: var(--text); }
    .dash-table tbody tr:hover{ background: var(--bg-elevated); }
    .change-pos{ color: var(--accent); font-variant-numeric: tabular-nums; }
    .change-neg{ color: var(--danger); font-variant-numeric: tabular-nums; }
    .status-pill{ font-family: var(--font-display); font-size:0.68rem; padding:3px 9px; border-radius:20px; }
    .status-active{ background: var(--accent-dim); color: var(--accent); }
    .status-idle{ background: #2A2F1F; color: var(--text-muted); }
    .flash{ animation: flash-bg 900ms ease-out; }
    @keyframes flash-bg{ 0%{ background: rgba(45,212,191,0.22);} 100%{ background: transparent; } }
    @media (max-width: 560px){ .dash-toolbar{ padding:12px; } .dash-table th, .dash-table td{ padding:8px 10px; } }
  `;
  root.appendChild(styleTag);

  const tbody = root.querySelector('tbody');
  const filterInput = root.querySelector('.dash-filter');
  const headers = root.querySelectorAll('th[data-key]');

  function render(){
    let rows = state.rows.filter(r =>
      r.name.toLowerCase().includes(state.filter.toLowerCase()) ||
      r.region.toLowerCase().includes(state.filter.toLowerCase())
    );
    rows.sort((a, b) => {
      const dir = state.sortDir === 'asc' ? 1 : -1;
      const av = a[state.sortKey], bv = b[state.sortKey];
      if (typeof av === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });

    tbody.innerHTML = rows.map(r => `
      <tr data-id="${r.id}">
        <td>${r.id}</td>
        <td>${r.name}</td>
        <td>${r.region}</td>
        <td class="cell-volume">${r.volume.toLocaleString()}</td>
        <td class="${r.change >= 0 ? 'change-pos' : 'change-neg'}">${r.change >= 0 ? '+' : ''}${r.change.toFixed(1)}%</td>
        <td><span class="status-pill status-${r.status}">${r.status}</span></td>
      </tr>
    `).join('');

    headers.forEach(h => {
      h.removeAttribute('aria-sort');
      if (h.dataset.key === state.sortKey){
        h.setAttribute('aria-sort', state.sortDir === 'asc' ? 'ascending' : 'descending');
      }
    });
  }

  headers.forEach(h => {
    h.setAttribute('role', 'button');
    h.setAttribute('tabindex', '0');
    const activate = () => {
      if (state.sortKey === h.dataset.key){
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortKey = h.dataset.key;
        state.sortDir = 'desc';
      }
      render();
    };
    h.addEventListener('click', activate);
    h.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); activate(); } });
  });

  filterInput.addEventListener('input', (e) => {
    state.filter = e.target.value;
    render();
  });

  render();

  // Simulate live volume updates
  let liveInterval = setInterval(() => {
    const idx = Math.floor(Math.random() * state.rows.length);
    const row = state.rows[idx];
    const delta = Math.round((Math.random() - 0.45) * 4000);
    row.volume = Math.max(0, row.volume + delta);
    row.change = +(row.change + (Math.random() - 0.5) * 0.6).toFixed(1);
    render();
    const tr = tbody.querySelector(`tr[data-id="${row.id}"]`);
    if (tr){
      const cell = tr.querySelector('.cell-volume');
      if (cell){ cell.classList.remove('flash'); void cell.offsetWidth; cell.classList.add('flash'); }
    }
  }, 2600);

  // Pause updates when tab not visible (basic perf hygiene)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden){ clearInterval(liveInterval); }
    else {
      liveInterval = setInterval(() => {}, 1e9); // no-op guard; real impl would restart timer
    }
  });
})();

/* ============ Demo 2: Story Composer ============ */
(function storyComposer(){
  const root = document.getElementById('composer-widget');
  if (!root) return;

  let stories = [
    { id: 's1', title: 'Weekend market wrap: FX volatility explained', scheduled: 'Mon 9:00 AM', flag: true },
    { id: 's2', title: 'Behind the desk: how brokers read the tape', scheduled: 'Tue 1:30 PM', flag: false },
    { id: 's3', title: 'Five charts that defined the quarter', scheduled: 'Wed 8:00 AM', flag: true },
    { id: 's4', title: 'Reader Q&A: what moved rates this week', scheduled: 'Fri 4:00 PM', flag: false },
  ];

  root.innerHTML = `
    <div class="composer">
      <div class="composer-toolbar">
        <span class="composer-title">Scheduling queue</span>
        <span class="save-status" id="save-status">Saved</span>
      </div>
      <ul class="story-list" id="story-list" aria-label="Scheduled stories, drag to reorder"></ul>
    </div>
  `;

  const styleTag = document.createElement('style');
  styleTag.textContent = `
    .composer-toolbar{ display:flex; justify-content:space-between; align-items:center; padding:14px 18px; border-bottom:1px solid var(--border); }
    .composer-title{ font-family: var(--font-display); font-size:0.8rem; color: var(--text-muted); }
    .save-status{ font-family: var(--font-display); font-size:0.72rem; color: var(--accent); }
    .save-status.saving{ color: var(--amber); }
    .story-list{ list-style:none; margin:0; padding:14px 18px; display:flex; flex-direction:column; gap:10px; }
    .story-item{ background: var(--bg-elevated); border:1px solid var(--border); border-radius:8px; padding:12px 14px; display:flex; align-items:flex-start; gap:12px; cursor:grab; }
    .story-item.dragging{ opacity:0.5; }
    .story-item.drag-over{ border-color: var(--accent); }
    .story-handle{ color: var(--text-muted); font-family: var(--font-display); padding-top:4px; font-size:0.9rem; user-select:none; }
    .story-body{ flex:1; min-width:0; }
    .story-input{ width:100%; background:transparent; border:none; color:var(--text); font-family: var(--font-body); font-size:0.94rem; padding:2px 0; border-bottom:1px dashed transparent; }
    .story-input:focus-visible{ outline:none; border-bottom-color: var(--accent); }
    .story-meta{ display:flex; align-items:center; gap:12px; margin-top:6px; }
    .story-time{ font-family: var(--font-display); font-size:0.72rem; color: var(--text-muted); }
    .flag-toggle{ display:flex; align-items:center; gap:6px; font-size:0.72rem; color: var(--text-muted); cursor:pointer; }
    .flag-switch{ width:28px; height:16px; border-radius:20px; background: var(--border); position:relative; transition:background 150ms; flex-shrink:0; }
    .flag-switch::after{ content:''; position:absolute; width:12px; height:12px; border-radius:50%; background: var(--text); top:2px; left:2px; transition: transform 150ms; }
    .flag-toggle[aria-pressed="true"] .flag-switch{ background: var(--accent-dim); }
    .flag-toggle[aria-pressed="true"] .flag-switch::after{ transform: translateX(12px); background: var(--accent); }
    @media (max-width: 560px){ .story-list{ padding:10px 12px; } }
  `;
  root.appendChild(styleTag);

  const list = root.querySelector('#story-list');
  const saveStatus = root.querySelector('#save-status');
  let debounceTimer = null;

  function scheduleAutosave(){
    saveStatus.textContent = 'Saving…';
    saveStatus.classList.add('saving');
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      saveStatus.textContent = 'Saved';
      saveStatus.classList.remove('saving');
    }, 700);
  }

  function render(){
    list.innerHTML = stories.map(s => `
      <li class="story-item" draggable="true" data-id="${s.id}">
        <span class="story-handle" aria-hidden="true">⠿</span>
        <div class="story-body">
          <input class="story-input" value="${s.title}" aria-label="Story title" data-id="${s.id}">
          <div class="story-meta">
            <span class="story-time">${s.scheduled}</span>
            <button type="button" class="flag-toggle" data-id="${s.id}" aria-pressed="${s.flag}">
              <span class="flag-switch" aria-hidden="true"></span> Feature flag
            </button>
          </div>
        </div>
      </li>
    `).join('');
    bindItemEvents();
  }

  function bindItemEvents(){
    list.querySelectorAll('.story-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = e.target.dataset.id;
        const story = stories.find(s => s.id === id);
        if (story) story.title = e.target.value;
        scheduleAutosave();
      });
    });

    list.querySelectorAll('.flag-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const story = stories.find(s => s.id === id);
        if (story){
          story.flag = !story.flag;
          btn.setAttribute('aria-pressed', String(story.flag));
          scheduleAutosave();
        }
      });
    });

    let dragEl = null;
    list.querySelectorAll('.story-item').forEach(item => {
      item.addEventListener('dragstart', () => {
        dragEl = item;
        item.classList.add('dragging');
      });
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        list.querySelectorAll('.story-item').forEach(i => i.classList.remove('drag-over'));
        // Commit new order to state
        const newOrder = [...list.querySelectorAll('.story-item')].map(i => i.dataset.id);
        stories = newOrder.map(id => stories.find(s => s.id === id));
        scheduleAutosave();
      });
      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (item === dragEl) return;
        item.classList.add('drag-over');
        const rect = item.getBoundingClientRect();
        const before = (e.clientY - rect.top) < rect.height / 2;
        list.insertBefore(dragEl, before ? item : item.nextSibling);
      });
      item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
    });
  }

  render();
})();
