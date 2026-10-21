const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const leads = [
  { name: "Priya Nair", initials: "PN", color: "blue", product: "Premium mattress", value: "₹68,000", score: 94, intent: 91, status: "High intent", phone: "+919876500101", time: "10:30 AM", signals: ["Asked about delivery this week", "Compared premium models", "Requested a callback"] },
  { name: "Rahul Menon", initials: "RM", color: "peach", product: "Recliner sofa", value: "₹92,000", score: 88, intent: 84, status: "High intent", phone: "+919876500102", time: "10:45 AM", signals: ["Visited showroom twice", "Asked about EMI", "Interested in available colours"] },
  { name: "Sneha Rao", initials: "SR", color: "green", product: "King-size bed", value: "₹54,000", score: 79, intent: 76, status: "Interested", phone: "+919876500103", time: "11:15 AM", signals: ["Requested product details", "Asked about warranty"] },
  { name: "Arjun Das", initials: "AD", color: "yellow", product: "Ergonomic chair", value: "₹24,000", score: 72, intent: 67, status: "Interested", phone: "+919876500104", time: "11:30 AM", signals: ["Asked about back support", "Needs manager approval"] },
  { name: "Meera Shah", initials: "MS", color: "purple", product: "Orthopaedic mattress", value: "₹46,000", score: 65, intent: 61, status: "Follow-up", phone: "+919876500105", time: "12:00 PM", signals: ["Requested product comparison", "Follow-up after salary date"] },
  { name: "Karan Joshi", initials: "KJ", color: "blue", product: "Dining table", value: "₹39,000", score: 61, intent: 58, status: "Follow-up", phone: "+919876500106", time: "12:30 PM", signals: ["Viewed 6-seater table", "Asked about installation"] },
  { name: "Ananya Iyer", initials: "AI", color: "peach", product: "Wardrobe", value: "₹74,000", score: 56, intent: 52, status: "Follow-up", phone: "+919876500107", time: "1:00 PM", signals: ["Asked about dimensions", "Needs home measurement"] },
  { name: "Vikram Shetty", initials: "VS", color: "green", product: "Study desk", value: "₹18,000", score: 48, intent: 43, status: "New lead", phone: "+919876500108", time: "1:30 PM", signals: ["Online enquiry received"] }
];

const recentCalls = [
  { name: "Priya Nair", type: "Outgoing", time: "10:12 AM", duration: "04:32", status: "Connected", phone: "+919876500101", note: "Discussed 100-night trial and warranty. High probability of close." },
  { name: "Rahul Menon", type: "Missed", time: "09:48 AM", duration: "—", status: "Missed", phone: "+919876500102", note: "Customer hung up after 2 rings. Callback scheduled." },
  { name: "Sneha Rao", type: "Incoming", time: "09:31 AM", duration: "02:18", status: "Connected", phone: "+919876500103", note: "Sent product catalogue via WhatsApp." },
  { name: "Arjun Das", type: "Outgoing", time: "Yesterday", duration: "03:46", status: "Connected", phone: "+919876500104", note: "Customer comparing with Featherlite. Offered corporate discount." },
  { name: "Meera Shah", type: "Missed", time: "Yesterday", duration: "—", status: "Missed", phone: "+919876500105", note: "Missed incoming call after store hours." }
];

let currentView = "dashboard";
let page = 1;
let leadIndex = 0;
let calendarDate = new Date(2026, 9, 1);
let toastTimer;
let leadFilter = "All leads";
let expandedLeadName = null;
let activeCall = null;
let callTimerInterval = null;
let callSeconds = 0;
let callMode = "direct"; // 'direct' or 'coach'
let isMuted = false;
let completedCallsCount = 24;

// Audio tones for DTMF keypad simulation
function playTone(freq1, freq2) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.frequency.value = freq1 || 697;
    osc2.frequency.value = freq2 || 1209;
    gain.gain.value = 0.08;
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc1.start();
    osc2.start();
    setTimeout(() => {
      osc1.stop();
      osc2.stop();
      ctx.close();
    }, 120);
  } catch (e) {
    // Graceful fallback if audio is blocked
  }
}

// Browser speech synthesis for AI Customer & Pitch Coach
function speakText(text) {
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.0;
      utter.pitch = 1.0;
      window.speechSynthesis.speak(utter);
    }
  } catch (e) {}
}

function toast(msg) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
}

function heading(kicker, title, desc, actions = "") {
  return `<div class="page-heading"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${desc}</p></div><div class="heading-actions">${actions}</div></div>`;
}

function btn(label, action, cls = "secondary", attrs = "") {
  return `<button class="btn ${cls}" data-action="${action}" ${attrs}>${label}</button>`;
}

function person(l) {
  return `<div class="person"><div class="avatar tiny ${l.color || "purple"}">${l.initials}</div><div><strong>${l.name}</strong><small>${l.product || "Customer enquiry"}</small></div></div>`;
}

function statusTag(s) {
  let c = s === "High intent" ? "hot" : s === "Interested" ? "warm" : s === "Missed" ? "missed" : "cool";
  return `<span class="status ${c}">${s}</span>`;
}

