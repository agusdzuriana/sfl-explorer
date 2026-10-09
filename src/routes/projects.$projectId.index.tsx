import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Trash2, ChevronRight, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/app-header';
import { canAddClause, tokenize, uid, updateProject, useProjects } from '@/lib/projects-store';

export const Route = createFileRoute('/projects/$projectId/')({
  head: () => ({ meta: [
    { title: 'Project — SFL Studio' },
    { name: 'description', content: 'Add your text and mark clauses for analysis.' },
    { property: 'og:title', content: 'Project — SFL Studio' },
    { property: 'og:description', content: 'Add your text and mark clauses for analysis.' },
    { property: 'og:type', content: 'article' }, { name: 'twitter:card', content: 'summary' },
  ] }),
  component: ProjectPage,
});

function ProjectPage() {
  const { projectId } = Route.useParams();
  const projects = useProjects();
  const project = projects?.find(p => p.id === projectId);
  const [editing, setEditing] = useState<string | null>(null);
  const [first, setFirst] = useState<number | null>(null);
  const [error, setError] = useState('');
  if (projects === null) return <main className="app-page"><AppHeader /></main>;
  if (!project) return <main className="app-page"><AppHeader /><div className="app-body"><p className="empty-state">Project not found. <Link to="/projects">Back to projects</Link></p></div></main>;

  const words = tokenize(project.text);
  const clauseOf = (i: number) => project.clauses.findIndex(c => i >= c.start && i <= c.end);
  const sorted = [...project.clauses].sort((a, b) => a.start - b.start);

  function clickWord(i: number) {
    setError('');
    if (first === null) { if (clauseOf(i) >= 0) { setError('This word already belongs to a clause.'); return; } setFirst(i); return; }
    const start = Math.min(first, i), end = Math.max(first, i);
    if (!canAddClause(project!.clauses, start, end)) { setError('A clause cannot overlap another clause.'); setFirst(null); return; }
    updateProject(project!.id, p => ({ ...p, clauses: [...p.clauses, { id: uid(), start, end, segments: [] }] }));
    setFirst(null);
  }
  function saveText() {
    if (editing === null) return;
    if (project!.clauses.length && editing !== project!.text && !confirm('Changing the text removes all clauses and their analysis. Continue?')) return;
    updateProject(project!.id, p => ({ ...p, text: editing, clauses: editing === p.text ? p.clauses : [] }));
    setEditing(null);
  }

  return <main className="app-page">
    <AppHeader crumbs={[{ label: project.name }]} />
    <div className="app-body">
      <span className="eyebrow">Project</span>
      <h1 className="page-title">{project.name}</h1>

      <section className="panel">
        <div className="panel-head"><h2>Text</h2>{editing === null && <Button variant="ghost" size="sm" onClick={() => setEditing(project.text)}><Pencil />{project.text ? 'Edit text' : 'Add text'}</Button>}</div>
        {editing !== null || !project.text ? <>
          <textarea rows={6} aria-label="Project text" value={editing ?? ''} onFocus={() => editing === null && setEditing('')} onChange={e => setEditing(e.target.value)} placeholder="Paste or type your text here…" />
          <div className="row-end"><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button variant="console" onClick={saveText} disabled={!editing?.trim()}>Save text</Button></div>
        </> : <>
          <p className="hint">{first === null ? 'Click the first word of a clause, then click its last word.' : `Now click the last word (started at “${words[first]}”). Click again to cancel.`}</p>
          <div className="word-flow">{words.map((w, i) => { const c = clauseOf(i); const cl = project.clauses[c]; const n = cl ? sorted.findIndex(s => s.id === cl.id) + 1 : 0; return <button key={i} type="button" onClick={() => (first === i ? setFirst(null) : clickWord(i))} className={`word ${c >= 0 ? 'in-clause' : ''} ${first === i ? 'word-first' : ''} ${cl?.start === i ? 'clause-start' : ''}`}>{cl?.start === i && <sup>{n}</sup>}{w}</button>; })}</div>
          {error && <p className="text-destructive text-sm" role="alert">{error}</p>}
        </>}
      </section>

      <section className="panel">
        <div className="panel-head"><h2>Clauses</h2><span className="hint">{sorted.length} total</span></div>
        {sorted.length === 0 ? <p className="empty-state">No clauses yet</p> : <div className="card-list">{sorted.map((c, i) => <div className="list-card" key={c.id}>
          <Link to="/projects/$projectId/clauses/$clauseId" params={{ projectId: project.id, clauseId: c.id }} className="list-card-main"><span className="clause-num">{i + 1}</span><div><strong>{words.slice(c.start, c.end + 1).join(' ')}</strong><small>{c.segments.length} annotations</small></div><ChevronRight className="ml-auto" /></Link>
          <Button variant="ghost" size="icon" aria-label={`Delete clause ${i + 1}`} onClick={() => updateProject(project.id, p => ({ ...p, clauses: p.clauses.filter(x => x.id !== c.id) }))}><Trash2 /></Button>
        </div>)}</div>}
      </section>
    </div>
  </main>;
}
