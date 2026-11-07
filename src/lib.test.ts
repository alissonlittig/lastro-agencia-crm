import { describe, expect, it } from 'vitest';
import { addClient, addEntry, decide, hoursByClient, mrr, type State } from './lib';

const base = (): State => ({
  clients: [{ id: 'c1', name: 'A', sector: 's', contact: 'x', retainer: 1000, hoursIncluded: 10, health: 'good', since: '2025-01-01' }],
  campaigns: [{ id: 'k1', clientId: 'c1', name: 'K', channel: 'Social', status: 'approval', budget: 100, spent: 50, due: '2026-12-01' }],
  approvals: [
    { id: 'a1', campaignId: 'k1', piece: 'P1', kind: 'Post', verdict: 'pending', note: '', sent: '2026-11-01' },
    { id: 'a2', campaignId: 'k1', piece: 'P2', kind: 'Post', verdict: 'approved', note: '', sent: '2026-11-01' },
  ],
  entries: [],
});
const entry = { clientId: 'c1', campaignId: 'k1', person: 'P', date: '2026-11-02', hours: 12, task: 't', billable: true };

describe('lastro', () => {
  it('goes live only when every piece is approved', () => {
    expect(decide(base(), 'a1', 'approved').campaigns[0].status).toBe('live');
  });
  it('sends the campaign back to production on requested changes', () => {
    const s = decide(base(), 'a1', 'changes', 'logo');
    expect(s.campaigns[0].status).toBe('production');
    expect(s.approvals[0].note).toBe('logo');
  });
  it('tracks hours against the retainer, per month', () => {
    let s = addEntry(base(), entry);
    s = addEntry(s, { ...entry, date: '2026-10-02', hours: 5 });
    const r = hoursByClient(s, '2026-11')[0];
    expect(r.total).toBe(12);
    expect(r.over).toBe(2);
  });
  it('validates input', () => {
    expect(() => addEntry(base(), { ...entry, hours: 0 })).toThrow();
    expect(() => addEntry(base(), { ...entry, hours: 30 })).toThrow();
    expect(() => addClient(base(), { name: ' ', sector: '', contact: '', retainer: 0, hoursIncluded: 0, health: 'good', since: '' })).toThrow();
  });
  it('sums retainers', () => expect(mrr(base())).toBe(1000));
});
