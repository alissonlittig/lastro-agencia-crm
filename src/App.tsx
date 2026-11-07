import { useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import {
  STATUSES, addClient, addEntry, budgetPct, decide, hoursByClient, money, moveCampaign, mrr, pendingApprovals,
  type Campaign, type Health, type State, type Status,
} from './lib';
import { useStore } from './store';

const MONTH = '2026-11';
const MONTH_LABEL = 'November 2026';
const VIEWS = [
  { key: 'overview', label: 'Overview', d: 'M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6V11h-6v9Zm0-16v5h6V4h-6Z' },
  { key: 'clients', label: 'Clients', d: 'M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2c-2.3 0-7 1.2-7 3.5V19h14v-2.5C15 14.2 10.3 13 8 13Zm8 0c-.3 0-.6 0-1 .1 1.2.8 2 1.9 2 3.4V19h6v-2.5c0-2.3-4.700-3.500-7-3.500Z' },
  { key: 'campaigns', label: 'Campaigns', d: 'M3 10v4h3l5 4V6L6 10H3Zm13.500 2a4.500 4.500 0 0 0-2.500-4v8a4.500 4.500 0 0 0 2.500-4Z' },
  { key: 'approvals', label: 'Approvals', d: 'm9 16.200-3.500-3.500L4 14.100l5 5 11-11-1.400-1.400L9 16.200Z' },
  { key: 'hours', label: 'Hours', d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm.5 5H11v6l5.200 3.100.8-1.300-4.500-2.700V7Z' },
] as const;
type View = (typeof VIEWS)[number]['key'];

const HEALTH: Record<Health, string> = { good: 'On track', watch: 'Watch', risk: 'At risk' };
const fmtDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const h = (n: number) => `${Math.round(n * 10) / 10}h`;

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor" fill-rule="evenodd">
      <path d={d} />
    </svg>
  );
}

function Card({ title, children, aside }: { title: string; children: ComponentChildren; aside?: ComponentChildren }) {
  return (
    <section class="card">
      <header class="card-h">
        <h2>{title}</h2>
        {aside}
      </header>
      {children}
    </section>
  );
}

function Bar({ pct, tone }: { pct: number; tone?: string }) {
  const over = pct > 1;
  return (
    <div class="bar" role="img" aria-label={`${Math.round(pct * 100)} percent`}>
      <i class={tone ?? (over ? 'over' : pct > 0.85 ? 'warn' : '')} style={{ width: `${Math.min(100, pct * 100)}%` }} />
    </div>
  );
}

export function App() {
  const { state, setState, reset } = useStore();
  const [view, setView] = useState<View>('overview');
  const clientName = (id: string) => state.clients.find((c) => c.id === id)?.name ?? '—';
  const pending = pendingApprovals(state).length;

  return (
    <div class="shell">
      <aside class="side">
        <div class="brand">
          <span class="logo" aria-hidden="true"><svg viewBox="0 0 32 32" width="22" height="22"><path d="M9 22h14M9 16h10M9 10h6" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none" /></svg></span>
          <span>Lastro</span>
        </div>
        <nav aria-label="Main">
          {VIEWS.map((v) => (
            <button key={v.key} class={view === v.key ? 'on' : ''} aria-current={view === v.key ? 'page' : undefined} onClick={() => setView(v.key)}>
              <Icon d={v.d} />
              <span>{v.label}</span>
              {v.key === 'approvals' && pending > 0 && <b class="pill">{pending}</b>}
            </button>
          ))}
        </nav>
        <div class="demo">
          <p><strong>Demo data.</strong> Every client, name and number here is fictional and saved only in your browser.</p>
          <button class="ghost" onClick={reset}>Reset demo data</button>
        </div>
      </aside>
      <main>
        <div class="topbar">
          <div>
            <p class="eyebrow">{MONTH_LABEL}</p>
            <h1>{VIEWS.find((v) => v.key === view)!.label}</h1>
          </div>
          <span class="tag">Fictional data</span>
        </div>
        {view === 'overview' && <Overview state={state} clientName={clientName} go={setView} />}
        {view === 'clients' && <Clients state={state} setState={setState} />}
        {view === 'campaigns' && <Campaigns state={state} setState={setState} clientName={clientName} />}
        {view === 'approvals' && <Approvals state={state} setState={setState} clientName={clientName} />}
        {view === 'hours' && <Hours state={state} setState={setState} clientName={clientName} />}
      </main>
    </div>
  );
}

type P = { state: State; clientName: (id: string) => string };
type PS = P & { setState: (s: State) => void };