function leadTable(rows, withExpand = false) {
  return `<div class="table-wrap"><table><thead><tr>${withExpand ? "<th></th>" : ""}<th>LEAD</th><th>EST. VALUE</th><th>ICP SCORE</th><th>INTENT</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>${rows.map(l => {
    const isExpanded = expandedLeadName === l.name;
    return `<tr>
      ${withExpand ? `<td><button class="expand-toggle" data-action="toggle-expand" data-name="${l.name}" title="Toggle details">${isExpanded ? "▲" : "▼"}</button></td>` : ""}
      <td>${person(l)}</td>
      <td>${l.value}</td>
      <td><span class="score">${l.score}</span>/100</td>
      <td>${l.intent}/100</td>
      <td>${statusTag(l.status)}</td>
      <td>
        <div class="row-actions">
          <button class="small-action" data-action="details" data-name="${l.name}">View</button>
          <button class="small-action" data-action="call" data-phone="${l.phone}" data-name="${l.name}">☎ Call</button>
        </div>
      </td>
    </tr>
    ${withExpand && isExpanded ? `
    <tr>
      <td colspan="7" class="expanded-drawer">
        <div class="drawer-grid">
          <div>
            <strong>Buying Signals & Context:</strong>
            <ul style="margin:6px 0 0;padding-left:16px;color:#636777;">${l.signals.map(s => `<li>${s}</li>`).join("")}</ul>
          </div>
          <div>
            <strong>Contact:</strong> <span style="font-family:monospace">${l.phone}</span><br>
            <strong>Next Scheduled Call:</strong> ${l.time}<br>
            <div style="margin-top:8px;display:flex;gap:6px;">
              <button class="btn primary" style="padding:6px 10px;font-size:10px;" data-action="call" data-phone="${l.phone}" data-name="${l.name}">☎ Start In-Browser Call</button>
              <button class="btn secondary" style="padding:6px 10px;font-size:10px;" data-action="details" data-name="${l.name}">Full Lead Card</button>
            </div>
          </div>
        </div>
      </td>
    </tr>` : ""}`;
  }).join("")}</tbody></table></div>`;
}

function kpi(label, value, foot, icon) {
  return `<div class="card"><div class="kpi-label">${label}<span class="kpi-icon">${icon}</span></div><div class="kpi-value">${value}</div><div class="kpi-foot">${foot}</div></div>`;
}

function chart() {
  let vals = [45, 62, 52, 76, 57, 88, 70];
  return `<div class="chart-area">${vals.map((v) => `<div class="bar-group"><div class="bar" style="height:${Math.max(20, v - 18)}%"></div><div class="bar main" style="height:${v}%"></div></div>`).join("")}</div><div class="chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>`;
}

function tasks() {
  const taskList = [
    { title: "Follow up with Priya Nair", leadName: "Priya Nair", sub: "Premium mattress · High intent", time: "10:30 AM" },
    { title: "Call Rahul Menon", leadName: "Rahul Menon", sub: "Recliner sofa · Callback requested", time: "10:45 AM" },
    { title: "Send quote to Sneha Rao", leadName: "Sneha Rao", sub: "King-size bed · Quote pending", time: "11:15 AM" },
    { title: "Confirm delivery availability", leadName: "Arjun Das", sub: "Ergonomic chair · Due today", time: "12:00 PM" }
  ];

  return `<div class="task-list">${taskList.map(t => `
    <div class="task clickable-task" data-action="details" data-name="${t.leadName}" title="Click to open ${t.leadName}'s lead modal">
      <input class="task-check" type="checkbox" aria-label="Complete task" onclick="event.stopPropagation()">
      <div class="task-main">
        <strong>${t.title} <span class="task-badge-lead">Open modal ↗</span></strong>
        <small>${t.sub}</small>
      </div>
      <span class="task-time">${t.time}</span>
    </div>`).join("")}</div>`;
}

function dashboard() {
  return `${heading("MONDAY, 19 OCTOBER", "Good morning, Agent Sharma 👋", "Here’s your shift at a glance.", btn("＋ New follow-up", "new-task", "primary") + btn("Export report", "export", "secondary"))}
  <div class="grid kpi-grid">
    ${kpi("Calls completed", String(completedCallsCount), '<span class="positive">↑ 12%</span> vs yesterday', "☎")}
    ${kpi("Leads in pipeline", "128", '<span class="positive">↑ 8%</span> this week', "♧")}
    ${kpi("Conversion rate", "18.6%", '<span class="positive">↑ 2.4%</span> this month', "↗")}
    ${kpi("Earnings this month", "₹42,850", '<span class="positive">↑ 6.8%</span> vs last month', "₹")}
  </div>
  <div class="grid dash-grid">
    <div class="card">
      <div class="card-title-row">
        <div>
          <div class="card-title">Call performance</div>
          <div class="card-subtitle">Your activity over the last 7 days</div>
        </div>
        <select class="tiny-select" id="chart-period">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
        </select>
      </div>
      ${chart()}
    </div>
    <div class="card">
      <div class="card-title-row">
        <div>
          <div class="card-title">Daily progress</div>
          <div class="card-subtitle">Keep going — you're doing well</div>
        </div>
        <span class="tag selected">Today</span>
      </div>
      <div class="progress-row"><span>Call target</span><strong>${completedCallsCount} / 35</strong></div>
      <div class="progress"><span style="width:${Math.min(100, Math.round((completedCallsCount / 35) * 100))}%"></span></div>
      <div class="progress-row"><span>Follow-ups completed</span><strong>12 / 18</strong></div>
      <div class="progress"><span style="width:67%"></span></div>
      <div class="progress-row"><span>Leads converted</span><strong>6 / 10</strong></div>
      <div class="progress"><span style="width:60%"></span></div>
    </div>
  </div>
  <div class="grid dash-grid">
    <div class="card">
      <div class="card-title-row">
        <div>
          <div class="card-title">Priority leads</div>
          <div class="card-subtitle">Leads most likely to convert</div>
        </div>
        <button class="small-action" data-action="navigate" data-view="calls">View all →</button>
      </div>
      ${leadTable(leads.slice(0, 3))}
    </div>
    <div class="card">
      <div class="card-title-row">
        <div>
          <div class="card-title">Your tasks</div>
          <div class="card-subtitle">Click any task to inspect lead details</div>
        </div>
        <span class="tag">4 tasks</span>
      </div>
      ${tasks()}
    </div>
  </div>`;
}

