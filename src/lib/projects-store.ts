import { useSyncExternalStore } from 'react';

export type SystemId = 'transitivity' | 'mood' | 'theme';
export type Segment = { id: string; system: SystemId; start: number; end: number; label: string };
export type Clause = { id: string; start: number; end: number; segments: Segment[] };
export type Project = { id: string; name: string; text: string; createdAt: number; clauses: Clause[] };

const KEY = 'sfl-studio-projects';
const listeners = new Set<() => void>();
let cacheRaw: string | null = null;
let cache: Project[] = [];

export const uid = () => Math.random().toString(36).slice(2, 10);
export const tokenize = (text: string) => text.split(/\s+/).filter(Boolean);

function read(): Project[] {
  const raw = localStorage.getItem(KEY) ?? '[]';
  if (raw !== cacheRaw) { cacheRaw = raw; try { cache = JSON.parse(raw); } catch { cache = []; } }
  return cache;
}
function write(projects: Project[]) { localStorage.setItem(KEY, JSON.stringify(projects)); listeners.forEach(l => l()); }
function subscribe(l: () => void) { listeners.add(l); window.addEventListener('storage', l); return () => { listeners.delete(l); window.removeEventListener('storage', l); }; }

/** Returns null during server render / before hydration. */
export function useProjects(): Project[] | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function createProject(name: string): Project {
  const p: Project = { id: uid(), name, text: '', createdAt: Date.now(), clauses: [] };
  write([p, ...read()]); return p;
}
export function deleteProject(id: string) { write(read().filter(p => p.id !== id)); }
export function updateProject(id: string, fn: (p: Project) => Project) { write(read().map(p => (p.id === id ? fn(p) : p))); }

/** Clauses may not overlap; returns false when the range collides with an existing clause. */
export function canAddClause(clauses: Clause[], start: number, end: number) {
  return clauses.every(c => end < c.start || start > c.end);
}
