import type { State } from './lib';

export const seed = (): State => ({
  clients: [
    { id: 'c1', name: 'Café Passarela', sector: 'Food & beverage', contact: 'Helena Prado', retainer: 4200, hoursIncluded: 60, health: 'good', since: '2024-03-01' },
    { id: 'c2', name: 'Orbita Fitness', sector: 'Gyms', contact: 'Rui Cavalcanti', retainer: 6800, hoursIncluded: 90, health: 'watch', since: '2023-09-12' },
    { id: 'c3', name: 'Vinhal & Filhos', sector: 'Wine retail', contact: 'Marta Vinhal', retainer: 3100, hoursIncluded: 40, health: 'good', since: '2025-02-20' },
    { id: 'c4', name: 'Clínica Meridiana', sector: 'Healthcare', contact: 'Dr. Otávio Lemos', retainer: 7500, hoursIncluded: 24, health: 'risk', since: '2022-06-01' },
    { id: 'c5', name: 'Brisa Imóveis', sector: 'Real estate', contact: 'Sônia Brandt', retainer: 5200, hoursIncluded: 70, health: 'watch', since: '2024-08-05' },
    { id: 'c6', name: 'Tinta Viva', sector: 'Home & decor', contact: 'Caio Mendes', retainer: 2600, hoursIncluded: 30, health: 'good', since: '2025-06-10' },
  ],
  campaigns: [
    { id: 'k1', clientId: 'c1', name: 'Winter menu launch', channel: 'Instagram + Meta Ads', status: 'live', budget: 8000, spent: 5150, due: '2026-12-05' },
    { id: 'k2', clientId: 'c2', name: 'January enrollment push', channel: 'Google Ads', status: 'production', budget: 15000, spent: 3200, due: '2026-12-28' },
    { id: 'k3', clientId: 'c3', name: 'Holiday gift boxes', channel: 'Email + Social', status: 'approval', budget: 5500, spent: 4100, due: '2026-11-20' },
    { id: 'k4', clientId: 'c4', name: 'Checkup season awareness', channel: 'Search + Display', status: 'approval', budget: 12000, spent: 9300, due: '2026-11-18' },
    { id: 'k5', clientId: 'c5', name: 'Riverside tower launch', channel: 'Meta Ads + Landing', status: 'briefing', budget: 20000, spent: 0, due: '2027-01-15' },
    { id: 'k6', clientId: 'c6', name: 'Spring palette recap', channel: 'Pinterest + Blog', status: 'done', budget: 3000, spent: 2860, due: '2026-10-30' },
    { id: 'k7', clientId: 'c2', name: 'Member referral loop', channel: 'Email + WhatsApp', status: 'live', budget: 4000, spent: 4380, due: '2026-11-30' },
    { id: 'k8', clientId: 'c1', name: 'Loyalty card relaunch', channel: 'Print + QR', status: 'briefing', budget: 2500, spent: 0, due: '2027-01-08' },
  ],
  approvals: [
    { id: 'a1', campaignId: 'k3', piece: 'Gift box hero banner', kind: 'Display', verdict: 'pending', note: '', sent: '2026-11-04' },
    { id: 'a2', campaignId: 'k3', piece: 'Launch email, 3 subject lines', kind: 'Email', verdict: 'approved', note: '', sent: '2026-11-03' },
    { id: 'a3', campaignId: 'k4', piece: 'Checkup search ads (12 variations)', kind: 'Search copy', verdict: 'pending', note: '', sent: '2026-11-05' },
    { id: 'a4', campaignId: 'k4', piece: 'Waiting room video, 30s', kind: 'Video', verdict: 'changes', note: 'Logo too small on the end card.', sent: '2026-11-02' },
    { id: 'a5', campaignId: 'k1', piece: 'Carousel, winter dishes', kind: 'Social', verdict: 'approved', note: '', sent: '2026-10-28' },
    { id: 'a6', campaignId: 'k2', piece: 'Landing page wireframe', kind: 'Web', verdict: 'pending', note: '', sent: '2026-11-06' },
  ],
  entries: [
    { id: 'e1', clientId: 'c1', campaignId: 'k1', person: 'Bia Tavares', date: '2026-11-02', hours: 5.5, task: 'Carousel layouts', billable: true },
    { id: 'e2', clientId: 'c2', campaignId: 'k2', person: 'Léo Santana', date: '2026-11-02', hours: 7, task: 'Keyword research', billable: true },
    { id: 'e3', clientId: 'c4', campaignId: 'k4', person: 'Nina Aguiar', date: '2026-11-03', hours: 8, task: 'Ad copy rounds', billable: true },
    { id: 'e4', clientId: 'c4', campaignId: 'k4', person: 'Léo Santana', date: '2026-11-04', hours: 9.5, task: 'Video re-edit', billable: true },
    { id: 'e5', clientId: 'c3', campaignId: 'k3', person: 'Bia Tavares', date: '2026-11-04', hours: 6, task: 'Email build + QA', billable: true },
    { id: 'e6', clientId: 'c5', campaignId: 'k5', person: 'Nina Aguiar', date: '2026-11-05', hours: 4, task: 'Kickoff and briefing', billable: false },
    { id: 'e7', clientId: 'c2', campaignId: 'k7', person: 'Bia Tavares', date: '2026-11-05', hours: 6.5, task: 'Referral flow copy', billable: true },
    { id: 'e8', clientId: 'c4', campaignId: 'k4', person: 'Nina Aguiar', date: '2026-11-06', hours: 10, task: 'Landing tweaks', billable: true },
    { id: 'e9', clientId: 'c1', campaignId: 'k1', person: 'Léo Santana', date: '2026-11-06', hours: 3, task: 'Ad budget pacing', billable: true },
    { id: 'e10', clientId: 'c6', campaignId: 'k6', person: 'Bia Tavares', date: '2026-10-29', hours: 5, task: 'Recap post', billable: true },
    { id: 'e11', clientId: 'c2', campaignId: 'k2', person: 'Nina Aguiar', date: '2026-11-06', hours: 12, task: 'Funnel mapping', billable: true },
    { id: 'e12', clientId: 'c5', campaignId: 'k5', person: 'Léo Santana', date: '2026-11-06', hours: 8, task: 'Tower naming workshop', billable: true },
  ],
});
