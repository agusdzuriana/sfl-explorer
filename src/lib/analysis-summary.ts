import { tokenize, type Clause, type Project, type SystemId } from './projects-store';

export function coverage(clause: Clause, system: SystemId) {
  const covered = new Set<number>();
  clause.segments.filter(s => s.system === system).forEach(s => {
    for (let i = Math.max(s.start, clause.start); i <= Math.min(s.end, clause.end); i++) covered.add(i);
  });
  return { covered: covered.size, total: clause.end - clause.start + 1 };
}
export function projectSummary(project: Project) {
  return { words: tokenize(project.text).length, clauses: project.clauses.length, annotations: project.clauses.reduce((sum, c) => sum + c.segments.length, 0), assigned: project.clauses.reduce((sum, c) => sum + c.end - c.start + 1, 0) };
}
export function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function clauseCsv(project: Project, clause: Clause) {
  const words = tokenize(project.text);
  const q = (v: string) => `"${v.replaceAll('"', '""')}"`;
  return ['System,Words,Label', ...[...clause.segments].sort((a, b) => a.system.localeCompare(b.system) || a.start - b.start).map(s => [s.system, words.slice(s.start, s.end + 1).join(' '), s.label].map(q).join(','))].join('\n');
}