function Overview({ state, clientName, go }: P & { go: (v: View) => void }) {
  const hrs = hoursByClient(state, MONTH);
  const totalH = hrs.reduce((a, r) => a + r.total, 0);
  const active = state.campaigns.filter((c) => c.status !== 'done');
  const pend = pendingApprovals(state);
  const overs = hrs.filter((r) => r.over > 0);
  return (
    <>
      <div class="kpis">
        <div class="kpi"><span>Monthly retainers</span><strong>{money(mrr(state))}</strong><small>{state.clients.length} active clients</small></div>
        <div class="kpi"><span>Open campaigns</span><strong>{active.length}</strong><small>{state.campaigns.filter((c) => c.status === 'live').length} live now</small></div>
        <div class="kpi hot"><span>Waiting for approval</span><strong>{pend.length}</strong><small>pieces with clients</small></div>
        <div class="kpi"><span>Hours logged</span><strong>{h(totalH)}</strong><small>{overs.length} client{overs.length === 1 ? '' : 's'} over scope</small></div>
      </div>
      <div class="grid2">
        <Card title="Hours against retainer" aside={<button class="link" onClick={() => go('hours')}>Open timesheet</button>}>
          <ul class="rows">
            {hrs.map((r) => (
              <li key={r.client.id}>
                <div class="row-top"><span>{r.client.name}</span><span class={r.over ? 'neg' : 'muted'}>{h(r.total)} of {r.client.hoursIncluded}h</span></div>
                <Bar pct={r.pct} />
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Needs a decision" aside={<button class="link" onClick={() => go('approvals')}>All approvals</button>}>
          {pend.length === 0 ? <p class="empty">Nothing waiting. Nice.</p> : (
            <ul class="list">
              {pend.map((a) => {
                const k = state.campaigns.find((c) => c.id === a.campaignId)!;
                return (
                  <li key={a.id}>
                    <div><strong>{a.piece}</strong><small>{clientName(k.clientId)} · sent {fmtDate(a.sent)}</small></div>
                    <span class="kind">{a.kind}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
      <Card title="Campaign budgets" aside={<button class="link" onClick={() => go('campaigns')}>Board</button>}>
        <div class="tablewrap">
          <table>
            <thead><tr><th>Campaign</th><th>Client</th><th>Due</th><th class="num">Spent</th><th>Budget used</th></tr></thead>
            <tbody>
              {active.map((c) => (
                <tr key={c.id}>
                  <td data-l="Campaign"><strong>{c.name}</strong></td>
                  <td data-l="Client">{clientName(c.clientId)}</td>
                  <td data-l="Due">{fmtDate(c.due)}</td>
                  <td data-l="Spent" class="num">{money(c.spent)} / {money(c.budget)}</td>
                  <td data-l="Used" class="bcell"><Bar pct={budgetPct(c)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function Clients({ state, setState }: Pick<PS, 'state' | 'setState'>) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState('');
  const list = state.clients.filter((c) => (c.name + c.sector + c.contact).toLowerCase().includes(q.toLowerCase()));
  const sel = state.clients.find((c) => c.id === open);

  function submit(e: Event) {
    e.preventDefault();
    const f = new FormData(e.target as HTMLFormElement);
    try {
      setState(addClient(state, {
        name: String(f.get('name')), sector: String(f.get('sector')), contact: String(f.get('contact')),
        retainer: Number(f.get('retainer')) || 0, hoursIncluded: Number(f.get('hours')) || 0, health: 'good', since: '2026-11-07',
      }));
      setAdding(false); setErr('');
    } catch (x) { setErr((x as Error).message); }
  }

  return (
    <>
      <div class="toolbar">
        <label class="search"><span class="sr">Search clients</span><input type="search" placeholder="Search clients, sectors, contacts" value={q} onInput={(e) => setQ((e.target as HTMLInputElement).value)} /></label>
        <button class="primary" onClick={() => setAdding(!adding)}>{adding ? 'Close' : 'New client'}</button>
      </div>
      {adding && (
        <form class="card form" onSubmit={submit}>
          <label>Name<input name="name" required /></label>
          <label>Sector<input name="sector" /></label>
          <label>Main contact<input name="contact" /></label>
          <label>Monthly retainer (USD)<input name="retainer" type="number" min="0" inputMode="numeric" /></label>
          <label>Hours included<input name="hours" type="number" min="0" inputMode="numeric" /></label>
          <div class="form-a"><button class="primary" type="submit">Save client</button>{err && <span class="neg" role="alert">{err}</span>}</div>
        </form>
      )}
      <div class="split">
        <div class="cards">
          {list.length === 0 && <p class="empty">No client matches “{q}”.</p>}
          {list.map((c) => (
            <button key={c.id} class={`client ${open === c.id ? 'sel' : ''}`} onClick={() => setOpen(c.id)}>
              <span class="avatar" aria-hidden="true">{c.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>
              <span class="cmain"><strong>{c.name}</strong><small>{c.sector} · {c.contact}</small></span>
              <span class="cright"><strong>{money(c.retainer)}</strong><span class={`health ${c.health}`}>{HEALTH[c.health]}</span></span>
            </button>
          ))}
        </div>
        <aside class="detail" aria-live="polite">
          {!sel ? <p class="empty">Select a client to see campaigns, hours and approvals.</p> : <ClientDetail state={state} c={sel} setState={setState} />}
        </aside>
      </div>
    </>
  );
}

function ClientDetail({ state, c, setState }: { state: State; c: State['clients'][number]; setState: (s: State) => void }) {
  const camps = state.campaigns.filter((k) => k.clientId === c.id);
  const r = hoursByClient(state, MONTH).find((x) => x.client.id === c.id)!;
  const pend = state.approvals.filter((a) => a.verdict === 'pending' && camps.some((k) => k.id === a.campaignId));
  const setHealth = (health: Health) => setState({ ...state, clients: state.clients.map((x) => (x.id === c.id ? { ...x, health } : x)) });
  return (
    <div>
      <h3>{c.name}</h3>
      <p class="muted">{c.sector} · client since {new Date(c.since + 'T12:00:00').getFullYear()}</p>
      <dl class="facts">
        <div><dt>Contact</dt><dd>{c.contact}</dd></div>
        <div><dt>Retainer</dt><dd>{money(c.retainer)}/mo</dd></div>
        <div><dt>Hours this month</dt><dd class={r.over ? 'neg' : ''}>{h(r.total)} of {c.hoursIncluded}h</dd></div>
        <div><dt>Pending approvals</dt><dd>{pend.length}</dd></div>
      </dl>
      <Bar pct={r.pct} />
      <fieldset class="seg"><legend>Account health</legend>
        {(['good', 'watch', 'risk'] as Health[]).map((x) => (
          <button key={x} class={c.health === x ? `on ${x}` : ''} aria-pressed={c.health === x} onClick={() => setHealth(x)}>{HEALTH[x]}</button>
        ))}
      </fieldset>
      <h4>Campaigns</h4>
      <ul class="list">
        {camps.map((k) => (<li key={k.id}><div><strong>{k.name}</strong><small>{k.channel}</small></div><span class="kind">{STATUSES.find((s) => s.key === k.status)!.label}</span></li>))}
      </ul>
    </div>
  );
}

function Campaigns({ state, setState, clientName }: PS) {
  const move = (c: Campaign, dir: -1 | 1) => {
    const i = STATUSES.findIndex((s) => s.key === c.status) + dir;
    if (i >= 0 && i < STATUSES.length) setState(moveCampaign(state, c.id, STATUSES[i].key as Status));
  };
  return (
    <div class="board">
      {STATUSES.map((col, ci) => {
        const items = state.campaigns.filter((c) => c.status === col.key);
        return (
          <section class="col" key={col.key} aria-label={col.label}>
            <header><h2>{col.label}</h2><span class="count">{items.length}</span></header>
            {items.map((c) => (
              <article class="kcard" key={c.id}>
                <small class="muted">{clientName(c.clientId)}</small>
                <strong>{c.name}</strong>
                <span class="chan">{c.channel}</span>
                <div class="kmeta"><span>{money(c.spent)} of {money(c.budget)}</span><span>Due {fmtDate(c.due)}</span></div>
                <Bar pct={budgetPct(c)} />
                {budgetPct(c) > 1 && <small class="neg">Over budget by {money(c.spent - c.budget)}</small>}
                <div class="kact">
                  <button class="ghost sm" disabled={ci === 0} onClick={() => move(c, -1)} aria-label={`Move ${c.name} back`}>← Back</button>
                  <button class="ghost sm" disabled={ci === STATUSES.length - 1} onClick={() => move(c, 1)} aria-label={`Move ${c.name} forward`}>Next →</button>
                </div>
              </article>
            ))}
            {items.length === 0 && <p class="empty sm">Empty</p>}
          </section>
        );
      })}
    </div>
  );
}

function Approvals({ state, setState, clientName }: PS) {
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const list = state.approvals.filter((a) => filter === 'all' || a.verdict === 'pending');
  const LABEL = { pending: 'Pending', approved: 'Approved', changes: 'Changes requested' } as const;
  return (
    <>
      <div class="toolbar">
        <fieldset class="seg"><legend class="sr">Filter</legend>
          <button class={filter === 'pending' ? 'on' : ''} aria-pressed={filter === 'pending'} onClick={() => setFilter('pending')}>Pending</button>
          <button class={filter === 'all' ? 'on' : ''} aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>All pieces</button>
        </fieldset>
      </div>
      {list.length === 0 && <p class="empty">All caught up.</p>}
      <div class="stack">
        {list.map((a) => {
          const k = state.campaigns.find((c) => c.id === a.campaignId)!;
          return (
            <article class="card appr" key={a.id}>
              <div class="appr-h">
                <div><strong>{a.piece}</strong><small>{clientName(k.clientId)} · {k.name} · sent {fmtDate(a.sent)}</small></div>
                <span class={`verdict ${a.verdict}`}>{LABEL[a.verdict]}</span>
              </div>
              {a.note && <p class="note">“{a.note}”</p>}
              {a.verdict === 'pending' && (
                <div class="appr-a">
                  <label class="grow"><span class="sr">Note for {a.piece}</span><input placeholder="Add a note (optional)" value={notes[a.id] ?? ''} onInput={(e) => setNotes({ ...notes, [a.id]: (e.target as HTMLInputElement).value })} /></label>
                  <button class="ghost" onClick={() => setState(decide(state, a.id, 'changes', notes[a.id] || 'Changes requested.'))}>Request changes</button>
                  <button class="primary" onClick={() => setState(decide(state, a.id, 'approved', notes[a.id]))}>Approve</button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}

function Hours({ state, setState, clientName }: PS) {
  const [client, setClient] = useState('all');
  const [err, setErr] = useState('');
  const hrs = hoursByClient(state, MONTH);
  const rows = state.entries.filter((e) => client === 'all' || e.clientId === client).sort((a, b) => b.date.localeCompare(a.date));
  const people = [...new Set(state.entries.map((e) => e.person))];

  function submit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const f = new FormData(form);
    const clientId = String(f.get('client'));
    try {
      setState(addEntry(state, {
        clientId, campaignId: String(f.get('campaign') || ''), person: String(f.get('person')), date: String(f.get('date')),
        hours: Number(f.get('hours')), task: String(f.get('task')), billable: f.get('billable') === 'on',
      }));
      form.reset(); setErr('');
    } catch (x) { setErr((x as Error).message); }
  }

  return (
    <>
      <div class="chips">
        {hrs.map((r) => (
          <div key={r.client.id} class="chip"><span>{r.client.name}</span><strong class={r.over ? 'neg' : ''}>{h(r.total)}</strong><small>{r.over ? `${h(r.over)} over` : `${h(r.client.hoursIncluded - r.total)} left`}</small></div>
        ))}
      </div>
      <form class="card form" onSubmit={submit}>
        <h2 class="full">Log time</h2>
        <label>Client<select name="client" required>{state.clients.map((c) => <option value={c.id}>{c.name}</option>)}</select></label>
        <label>Campaign<select name="campaign"><option value="">No campaign</option>{state.campaigns.map((c) => <option value={c.id}>{c.name}</option>)}</select></label>
        <label>Person<select name="person">{people.map((p) => <option>{p}</option>)}</select></label>
        <label>Date<input name="date" type="date" required value="2026-11-07" /></label>
        <label>Hours<input name="hours" type="number" step="0.25" min="0.25" max="24" inputMode="decimal" required /></label>
        <label class="grow2">What did you do?<input name="task" required /></label>
        <label class="check"><input name="billable" type="checkbox" checked /> Billable</label>
        <div class="form-a"><button class="primary" type="submit">Add entry</button>{err && <span class="neg" role="alert">{err}</span>}</div>
      </form>
      <Card title="Entries" aside={
        <label class="inline"><span class="sr">Filter by client</span>
          <select value={client} onChange={(e) => setClient((e.target as HTMLSelectElement).value)}>
            <option value="all">All clients</option>{state.clients.map((c) => <option value={c.id}>{c.name}</option>)}
          </select></label>}>
        <div class="tablewrap">
          <table>
            <thead><tr><th>Date</th><th>Client</th><th>Task</th><th>Person</th><th class="num">Hours</th></tr></thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id}>
                  <td data-l="Date">{fmtDate(e.date)}</td>
                  <td data-l="Client">{clientName(e.clientId)}</td>
                  <td data-l="Task">{e.task}{!e.billable && <span class="kind">Non-billable</span>}</td>
                  <td data-l="Person">{e.person}</td>
                  <td data-l="Hours" class="num">{h(e.hours)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