function callsView() {
  let filtered = leads;
  if (leadFilter === "High intent") filtered = leads.filter(l => l.status === "High intent");
  else if (leadFilter === "Follow-up") filtered = leads.filter(l => l.status === "Follow-up");

  const pageSize = 4;
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  if (page > totalPages) page = totalPages;
  const start = (page - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  return `${heading("LEAD MANAGEMENT", "Calls to make", "Prioritised follow-ups, ranked by lead score.", `<input class="search-input" id="lead-search" placeholder="Search leads...">`)}
  <div class="card table-card">
    <div class="card-title-row">
      <div>
        <div class="card-title">Priority call list</div>
        <div class="card-subtitle">Sorted by intent and estimated value · Click ▼ to expand details</div>
      </div>
      <div class="filter-row">
        <span class="tag ${leadFilter === "All leads" ? "selected" : ""}" data-action="filter-leads" data-filter="All leads" style="cursor:pointer">All leads</span>
        <span class="tag ${leadFilter === "High intent" ? "selected" : ""}" data-action="filter-leads" data-filter="High intent" style="cursor:pointer">High intent</span>
        <span class="tag ${leadFilter === "Follow-up" ? "selected" : ""}" data-action="filter-leads" data-filter="Follow-up" style="cursor:pointer">Follow-up</span>
      </div>
    </div>
    <div id="lead-table">${leadTable(pageRows, true)}</div>
    <div class="table-bottom">
      <span>Showing ${filtered.length === 0 ? 0 : start + 1}–${Math.min(start + pageSize, filtered.length)} of ${filtered.length} leads</span>
      <div class="pager">
        ${Array.from({ length: totalPages }, (_, i) => `<button data-action="page" data-page="${i + 1}" class="${page === i + 1 ? "active" : ""}">${i + 1}</button>`).join("")}
        ${page < totalPages ? `<button data-action="page" data-page="${page + 1}">→</button>` : ""}
      </div>
    </div>
  </div>`;
}

function incoming() {
  let missed = recentCalls.filter(c => c.status === "Missed");
  return `${heading("CALL ACTIVITY", "Incoming & missed", "Don't let a missed conversation become a lost sale.", btn("Refresh list", "refresh", "secondary"))}
  <div class="call-note">
    <strong>☎ 15-Minute Callback Rule</strong><br>
    86% of walk-ins leave with zero follow-up. Calling back missed leads promptly brings a +23.6pp conversion lift when you address the shopper by name.
  </div>
  <div class="card table-card">
    <div class="card-title-row">
      <div>
        <div class="card-title">Missed calls</div>
        <div class="card-subtitle">${missed.length} customers need a callback</div>
      </div>
      <span class="status missed">Needs attention</span>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>CUSTOMER</th>
            <th>CALL TIME</th>
            <th>EST. VALUE</th>
            <th>STATUS</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          ${missed.map(c => {
            let l = leads.find(x => x.name === c.name) || leads[0];
            return `<tr>
              <td>${person(l)}</td>
              <td>${c.time}</td>
              <td>${l.value}</td>
              <td>${statusTag("Missed")}</td>
              <td>
                <div style="display:flex;gap:6px;">
                  <button class="btn primary" data-action="call" data-phone="${c.phone}" data-name="${c.name}">☎ Call back</button>
                  <button class="small-action" data-action="review-call" data-name="${c.name}">Review</button>
                </div>
              </td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>
  </div>`;
}

function recent() {
  return `${heading("CALL ACTIVITY", "Recent calls", "Review your conversations and follow up when needed.", `<select class="tiny-select" id="call-filter"><option>All calls</option><option>Missed</option><option>Outgoing</option><option>Incoming</option></select>`)}
  <div class="card table-card">
    <div class="card-title-row">
      <div>
        <div class="card-title">Call history</div>
        <div class="card-subtitle">Most recent activity first · Tap any row to review transcript & audio</div>
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>CUSTOMER</th>
            <th>TYPE</th>
            <th>TIME</th>
            <th>DURATION</th>
            <th>STATUS</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody id="recent-rows">
          ${renderRecentRows(recentCalls)}
        </tbody>
      </table>
    </div>
  </div>`;
}

function renderRecentRows(callList) {
  return callList.map(c => {
    const l = leads.find(x => x.name === c.name) || { initials: c.name.split(" ").map(s => s[0]).join(""), color: "purple" };
    return `<tr style="cursor:pointer;" data-action="review-call" data-name="${c.name}">
      <td>
        <div class="person">
          <div class="avatar tiny ${l.color || "purple"}">${l.initials}</div>
          <div><strong>${c.name}</strong><small>Customer · Tap to review</small></div>
        </div>
      </td>
      <td>${c.type}</td>
      <td>${c.time}</td>
      <td>${c.duration}</td>
      <td>${statusTag(c.status === "Missed" ? "Missed" : "Connected")}</td>
      <td>
        <button class="small-action" data-action="call" data-phone="${c.phone}" data-name="${c.name}" onclick="event.stopPropagation()">☎ Call back</button>
      </td>
    </tr>`;
  }).join("");
}

function calendar() {
  let y = calendarDate.getFullYear(), m = calendarDate.getMonth();
  let first = new Date(y, m, 1).getDay();
  let days = new Date(y, m + 1, 0).getDate();
  let prevDays = new Date(y, m, 0).getDate();
  let cells = [];

  for (let i = 0; i < 42; i++) {
    let d = i - first + 1;
    let actual = d < 1 ? prevDays + d : d > days ? d - days : d;
    let muted = d < 1 || d > days;
    let event = !muted && [3, 8, 12, 19, 22, 27].includes(d);
    cells.push(`<div class="cal-day ${muted ? "muted" : ""} ${!muted && d === 19 && m === 9 && y === 2026 ? "today" : ""}">
      ${actual}${event ? '<br><i class="event-dot"></i><i class="event-dot green-dot"></i>' : ""}
    </div>`);
  }

  return `${heading("YOUR SCHEDULE", "Calendar", "Keep track of callbacks, meetings and team events.", btn("Today", "today", "secondary") + `<button class="btn secondary" data-action="cal-prev">←</button><button class="btn secondary" data-action="cal-next">→</button>`)}
  <div class="calendar-layout">
    <div class="card">
      <div class="card-title-row">
        <div class="card-title">${calendarDate.toLocaleString("en", { month: "long", year: "numeric" })}</div>
        <span class="tag">Month view</span>
      </div>
      <div class="calendar-grid">
        ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => `<div class="cal-head">${d}</div>`).join("")}
        ${cells.join("")}
      </div>
    </div>
    <div class="card">
      <div class="card-title-row">
        <div>
          <div class="card-title">Upcoming events</div>
          <div class="card-subtitle">Monday, 19 October</div>
        </div>
      </div>
      ${[
        { time: "10:30 AM", title: "Priya Nair callback", sub: "Customer follow-up · High intent" },
        { time: "11:00 AM", title: "Team huddle", sub: "Sales floor · 15 minutes" },
        { time: "01:30 PM", title: "Product training", sub: "Premium range mattress update" },
        { time: "03:00 PM", title: "Lead review", sub: "Manager check-in with Mukunda" }
      ].map(e => `
        <div class="event-item">
          <div class="event-time">${e.time}</div>
          <div class="event-main"><strong>${e.title}</strong><small>${e.sub}</small></div>
        </div>`).join("")}
      ${btn("＋ Add event", "add-event", "soft")}
    </div>
  </div>`;
}

function pulse() {
  return `${heading("TEAM WORKSPACE", "Pulse", "Stay connected with your team and your AI agents.", btn("＋ New message", "new-message", "primary"))}
  <div class="agent-grid grid">
    ${[
      { sym: "✳", name: "AvaniBot", desc: "Your AI workplace assistant & pitch coach", status: "Available" },
      { sym: "◎", name: "Role Agent", desc: "Guidance for store floor & phone SOPs", status: "Active" },
      { sym: "↗", name: "Task Agent", desc: "Automates SLA reminders & callback queues", status: "Active" }
    ].map(a => `
      <div class="card agent-card">
        <div class="agent-symbol">${a.sym}</div>
        <strong>${a.name}</strong>
        <p>${a.desc}</p>
        <span class="status cool">${a.status}</span>
      </div>`).join("")}
  </div>
  <div class="pulse-layout">
    <div class="card">
      <div class="card-title-row">
        <div>
          <div class="card-title">Channels</div>
          <div class="card-subtitle">Conversations across your workspace</div>
        </div>
        <button class="small-action" data-action="new-channel">＋ Add channel</button>
      </div>
      ${[
        { sym: "#", name: "general", desc: "Team-wide announcements", count: "2 new" },
        { sym: "↗", name: "sales-floor", desc: "Daily sales updates", count: "5 new" },
        { sym: "✦", name: "needs-your-input", desc: "Items waiting for your response", count: "1 new" },
        { sym: "♧", name: "kudos", desc: "Celebrate your teammates", count: "" }
      ].map(c => `
        <div class="channel-row" data-action="open-channel" data-channel="${c.name}">
          <div class="channel-symbol">${c.sym}</div>
          <div><strong>${c.name}</strong><small>${c.desc}</small></div>
          ${c.count ? `<span class="channel-count">${c.count}</span>` : ""}
        </div>`).join("")}
    </div>
    <div class="card">
      <div class="card-title-row">
        <div>
          <div class="card-title">Kudos</div>
          <span class="tag">This week</span>
        </div>
      </div>
      <div class="event-item">
        <div class="avatar tiny peach">RM</div>
        <div class="event-main"><strong>Rahul M.</strong><small>Thanks for helping close the premium mattress lead!</small></div>
      </div>
      <div class="event-item">
        <div class="avatar tiny green">SK</div>
        <div class="event-main"><strong>Sneha K.</strong><small>Great teamwork on yesterday's 15-minute callbacks.</small></div>
      </div>
      ${btn("＋ Give kudos", "kudos", "soft")}
    </div>
  </div>`;
}

function channel() {
  return `${heading("PULSE / CHANNEL", "Needs your input", "A shared space for decisions and quick replies.", btn("← Back to Pulse", "navigate", "secondary", 'data-view="pulse"'))}
  <div class="chat-layout">
    <div class="chat-header">
      <div class="channel-symbol">✦</div>
      <div><h2># needs-your-input</h2><p>8 members · Team decisions and updates</p></div>
    </div>
    <div class="pinned" id="pinned-decision-card">
      <span class="eyebrow">📌 PINNED · NEEDS YOUR INPUT</span>
      <p><strong>Customer callback process update</strong><br>Should we prioritise high-intent missed calls within 15 minutes? Please share your input before today's team huddle.</p>
      <div class="pinned-actions">
        <button class="btn primary" data-action="input-yes">✓ Yes, prioritise 15m SLA</button>
        <button class="btn secondary" data-action="input-discuss">Let's discuss in huddle</button>
      </div>
    </div>
    <div id="chat-messages">
      <div class="message">
        <div class="avatar tiny peach">RM</div>
        <div class="bubble"><strong>Rahul Menon</strong><br>I think high-intent callbacks should be our first priority. Bain report says 86% of walk-ins leave with zero follow-up.<small>9:42 AM</small></div>
      </div>
      <div class="message">
        <div class="avatar tiny green">SK</div>
        <div class="bubble"><strong>Sneha Kumar</strong><br>Agreed. We can try a 15-minute target and review results with Mukunda.<small>9:48 AM</small></div>
      </div>
      <div class="message own">
        <div class="avatar tiny purple">AS</div>
        <div class="bubble">That sounds practical. Let's test it this week.<small>9:52 AM</small></div>
      </div>
    </div>
    <form class="chat-compose" id="chat-form">
      <input id="chat-input" placeholder="Write a message to #needs-your-input..." autocomplete="off" required>
      <button class="btn primary" type="submit">Send ↗</button>
    </form>
  </div>`;
}

function render() {
  const views = { dashboard, calls: callsView, incoming, recent, calendar, pulse, channel };
  $("#page-content").innerHTML = (views[currentView] || dashboard)();
  $("#crumb-title").textContent = ({
    dashboard: "Dashboard",
    calls: "Calls to make",
    incoming: "Incoming",
    recent: "Recent",
    calendar: "Calendar",
    pulse: "Pulse",
    channel: "Pulse channel"
  })[currentView] || "Dashboard";

  $$(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.view === currentView || (currentView === "channel" && b.dataset.view === "pulse")));
  bindDynamic();
}

function bindDynamic() {
  const search = $("#lead-search");
  if (search) {
    search.addEventListener("input", () => {
      const q = search.value.toLowerCase();
      const rows = leads.filter(l => (l.name + l.product + l.phone).toLowerCase().includes(q));
      $("#lead-table").innerHTML = leadTable(rows.slice(0, 4), true);
    });
  }

  const filter = $("#call-filter");
  if (filter) {
    filter.addEventListener("change", () => {
      let rows = recentCalls.filter(c => filter.value === "All calls" || c.type === filter.value);
      $("#recent-rows").innerHTML = renderRecentRows(rows);
    });
  }

  const form = $("#chat-form");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      let input = $("#chat-input"), msg = input.value.trim();
      if (!msg) return;
      $("#chat-messages").insertAdjacentHTML("beforeend", `
        <div class="message own">
          <div class="avatar tiny purple">AS</div>
          <div class="bubble">${escapeHtml(msg)}<small>Just now</small></div>
        </div>`);
      input.value = "";
      toast("Message sent to channel.");
      const chatContainer = $("#chat-messages");
      chatContainer.scrollTop = chatContainer.scrollHeight;
    });
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Lead Details Modal
function showLead(name) {
  leadIndex = Math.max(0, leads.findIndex(l => l.name === name));
  if (leadIndex < 0) leadIndex = 0;
  renderLeadModal();
}

function renderLeadModal() {
  const l = leads[leadIndex];
  $("#modal-title").textContent = l.name;
  $("#modal-content").innerHTML = `
    ${person(l)}
    <div class="detail-grid" style="margin-top:17px">
      <div class="detail-box"><small>ICP score</small><strong>${l.score}/100</strong></div>
      <div class="detail-box"><small>Lead intent score</small><strong>${l.intent}/100</strong></div>
      <div class="detail-box"><small>Estimated value</small><strong>${l.value}</strong></div>
      <div class="detail-box"><small>Next call</small><strong style="font-size:14px">${l.time}</strong></div>
    </div>
    <details class="signal-list" open>
      <summary>Buying signals & Notes (${l.signals.length})</summary>
      <ul id="lead-signal-items">
        ${l.signals.map(s => `<li>${s}</li>`).join("")}
      </ul>
    </details>
    <div id="add-note-box" style="display:none;margin-bottom:12px;">
      <textarea id="new-note-text" class="in-call-notes" placeholder="Enter follow-up note (e.g., Requested quote for Sunday delivery)..."></textarea>
      <div style="display:flex;gap:6px;margin-top:6px;">
        <button class="btn primary" style="padding:6px 12px;font-size:10px;" id="save-note-btn">Save note</button>
        <button class="btn secondary" style="padding:6px 12px;font-size:10px;" id="cancel-note-btn">Cancel</button>
      </div>
    </div>
    <div class="row-actions" style="margin-top:10px;">
      <button class="btn primary" data-action="call" data-phone="${l.phone}" data-name="${l.name}">☎ Start In-Browser Call</button>
      <button class="btn secondary" id="btn-toggle-note">＋ Add note</button>
      <a href="tel:${l.phone}" class="btn secondary" style="text-decoration:none;font-size:11px;" title="External OS phone dialer">Launch tel: link</a>
    </div>`;
  $("#modal-backdrop").hidden = false;

  $("#btn-toggle-note").onclick = () => {
    $("#add-note-box").style.display = $("#add-note-box").style.display === "none" ? "block" : "none";
  };
  $("#cancel-note-btn").onclick = () => { $("#add-note-box").style.display = "none"; };
  $("#save-note-btn").onclick = () => {
    const val = $("#new-note-text").value.trim();
    if (val) {
      l.signals.push(val);
      toast("Note saved to lead.");
      renderLeadModal();
    }
  };
}

function closeModal() {
  $("#modal-backdrop").hidden = true;
}

// ----------------------------------------------------
// ACTUAL PHONE CALLING ENGINE (WINDOWS PHONE LINK / CELLULAR)
// ----------------------------------------------------
function openCallModal(phone, name, mode = "direct") {
  const l = leads.find(x => x.name === name) || { name, phone, value: "₹50,000", product: "Customer follow-up", initials: name.split(" ").map(s => s[0]).join(""), color: "purple" };
  callMode = mode;
  isMuted = false;
  callSeconds = 0;

  activeCall = {
    lead: l,
    name: l.name,
    phone: phone || l.phone,
    startTime: new Date()
  };

  $("#call-modal-backdrop").hidden = false;
  $("#call-modal-title").textContent = l.name;
  updateCallModalUI();
}

function formatDuration(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function startRealCall(targetPhone) {
  const cleanPhone = (targetPhone || activeCall.phone || "").replace(/\s+/g, "");
  if (!cleanPhone) {
    toast("Please enter a valid phone number.");
    return;
  }

  activeCall.phone = cleanPhone;
  const statusBadge = $("#call-live-badge");
  const statusText = $("#call-status-text");
  statusBadge.className = "call-badge-live";
  statusText.textContent = "Dialing on Phone Link...";
  toast("Launching Windows Phone Link for real call to " + cleanPhone);

  // Directly trigger OS / Windows Phone Link cellular call
  window.location.href = "tel:" + cleanPhone;

  // Start duration counter
  clearInterval(callTimerInterval);
  callSeconds = 0;
  callTimerInterval = setInterval(() => {
    callSeconds++;
    const timerEl = $("#live-call-timer");
    if (timerEl) {
      timerEl.textContent = formatDuration(callSeconds);
    }
  }, 1000);
}

function updateCallModalUI() {
  const l = activeCall.lead;
  $("#tab-direct-call").classList.toggle("active", callMode === "direct");
  $("#tab-ai-coach").classList.toggle("active", callMode === "coach");

  const body = $("#call-modal-body");
  if (callMode === "direct") {
    body.innerHTML = `
      <div class="call-hero" style="padding-top:6px;">
        <div class="call-avatar-center ${l.color || "purple"}">${l.initials || "C"}</div>
        <div class="call-timer-display" id="live-call-timer">00:00</div>
        <div class="call-customer-sub">Customer: <strong>${l.name}</strong> · Interested in ${l.product} (${l.value})</div>
      </div>

      <div style="background:#f9f9fc;border:1px solid var(--line);border-radius:10px;padding:12px;margin:12px 0;">
        <label style="display:block;font-size:11px;font-weight:700;color:#595d6d;margin-bottom:6px;">Recipient Phone Number (Editable for Live Demo):</label>
        <div style="display:flex;gap:8px;">
          <input type="tel" id="real-phone-input" class="search-input" style="flex:1;font-weight:700;font-size:14px;letter-spacing:0.5px;" value="${activeCall.phone}">
          <button class="btn secondary" id="btn-quick-own-number" style="padding:6px 10px;font-size:10px;" title="Set your own phone number to test">My Phone</button>
        </div>
        <div style="font-size:10px;color:#858998;margin-top:6px;">
          ℹ Clicking "Dial via Windows Phone Link" will command your paired phone to place a real outgoing cellular call.
        </div>
      </div>

      <button class="btn primary" id="btn-trigger-real-call" style="width:100%;padding:13px;font-size:12px;background:#208c67;border-color:#208c67;box-shadow:0 4px 12px #208c6735;">
        📞 Dial via Windows Phone Link (Real Call)
      </button>

      <div class="call-controls-row" style="margin:16px 0 10px;">
        <button class="round-call-btn" id="btn-call-dialpad" title="Keypad">⌨</button>
        <button class="round-call-btn btn-hangup" id="btn-call-hangup" title="End call">✆</button>
      </div>

      <div id="dialpad-container" style="display:none;margin-bottom:10px;">
        <div class="dialpad-grid">
          ${["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map(k => `<button class="dial-key" data-key="${k}">${k}</button>`).join("")}
        </div>
      </div>

      <textarea class="in-call-notes" id="active-call-notes" placeholder="In-call notes: write customer responses, quote given, or next callback date..."></textarea>
      
      <div style="margin-top:12px;font-size:10px;color:#858998;display:flex;justify-content:space-between;align-items:center;">
        <span>Real cellular carrier call via Windows Phone Link</span>
        <a href="tel:${activeCall.phone}" id="direct-tel-fallback" style="color:var(--purple);font-weight:600;text-decoration:none;">Re-trigger dialer ↗</a>
      </div>`;
  } else {
    // AI Roleplay & Pitch Coach
    body.innerHTML = `
      <div class="ai-coach-box">
        <div class="ai-coach-head">
          <strong>AvaniBot · AI Telecaller Roleplay</strong>
          <span class="ai-speaker-tag">AI Voice Active</span>
        </div>
        <div class="coach-transcript" id="ai-transcript">
          <div style="font-size:11px;color:#7e8293;font-style:italic;">[Roleplay active] AvaniBot simulates shopper objections based on real retail data.</div>
          <div style="margin-top:6px;background:#fff;border-radius:8px;padding:8px 10px;border:1px solid #ebe6ff;">
            <strong>${l.name} (AI Customer):</strong> "Hello Agent Sharma! I saw the ${l.product} yesterday at your store. Does it come with a warranty and home delivery?"
          </div>
        </div>

        <div class="coach-hint-card">
          <strong>💡 On-Ground Pitch Coach Tip:</strong> Mention the 10-year warranty, free doorstep delivery, and the 100-night trial to boost closing confidence (+23.6pp lift).
        </div>

        <div class="pitch-options">
          <button class="pitch-btn" data-reply="warranty">1. "Yes! It comes with a 10-year comprehensive warranty and free delivery this Friday."</button>
          <button class="pitch-btn" data-reply="emi">2. "We also have 0-cost EMI starting from ₹2,400/month if you book today."</button>
          <button class="pitch-btn" data-reply="trial">3. "You also get a 100-night trial with 100% money-back guarantee."</button>
        </div>
      </div>

      <div class="call-controls-row" style="margin:14px 0 0;">
        <button class="btn secondary" id="btn-replay-ai-speech">🔊 Hear Question Again</button>
        <button class="btn danger" id="btn-call-hangup">End Practice</button>
      </div>`;
  }

  // Bind controls
  const realCallBtn = $("#btn-trigger-real-call");
  if (realCallBtn) {
    realCallBtn.onclick = () => {
      const p = $("#real-phone-input") ? $("#real-phone-input").value : activeCall.phone;
      startRealCall(p);
    };
  }

  const ownNumberBtn = $("#btn-quick-own-number");
  if (ownNumberBtn) {
    ownNumberBtn.onclick = () => {
      const num = prompt("Enter your real mobile number to call (with +91):", "+91");
      if (num) {
        $("#real-phone-input").value = num;
        activeCall.phone = num;
        if ($("#direct-tel-fallback")) $("#direct-tel-fallback").href = "tel:" + num;
        toast("Updated number to " + num);
      }
    };
  }

  const dialpadBtn = $("#btn-call-dialpad");
  if (dialpadBtn) {
    dialpadBtn.onclick = () => {
      const dp = $("#dialpad-container");
      dp.style.display = dp.style.display === "none" ? "block" : "none";
    };
  }

  const hangupBtn = $("#btn-call-hangup");
  if (hangupBtn) {
    hangupBtn.onclick = endCall;
  }

  const dialKeys = $$(".dial-key");
  dialKeys.forEach(k => {
    k.onclick = () => {
      playTone(770, 1336);
      const input = $("#real-phone-input");
      if (input) input.value += k.dataset.key;
      toast("Key: " + k.dataset.key);
    };
  });

  const replayBtn = $("#btn-replay-ai-speech");
  if (replayBtn) {
    replayBtn.onclick = () => {
      speakText("Hello Agent Sharma! I saw the " + l.product + " yesterday at your store. Does it come with a warranty and home delivery?");
    };
  }

  const pitchBtns = $$(".pitch-btn");
  pitchBtns.forEach(pb => {
    pb.onclick = () => {
      const userText = pb.textContent.replace(/^[0-9]\.\s*/, "");
      const trans = $("#ai-transcript");
      trans.insertAdjacentHTML("beforeend", `
        <div style="margin-top:6px;background:var(--purple-soft);border-radius:8px;padding:8px 10px;color:var(--purple);font-weight:600;">
          <strong>You:</strong> "${userText}"
        </div>`);
      speakText(userText);
      setTimeout(() => {
        trans.insertAdjacentHTML("beforeend", `
          <div style="margin-top:6px;background:#fff;border-radius:8px;padding:8px 10px;border:1px solid #ebe6ff;">
            <strong>${l.name} (AI):</strong> "That sounds wonderful! Can you send me the payment link on WhatsApp?"
          </div>`);
        speakText("That sounds wonderful! Can you send me the payment link on WhatsApp?");
        trans.scrollTop = trans.scrollHeight;
      }, 1500);
    };
  });
}

function endCall() {
  if (!activeCall) return;
  clearInterval(callTimerInterval);

  const durationStr = formatDuration(callSeconds || 8);
  const callRecord = {
    name: activeCall.name,
    type: "Outgoing",
    time: "Just now",
    duration: durationStr,
    status: "Connected",
    phone: activeCall.phone,
    note: $("#active-call-notes") ? $("#active-call-notes").value : "Completed in-app customer conversation."
  };

  recentCalls.unshift(callRecord);
  completedCallsCount++;
  toast(`Call ended (${durationStr}). Logged to Recent Calls.`);

  activeCall = null;
  $("#call-modal-backdrop").hidden = true;
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  render();
}

function closeCallModal() {
  endCall();
}

// ----------------------------------------------------
// CALL REVIEW MODAL (PDF requirement: Tap a call to review it)
// ----------------------------------------------------
function openCallReview(customerName) {
  const call = recentCalls.find(c => c.name === customerName) || recentCalls[0];
  const l = leads.find(x => x.name === call.name) || leads[0];

  $("#review-modal-title").textContent = `Review: ${call.name}`;
  $("#review-modal-content").innerHTML = `
    ${person(l)}
    <div class="review-metric-grid">
      <div class="review-metric"><small>Type</small><strong style="display:block;font-size:13px;margin-top:4px;">${call.type}</strong></div>
      <div class="review-metric"><small>Duration</small><strong style="display:block;font-size:13px;margin-top:4px;">${call.duration}</strong></div>
      <div class="review-metric"><small>Status</small><strong style="display:block;font-size:13px;margin-top:4px;">${call.status}</strong></div>
    </div>

    <div class="audio-simulation-bar">
      <button class="audio-play-btn" id="btn-toggle-audio">▶</button>
      <div style="flex:1;">
        <div style="font-size:10px;margin-bottom:4px;display:flex;justify-content:space-between;">
          <span>call_recording_${call.name.toLowerCase().replace(" ", "_")}.mp3</span>
          <span id="audio-time">00:00 / ${call.duration === "—" ? "02:15" : call.duration}</span>
        </div>
        <div class="audio-track"><div class="audio-progress" id="audio-bar" style="width:0%;"></div></div>
      </div>
    </div>

    <div class="card" style="margin-top:14px;background:#fcfcff;">
      <strong>Call Notes & AI Summary:</strong>
      <p style="color:#575a68;margin:6px 0 0;line-height:1.6;">${call.note || "Customer showed high interest in the product warranty. Follow-up promised for this week."}</p>
    </div>

    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;">
      <button class="btn secondary" id="close-review-btn">Close</button>
      <button class="btn primary" data-action="call" data-phone="${call.phone}" data-name="${call.name}">☎ Call Back Again</button>
    </div>`;

  $("#review-modal-backdrop").hidden = false;

  let isPlaying = false, audioSec = 0, audioTimer = null;
  const playBtn = $("#btn-toggle-audio");
  const audioBar = $("#audio-bar");
  const timeDisplay = $("#audio-time");

  playBtn.onclick = () => {
    isPlaying = !isPlaying;
    playBtn.textContent = isPlaying ? "⏸" : "▶";
    if (isPlaying) {
      toast("Playing call recording audio preview...");
      audioTimer = setInterval(() => {
        audioSec++;
        audioBar.style.width = Math.min(100, audioSec * 8) + "%";
        timeDisplay.textContent = `00:${String(audioSec).padStart(2, "0")} / ${call.duration === "—" ? "02:15" : call.duration}`;
        if (audioSec >= 12) {
          clearInterval(audioTimer);
          isPlaying = false;
          playBtn.textContent = "▶";
        }
      }, 1000);
    } else {
      clearInterval(audioTimer);
    }
  };

  $("#close-review-btn").onclick = () => {
    clearInterval(audioTimer);
    $("#review-modal-backdrop").hidden = true;
  };
}

// ----------------------------------------------------
// EVENT LISTENERS & DELEGATION
// ----------------------------------------------------
document.addEventListener("click", e => {
  const b = e.target.closest("[data-action]");
  if (!b) return;
  const a = b.dataset.action;

  if (a === "navigate") {
    currentView = b.dataset.view || "dashboard";
    page = 1;
    $("#sidebar").classList.remove("open");
    render();
  } else if (a === "details") {
    showLead(b.dataset.name);
  } else if (a === "call") {
    openCallModal(b.dataset.phone, b.dataset.name || "Customer", "direct");
  } else if (a === "review-call") {
    openCallReview(b.dataset.name);
  } else if (a === "page") {
    page = Number(b.dataset.page);
    render();
  } else if (a === "filter-leads") {
    leadFilter = b.dataset.filter;
    page = 1;
    render();
  } else if (a === "toggle-expand") {
    expandedLeadName = expandedLeadName === b.dataset.name ? null : b.dataset.name;
    render();
  } else if (a === "cal-prev") {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    render();
  } else if (a === "cal-next") {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    render();
  } else if (a === "today") {
    calendarDate = new Date(2026, 9, 1);
    render();
  } else if (a === "input-yes") {
    toast("Your response: Yes, prioritise 15m SLA recorded.");
    const pinned = $("#pinned-decision-card");
    if (pinned) {
      pinned.innerHTML = `
        <span class="eyebrow" style="color:var(--green)">✓ DECISION RECORDED · 15-MINUTE SLA</span>
        <p><strong>You voted: Prioritise high-intent missed calls within 15 minutes.</strong><br>Logged for Mukunda & store leads. Response added to chat below.</p>`;
    }
    $("#chat-messages").insertAdjacentHTML("beforeend", `
      <div class="message own">
        <div class="avatar tiny purple">AS</div>
        <div class="bubble">✓ Voted YES on the 15-minute callback SLA. Let's make sure all high-intent leads get called back immediately.<small>Just now</small></div>
      </div>`);
  } else if (a === "input-discuss") {
    toast("Discussion item added to team huddle agenda.");
    $("#chat-messages").insertAdjacentHTML("beforeend", `
      <div class="message own">
        <div class="avatar tiny purple">AS</div>
        <div class="bubble">Let's discuss the 15-minute callback SLA in today's 11:00 AM huddle.<small>Just now</small></div>
      </div>`);
  } else if (a === "refresh") {
    toast("Sample missed-call list refreshed.");
    render();
  } else if (a === "export") {
    toast("Exporting call centre shift report (CSV / PDF)...");
  } else if (a === "new-task") {
    const title = prompt("Enter new follow-up task:", "Follow up with walk-out customer");
    if (title) toast(`Task "${title}" added to shift.`);
  } else if (a === "add-event") {
    toast("Calendar event composer: scheduled for Oct 19, 2026.");
  } else if (a === "new-message") {
    currentView = "channel";
    render();
  } else if (a === "new-channel") {
    const ch = prompt("Enter channel name (e.g. bed-deals):", "mattress-inquiries");
    if (ch) toast(`Channel #${ch} created.`);
  } else if (a === "kudos") {
    toast("Kudos sent to team member! 🎉");
  } else if (a === "open-channel") {
    currentView = "channel";
    render();
  }
});

