export type Status = 'briefing' | 'production' | 'approval' | 'live' | 'done';
export type Verdict = 'pending' | 'approved' | 'changes';
export type Health = 'good' | 'watch' | 'risk';

export interface Client { id: string; name: string; sector: string; contact: string; retainer: number; hoursIncluded: number; health: Health; since: string }
export interface Campaign { id: string; clientId: string; name: string; channel: string; status: Status; budget: number; spent: number; due: string }
export interface Approval { id: string; campaignId: string; piece: string; kind: string; verdict: Verdict; note: string; sent: string }
export interface Entry { id: string; clientId: string; campaignId: string; person: string; date: string; hours: number; task: string; billable: boolean }
export interface State { clients: Client[]; campaigns: Campaign[]; approvals: Approval[]; entries: Entry[] }

export const STATUSES: { key: Status; label: string }[] = [
  { key: 'briefing', label: 'Briefing' },
  { key: 'production', label: 'In production' },
  { key: 'approval', label: 'In approval' },
  { key: 'live', label: 'Live' },
  { key: 'done', label: 'Wrapped' },
];

export const uid = () => Math.random().toString(36).slice(2, 9);

export const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function hoursByClient(s: State, month: string) {
  return s.clients
    .map((c) => {
      const es = s.entries.filter((e) => e.clientId === c.id && e.date.startsWith(month));
      const total = es.reduce((a, e) => a + e.hours, 0);
      const billable = es.filter((e) => e.billable).reduce((a, e) => a + e.hours, 0);
      return {
        client: c,
        total,
        billable,
        over: Math.max(0, total - c.hoursIncluded),
        pct: c.hoursIncluded ? total / c.hoursIncluded : 0,
      };
    })
    .sort((a, b) => b.pct - a.pct);
}

export function budgetPct(c: Campaign) {
  return c.budget ? c.spent / c.budget : 0;
}

export function moveCampaign(s: State, id: string, to: Status): State {
  return { ...s, campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, status: to } : c)) };
}

/** Approving the last pending piece takes the campaign live; requesting changes sends it back to production. */
export function decide(s: State, id: string, verdict: Verdict, note = ''): State {
  const approvals = s.approvals.map((a) => (a.id === id ? { ...a, verdict, note: note || a.note } : a));
  const target = approvals.find((a) => a.id === id);
  let campaigns = s.campaigns;
  if (target && verdict === 'approved') {
    const all = approvals.filter((a) => a.campaignId === target.campaignId);
    if (all.every((a) => a.verdict === 'approved')) {
      campaigns = campaigns.map((c) => (c.id === target.campaignId && c.status === 'approval' ? { ...c, status: 'live' } : c));
    }
  }
  if (target && verdict === 'changes') {
    campaigns = campaigns.map((c) => (c.id === target.campaignId && c.status === 'approval' ? { ...c, status: 'production' } : c));
  }
  return { ...s, approvals, campaigns };
}

export function addEntry(s: State, e: Omit<Entry, 'id'>): State {
  if (!(e.hours > 0) || e.hours > 24) throw new Error('Hours must be between 0 and 24');
  if (!e.clientId || !e.task.trim()) throw new Error('Client and task are required');
  return { ...s, entries: [{ ...e, id: uid() }, ...s.entries] };
}

export function addClient(s: State, c: Omit<Client, 'id'>): State {
  if (!c.name.trim()) throw new Error('Name is required');
  return { ...s, clients: [...s.clients, { ...c, id: uid() }] };
}

export const pendingApprovals = (s: State) => s.approvals.filter((a) => a.verdict === 'pending');
export const mrr = (s: State) => s.clients.reduce((a, c) => a + c.retainer, 0);
