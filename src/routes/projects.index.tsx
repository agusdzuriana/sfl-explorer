import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Plus, Trash2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/app-header';
import { createProject, deleteProject, tokenize, useProjects } from '@/lib/projects-store';

export const Route = createFileRoute('/projects/')({
  head: () => ({ meta: [
    { title: 'Projects — SFL Studio' },
    { name: 'description', content: 'Your Systemic Functional Linguistics analysis projects.' },
    { property: 'og:title', content: 'Projects — SFL Studio' },
    { property: 'og:description', content: 'Create projects, add texts, and analyse clauses.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
  ] }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const projects = useProjects();
  const [name, setName] = useState('');
  const navigate = useNavigate();
  function create(e: React.FormEvent) {
    e.preventDefault(); if (!name.trim()) return;
    const p = createProject(name.trim());
    navigate({ to: '/projects/$projectId', params: { projectId: p.id } });
  }
  return <main className="app-page">
    <AppHeader />
    <div className="app-body">
      <span className="eyebrow">Your library</span>
      <h1 className="page-title">Projects</h1>
      <form className="inline-form" onSubmit={create}><input aria-label="Project name" placeholder="New project name…" value={name} onChange={e => setName(e.target.value)} /><Button variant="console" type="submit"><Plus />Create</Button></form>
      {projects === null ? null : projects.length === 0 ? <p className="empty-state">No projects yet. Create your first one above.</p> :
        <div className="card-list">{projects.map(p => <div className="list-card" key={p.id}>
          <Link to="/projects/$projectId" params={{ projectId: p.id }} className="list-card-main"><FolderOpen /><div><strong>{p.name}</strong><small>{tokenize(p.text).length} words · {p.clauses.length} clauses · {new Date(p.createdAt).toLocaleDateString()}</small></div></Link>
          <Button variant="ghost" size="icon" aria-label={`Delete ${p.name}`} onClick={() => { if (confirm(`Delete "${p.name}"?`)) deleteProject(p.id); }}><Trash2 /></Button>
        </div>)}</div>}
    </div>
  </main>;
}
