import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/app-header';
import { systems } from '@/lib/systems';
import { tokenize, uid, updateProject, useProjects, type SystemId } from '@/lib/projects-store';

export const Route = createFileRoute('/projects/$projectId/clauses/$clauseId')({
  head: () => ({ meta: [
    { title: 'Clause analysis — SFL Studio' },
    { name: 'description', content: 'Analyse a clause through Transitivity, Mood, and Theme.' },
    { property: 'og:title', content: 'Clause analysis — SFL Studio' },
    { property: 'og:description', content: 'Analyse a clause through Transitivity, Mood, and Theme.' },
    { property: 'og:type', content: 'article' }, { name: 'twitter:card', content: 'summary' },
  ] }),
  component: ClausePage,
});

function ClausePage() {
  const { projectId, clauseId } = Route.useParams();
  const projects = useProjects();
  const [sysId, setSysId] = useState<SystemId>('transitivity');
  const [first, setFirst] = useState<number | null>(null);
  const [range, setRange] = useState<[number, number] | null>(null);
  const system = systems.find(s => s.id === sysId) ?? systems[0];
  const [label, setLabel] = useState<string>(system.labels[0]);
  const project = projects?.find(p => p.id === projectId);
  const clause = project?.clauses.find(c => c.id === clauseId);
  if (projects === null) return <main className="app-page"><AppHeader /></main>;
  if (!project || !clause) return <main className="app-page"><AppHeader /><div className="app-body"><p className="empty-state">Clause not found. <Link to="/projects">Back to projects</Link></p></div></main>;

  const words = tokenize(project.text);
  const idx = Array.from({ length: clause.end - clause.start + 1 }, (_, k) => clause.start + k);
  const segs = clause.segments.filter(s => s.system === sysId).sort((a, b) => a.start - b.start);
  const clauseNo = [...project.clauses].sort((a, b) => a.start - b.start).findIndex(c => c.id === clause.id) + 1;
  const segOf = (i: number) => segs.find(s => i >= s.start && i <= s.end);

  function switchSystem(id: SystemId) { setSysId(id); setFirst(null); setRange(null); setLabel(systems.find(s => s.id === id)!.labels[0]); }
  function clickWord(i: number) {
    if (first === null) { setFirst(i); setRange([i, i]); return; }
    setRange([Math.min(first, i), Math.max(first, i)]); setFirst(null);
  }
  function add() {
    if (!range) return;
    updateProject(project!.id, p => ({ ...p, clauses: p.clauses.map(c => c.id !== clause!.id ? c : { ...c, segments: [...c.segments, { id: uid(), system: sysId, start: range[0], end: range[1], label }] }) }));
    setRange(null); setFirst(null);
  }
  function remove(id: string) { updateProject(project!.id, p => ({ ...p, clauses: p.clauses.map(c => c.id !== clause!.id ? c : { ...c, segments: c.segments.filter(s => s.id !== id) }) })); }
  function exportCsv() {
    const q = (v: string) => `"${v.replaceAll('"', '""')}"`;
    const rows = [...clause!.segments].sort((a, b) => a.system.localeCompare(b.system) || a.start - b.start).map(s => [s.system, words.slice(s.start, s.end + 1).join(' '), s.label].map(q).join(','));
    const url = URL.createObjectURL(new Blob([['System,Words,Label', ...rows].join('\n')], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `${project!.name}-clause-${clauseNo}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  return <main className="app-page">
    <AppHeader crumbs={[{ label: project.name, to: <Link to="/projects/$projectId" params={{ projectId: project.id }}>{project.name}</Link> }, { label: `Clause ${clauseNo}` }]} />
    <div className="app-body">
      <span className="eyebrow">Clause {clauseNo}</span>
      <h1 className="page-title clause-title">{idx.map(i => words[i]).join(' ')}</h1>

      <div className="system-tabs" role="tablist">{systems.map(s => <button key={s.id} role="tab" aria-selected={s.id === sysId} className={`system-tab ${s.id === sysId ? 'active' : ''}`} onClick={() => switchSystem(s.id)}><span className={`system-dot ${s.id}`} />{s.name}</button>)}</div>

      <section className="panel">
        <p className="hint">{first !== null ? 'Click the last word of the constituent.' : 'Click the first word of a constituent, then its last word, and choose a function.'}</p>
        <div className="word-flow">{idx.map(i => { const s = segOf(i); const sel = range && i >= range[0] && i <= range[1]; return <button key={i} type="button" onClick={() => clickWord(i)} className={`word ${s ? `seg ${sysId}` : ''} ${sel ? 'word-first' : ''}`} title={s?.label}>{words[i]}</button>; })}</div>
        {range && <div className="annotation-form"><div><span className="field-label">Selected</span><strong>{words.slice(range[0], range[1] + 1).join(' ')}</strong></div><div><label htmlFor="label" className="field-label">Function ({system.name})</label><select id="label" value={label} onChange={e => setLabel(e.target.value)}>{system.labels.map(l => <option key={l}>{l}</option>)}</select></div><Button variant="console" onClick={add}>Add</Button></div>}
      </section>

      <section className="panel">
        <div className="panel-head"><h2>{system.name} analysis</h2><Button variant="console" size="sm" disabled={!clause.segments.length} onClick={exportCsv}><Download />Export clause CSV</Button></div>
        {segs.length === 0 ? <p className="empty-state">No {system.name} annotations yet</p> : <div className="analysis-table">{segs.map(s => <div className={`analysis-cell ${sysId}`} key={s.id}><span>{words.slice(s.start, s.end + 1).join(' ')}</span><strong>{s.label}</strong><Button variant="ghost" size="icon" aria-label={`Remove ${s.label}`} onClick={() => remove(s.id)}><Trash2 /></Button></div>)}</div>}
      </section>
    </div>
  </main>;
}
