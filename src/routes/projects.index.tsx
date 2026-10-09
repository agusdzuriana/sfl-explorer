import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Plus, Trash2, FolderOpen, Search, LayoutGrid, List, ArrowUpRight, Files, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AppHeader } from '@/components/app-header';
import { PageIntro, Metrics, SystemStatus, WorkspaceFooter } from '@/components/workspace-foundation';
import { createProject, deleteProject, useProjects } from '@/lib/projects-store';
import { projectSummary, downloadFile } from '@/lib/analysis-summary';

export const Route = createFileRoute('/projects/')({
  head: () => ({ meta: [
    { title: 'Project library — SFL Studio' },
    { name: 'description', content: 'Your personal library of texts, clauses, and manual Systemic Functional Linguistics analyses.' },
    { property: 'og:title', content: 'Project library — SFL Studio' },
    { property: 'og:description', content: 'Organize texts and explore their meaning through Transitivity, Mood, and Theme.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
  ] }), component: ProjectsPage,
});
function ProjectsPage() {
  const projects = useProjects();
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const navigate = useNavigate();
  const all = projects ?? [];
  const shown = all.filter(p => `${p.name} ${p.text}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'oldest' ? a.createdAt - b.createdAt : b.createdAt - a.createdAt);
  const summaries = all.map(projectSummary);
  function create(e: React.FormEvent) { e.preventDefault(); if (!name.trim()) return; const p = createProject(name.trim()); navigate({ to: '/projects/$projectId', params: { projectId: p.id } }); }
  return <main className="app-page"><AppHeader />
    <PageIntro eyebrow="Your linguistic workspace" title="Project library" description="Every text. Every clause. A new perspective." actions={<Button variant="console" className="workspace-cta" onClick={() => { setName(''); setCreating(true); }}><Plus />New project</Button>}>
      <Metrics items={[{ label: 'Projects', value: all.length.toString().padStart(2, '0') }, { label: 'Words', value: summaries.reduce((s, p) => s + p.words, 0).toLocaleString() }, { label: 'Clauses', value: summaries.reduce((s, p) => s + p.clauses, 0) }, { label: 'Annotations', value: summaries.reduce((s, p) => s + p.annotations, 0) }]} />
    </PageIntro>
    <div className="app-body"><div className="collection-toolbar"><div className="search-field"><Search size={17} /><input aria-label="Search projects" placeholder="Search projects or text…" value={query} onChange={e => setQuery(e.target.value)} /></div><div className="toolbar-controls"><select aria-label="Sort projects" value={sort} onChange={e => setSort(e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name">Name A–Z</option></select><div className="view-switch"><Button variant="ghost" size="icon" aria-label="Grid view" title="Grid view" aria-pressed={view === 'grid'} onClick={() => setView('grid')}><LayoutGrid /></Button><Button variant="ghost" size="icon" aria-label="List view" title="List view" aria-pressed={view === 'list'} onClick={() => setView('list')}><List /></Button></div></div></div>
      <div className="section-heading compact"><h2>All projects <span className="count-label">{shown.length}</span></h2><Button variant="ghost" size="sm" disabled={!all.length} onClick={() => downloadFile('sfl-studio-projects.json', JSON.stringify(all, null, 2), 'application/json')}><Download />Export library</Button></div>
      {projects === null ? <div className="workspace-empty">Loading your library…</div> : shown.length === 0 ? <div className="workspace-empty"><FolderOpen size={42} /><h2>{query ? 'No matching projects' : 'A space for your next text'}</h2>{query ? <Button variant="outline" onClick={() => setQuery('')}>Clear search</Button> : <Button variant="console" onClick={() => setCreating(true)}><Plus />Create project</Button>}</div> : <div className={`project-collection ${view}`}>{shown.map((p, index) => { const summary = projectSummary(p); return <article className="project-card" key={p.id}><Link to="/projects/$projectId" params={{ projectId: p.id }} className="project-card-link"><div className="project-card-top"><span className="project-symbol"><FolderOpen size={22} /></span><span className="project-ordinal">{String(index + 1).padStart(2, '0')}</span><ArrowUpRight size={20} /></div><span className="project-state">{!p.text ? 'Awaiting text' : !p.clauses.length ? 'Text ready' : summary.annotations ? 'Analysis in progress' : 'Clauses ready'}</span><h3>{p.name}</h3><p className="project-excerpt">{p.text || '—'}</p><div className="project-card-counts"><span><FileText size={14} />{summary.words} words</span><span><Files size={14} />{summary.clauses} clauses</span></div><SystemStatus clauses={p.clauses} /></Link><div className="project-card-bottom"><span>Created {new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span><Button variant="ghost" size="icon" aria-label={`Delete ${p.name}`} title="Delete project" onClick={() => setDeleting(p.id)}><Trash2 /></Button></div></article>; })}</div>}
      <WorkspaceFooter />
    </div>
    <Dialog open={creating} onOpenChange={setCreating}><DialogContent className="utility-dialog"><DialogTitle>New project</DialogTitle><DialogDescription>A new text, a new perspective.</DialogDescription><form onSubmit={create} className="dialog-form"><label htmlFor="project-name" className="field-label">Project name</label><input id="project-name" placeholder="e.g. Classroom discourse" value={name} onChange={e => setName(e.target.value)} autoFocus /><div className="row-end"><Button variant="ghost" type="button" onClick={() => setCreating(false)}>Cancel</Button><Button variant="console" disabled={!name.trim()} type="submit"><Plus />Create project</Button></div></form></DialogContent></Dialog>
    <Dialog open={deleting !== null} onOpenChange={open => { if (!open) setDeleting(null); }}><DialogContent className="utility-dialog"><DialogTitle>Delete project?</DialogTitle><DialogDescription>“{all.find(p => p.id === deleting)?.name}” and all its text, clauses, and annotations will be permanently removed.</DialogDescription><div className="row-end"><Button variant="ghost" onClick={() => setDeleting(null)}>Cancel</Button><Button variant="destructive" onClick={() => { if (deleting) deleteProject(deleting); setDeleting(null); }}><Trash2 />Delete project</Button></div></DialogContent></Dialog>
  </main>;
}
