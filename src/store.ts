import { useEffect, useState } from 'preact/hooks';
import type { State } from './lib';
import { seed } from './seed';

const KEY = 'lastro-demo-v1';

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as State;
  } catch {
    localStorage.removeItem(KEY); // corrupted demo data: start over from the seed
  }
  return seed();
}

export function useStore() {
  const [state, setState] = useState<State>(load);
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);
  return { state, setState, reset: () => setState(seed()) };
}
