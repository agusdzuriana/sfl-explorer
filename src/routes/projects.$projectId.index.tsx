import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Trash2, ArrowUpRight, Pencil, Save, X, Search, FileText, Download, Check, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AppHeader } from '@/components/app-header';
import { PageIntro, Metrics, SystemStatus, WorkspaceFooter } from '@/components/workspace-foundation';
import { canAddClause, tokenize, uid, updateProject, useProjects } from '@/lib/projects-store';
import { projectSummary, downloadFile } from '@/lib/analysis-summary';

export const Route = createFileRoute('/projects/$projectId/')({
  head: () => ({ meta: [
    { title: 'Project workspace — SFL Studio' }, { name: 'description', content: 'Read your project text, manually define clauses, and track linguistic annotations.' },
    { property: 'og:title', content: 'Project workspace — SFL Studio' }, { property: 'og:description', content: 'A dedicated workspace for your text and its clause-by-clause analysis.' },
    { property: 'og:type', content: 'article' }, { name: 'twitter:card', content: 'summary' },
  ] }), component: ProjectPage,
});
function ProjectPage() {
  const { projectId } = Route.useParams();
  const projects = useProjects();
  const project = projects?.find(p => p.id === projectId);
  const [editing, setEditing] = useState<string | null>(null);
  const [first, setFirst] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [rename, setRename] = useState(false);
  const [name, setName] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [replace, setReplace] = useState(false);
  if (projects === null) return <main className="app-page"><AppHeader /><div className="app-body">Loading project…</div></main>;
  if (!project) return <main className="app-page"><AppHeader /><div className="app-body"><div className="workspace-empty"><FileText size={40} /><h1 className="page-title">Project not found</h1><Button asChild variant="console"><Link to="/projects">Back to projects</Link></Button></div></div></main>;
  const words = tokenize(project.text);
  const summary = projectSummary(project);
  const sorted = [...project.clauses].sort((a, b) => a.start - b.start);
  const shown = sorted.filter(c => words.slice(c.start, c.end + 1).join(' ').toLowerCase().includes(query.toLowerCase()));
  const clauseOf = (i: number) => sorted.findIndex(c => i >= c.start && i <= c.end);
  function clickWord(i: number) {
    if (!project) return;
    setError('');
    if (first === null) { if (clauseOf(i) >= 0) { setError('This word already belongs to a clause.'); return; } setFirst(i); setHover(i); return; }
    const start = Math.min(first, i), end = Math.max(first, i);
    if (!canAddClause(project.clauses, start, end)) { setError('A clause cannot overlap another clause.'); setFirst(null); setHover(null); return; }
    updateProject(project.id, p => ({ ...p, clauses: [...p.clauses, { id: uid(), start, end, segments: [] }] }));
    setFirst(null); setHover(null);
  }
  function saveText(confirmed = false) {
    if (!project || editing === null || !editing.trim()) return;
    if (project.clauses.length && editing !== project.text && !confirmed) { setReplace(true); return; }
    updateProject(project.id, p => ({ ...p, text: editing, clauses: editing === p.text ? p.clauses : [] }));
    setEditing(null); setFirst(null); setHover(null); setReplace(false);
  }
  return <main className="app-page"><AppHeader crumbs={[{ label: project.name }]} />
    <PageIntro eyebrow="Project workspace" title={project.name} description={`Created ${new Date(project.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`} actions={<><Button variant="glass" size="icon" aria-label="Rename project" title="Rename project" onClick={() => { setName(project.name); setRename(true); }}><Pencil /></Button><Button variant="glass" onClick={() => downloadFile(`${project.name}.json`, JSON.stringify(project, null, 2), 'application/json')}><Download />Export project</Button></>}>
      <Metrics items={[{ label: 'Words', value: words.length }, { label: 'Clauses', value: sorted.length.toString().padStart(2, '0') }, { label: 'Assigned words', value: `${summary.assigned} / ${words.length}` }, { label: 'Annotations', value: summary.annotations }]} />
    </PageIntro>
    <div className="app-body"><div className="project-workspace-grid"><section className="text-workspace"><div className="section-heading compact"><div><span className="eyebrow">01 / Source</span><h2>Project text</h2></div>{editing === null && project.text && <Button variant="ghost" size="sm" onClick={() => { setEditing(project.text); setFirst(null); }}><Pencil />Edit text</Button>}</div>
      {editing !== null || !project.text ? <div className="text-editor"><label htmlFor="source-text" className="field-label">Source text</label><textarea id="source-text" rows={13} value={editing ?? ''} onChange={e => setEditing(e.target.value)} placeholder="Paste or type your text…" /><div className="editor-footer"><span>{tokenize(editing ?? '').length} words</span><div className="row-end"><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button variant="console" onClick={() => saveText()} disabled={!editing?.trim()}><Save />Save text</Button></div></div></div> : <><div className="selection-bar"><span><Scissors size={15} />{first === null ? 'Clause selection' : 'Selecting clause'}</span><span className="selection-detail">{first !== null ? `Start: word ${first + 1}` : `${words.length - summary.assigned} unassigned words`}</span>{first !== null && <Button variant="ghost" size="icon" aria-label="Cancel selection" title="Cancel selection" onClick={() => { setFirst(null); setHover(null); }}><X /></Button>}</div><div className="source-words word-flow">{words.map((w, i) => { const c = clauseOf(i); const cl = sorted[c]; const preview = first !== null && hover !== null && i >= Math.min(first, hover) && i <= Math.max(first, hover); return <Button variant="ghost" key={i} type="button" aria-label={`Word ${i + 1}: ${w}`} aria-pressed={first === i} onMouseEnter={() => first !== null && setHover(i)} onClick={() => clickWord(i)} className={`word ${c >= 0 ? 'in-clause' : ''} ${preview ? 'word-preview' : ''} ${first === i ? 'word-first' : ''} ${cl?.start === i ? 'clause-start' : ''}`}>{cl?.start === i && <sup>{c + 1}</sup>}{w}</Button>; })}</div>{error && <p className="text-destructive text-sm" role="alert">{error}</p>}<div className="source-legend"><span><span className="legend-square" />Unassigned</span><span><span className="legend-square assigned" />In a clause</span><span><span className="legend-square selected" />Selection</span></div></>}
    </section><aside className="project-overview"><span className="eyebrow">At a glance</span><h2>Project overview</h2><div className="overview-row"><span>Source text</span><strong>{project.text ? 'Added' : 'Not added'}{project.text && <Check size={14} />}</strong></div><div className="overview-row"><span>Clause coverage</span><strong>{words.length ? Math.round(summary.assigned / words.length * 100) : 0}%</strong></div><progress className="coverage-progress" max={Math.max(words.length, 1)} value={summary.assigned} /><div className="overview-row"><span>Unassigned words</span><strong>{words.length - summary.assigned}</strong></div><div className="overview-systems">{systemsForOverview(project.clauses)}</div></aside></div>
      <section className="clauses-section"><div className="section-heading compact"><div><span className="eyebrow">02 / Clause library</span><h2>Clauses <span className="count-label">{sorted.length}</span></h2></div><div className="search-field small-search"><Search size={16} /><input aria-label="Search clauses" placeholder="Search clause text…" value={query} onChange={e => setQuery(e.target.value)} /></div></div>{shown.length === 0 ? <div className="workspace-empty compact-empty"><Scissors size={30} /><h3>{query ? 'No matching clauses' : 'No clauses yet'}</h3>{query && <Button variant="ghost" onClick={() => setQuery('')}>Clear search</Button>}</div> : <div className="clause-list">{shown.map(c => { const n = sorted.findIndex(x => x.id === c.id) + 1; return <article className="clause-item" key={c.id}><span className="clause-index">{String(n).padStart(2, '0')}</span><Link to="/projects/$projectId/clauses/$clauseId" params={{ projectId: project.id, clauseId: c.id }} className="clause-item-main"><h3>{words.slice(c.start, c.end + 1).join(' ')}</h3><div className="clause-meta"><span>Words {c.start + 1}–{c.end + 1}</span><span>{c.end - c.start + 1} words</span><span>{c.segments.length} annotations</span></div><SystemStatus clauses={[c]} /></Link><Button asChild variant="ghost" size="icon"><Link to="/projects/$projectId/clauses/$clauseId" params={{ projectId: project.id, clauseId: c.id }} aria-label={`Analyze clause ${n}`} title="Analyze clause"><ArrowUpRight /></Link></Button><Button variant="ghost" size="icon" aria-label={`Delete clause ${n}`} title="Delete clause" onClick={() => setDeleting(c.id)}><Trash2 /></Button></article>; })}</div>}</section><WorkspaceFooter />
    </div>
    <Dialog open={rename} onOpenChange={setRename}><DialogContent className="utility-dialog"><DialogTitle>Rename project</DialogTitle><DialogDescription>Update the name of your project.</DialogDescription><form className="dialog-form" onSubmit={e => { e.preventDefault(); if (!name.trim()) return; updateProject(project.id, p => ({ ...p, name: name.trim() })); setRename(false); }}><input aria-label="Project name" value={name} onChange={e => setName(e.target.value)} /><div className="row-end"><Button type="button" variant="ghost" onClick={() => setRename(false)}>Cancel</Button><Button variant="console" disabled={!name.trim()}><Save />Save name</Button></div></form></DialogContent></Dialog>
    <Dialog open={replace} onOpenChange={setReplace}><DialogContent className="utility-dialog"><DialogTitle>Replace project text?</DialogTitle><DialogDescription>Changing the text removes all {sorted.length} clauses and their annotations. This cannot be undone.</DialogDescription><div className="row-end"><Button variant="ghost" onClick={() => setReplace(false)}>Cancel</Button><Button variant="destructive" onClick={() => saveText(true)}>Replace text</Button></div></DialogContent></Dialog>
    <Dialog open={deleting !== null} onOpenChange={open => { if (!open) setDeleting(null); }}><DialogContent className="utility-dialog"><DialogTitle>Delete clause?</DialogTitle><DialogDescription>This clause and its annotations will be removed. Its words will become available again.</DialogDescription><div className="row-end"><Button variant="ghost" onClick={() => setDeleting(null)}>Cancel</Button><Button variant="destructive" onClick={() => { updateProject(project.id, p => ({ ...p, clauses: p.clauses.filter(c => c.id !== deleting) })); setDeleting(null); }}><Trash2 />Delete clause</Button></div></DialogContent></Dialog>
  </main>;
}
function systemsForOverview(clauses: import('@/lib/projects-store').Clause[]) { return <SystemStatus clauses={clauses} />; }
