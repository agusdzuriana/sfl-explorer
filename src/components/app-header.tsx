import { Link } from '@tanstack/react-router';
import { ArrowUpRight, ChevronRight, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AppHeader({ crumbs = [] }: { crumbs?: { label: string; to?: React.ReactNode }[] }) {
  return <header className="app-header">
    <Link to="/" className="wordmark small" aria-label="SFL Studio home">sfl<span className="wordmark-divider" /> <span>studio</span></Link>
    <nav className="app-crumbs" aria-label="Breadcrumb"><Link to="/projects" activeOptions={{ exact: true }} activeProps={{ className: 'crumb-active' }}><Library size={15} />Projects</Link>{crumbs.map((c, i) => <span key={i}><ChevronRight size={13} />{c.to ?? <span className="crumb-active" aria-current="page">{c.label}</span>}</span>)}</nav>
    <Button asChild variant="ghost" className="home-link"><Link to="/">Explore systems<ArrowUpRight /></Link></Button>
  </header>;
}
