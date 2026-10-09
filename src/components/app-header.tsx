import { Link } from '@tanstack/react-router';

export function AppHeader({ crumbs = [] }: { crumbs?: { label: string; to?: React.ReactNode }[] }) {
  return <header className="app-header">
    <Link to="/" className="wordmark small" aria-label="SFL Studio home">sfl<span className="wordmark-divider" /> <span>studio</span></Link>
    <nav className="app-crumbs"><Link to="/projects" activeOptions={{ exact: true }} activeProps={{ className: 'crumb-active' }}>Projects</Link>{crumbs.map((c, i) => <span key={i}><span className="crumb-sep">/</span>{c.to ?? <span className="crumb-active">{c.label}</span>}</span>)}</nav>
  </header>;
}