// Sidebar navigation
$("#main-nav").addEventListener("click", e => {
  const b = e.target.closest("[data-view]");
  if (b) {
    currentView = b.dataset.view;
    page = 1;
    render();
  }
});

// Modal close handlers
$("#close-modal").addEventListener("click", closeModal);
$("#modal-backdrop").addEventListener("click", e => {
  if (e.target.id === "modal-backdrop") closeModal();
});

// Previous / Next Lead paging (PDF requirement)
$("#prev-lead").addEventListener("click", () => {
  leadIndex = (leadIndex - 1 + leads.length) % leads.length;
  renderLeadModal();
});
$("#next-lead").addEventListener("click", () => {
  leadIndex = (leadIndex + 1) % leads.length;
  renderLeadModal();
});

// Keyboard navigation (Escape to close, Left/Right arrows for leads)
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeModal();
    $("#call-modal-backdrop").hidden = true;
    $("#review-modal-backdrop").hidden = true;
    $("#playbook-modal-backdrop").hidden = true;
  } else if (!$("#modal-backdrop").hidden) {
    if (e.key === "ArrowLeft") {
      leadIndex = (leadIndex - 1 + leads.length) % leads.length;
      renderLeadModal();
    } else if (e.key === "ArrowRight") {
      leadIndex = (leadIndex + 1) % leads.length;
      renderLeadModal();
    }
  }
});

// Call modal tabs & close
$("#tab-direct-call").addEventListener("click", () => {
  callMode = "direct";
  updateCallModalUI();
});
$("#tab-ai-coach").addEventListener("click", () => {
  callMode = "coach";
  updateCallModalUI();
});
$("#close-call-modal").addEventListener("click", closeCallModal);
$("#close-review-modal").addEventListener("click", () => {
  $("#review-modal-backdrop").hidden = true;
});

// Playbook modal handlers
$("#help-btn").addEventListener("click", () => {
  $("#playbook-modal-backdrop").hidden = false;
});
$("#close-playbook-modal").addEventListener("click", () => {
  $("#playbook-modal-backdrop").hidden = true;
});
$("#playbook-modal-backdrop").addEventListener("click", e => {
  if (e.target.id === "playbook-modal-backdrop") $("#playbook-modal-backdrop").hidden = true;
});

// Header & mobile buttons
$("#mobile-menu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
$("#search-btn").addEventListener("click", () => {
  currentView = "calls";
  render();
  setTimeout(() => {
    const s = $("#lead-search");
    if (s) s.focus();
  }, 100);
});
$("#notifications-btn").addEventListener("click", () => {
  toast("You have 1 pending callback SLA notification.");
});

// Initial boot
render();

