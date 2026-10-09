import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowRight, Search, Settings2, UserRound, Network, MessageCircle, Layers3, BookOpen, ChevronRight, CircleHelp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { systems } from '@/lib/systems';
import wave from '@/assets/console-wave.jpg';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'SFL Studio — Explore the language of meaning' },
    { name: 'description', content: 'Explore Transitivity, Mood, and Theme with SFL Studio, a workspace for Systemic Functional Linguistics analysis.' },
    { property: 'og:title', content: 'SFL Studio — Explore the language of meaning' },
    { property: 'og:description', content: 'Three systems. Three perspectives. Explore and annotate the meaning within every clause.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: Index,
});
const icons = [Network, MessageCircle, Layers3];
function Index() {
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const setWorkspace = (open: boolean) => { if (open) navigate({ to: '/projects' }); };
  const [panel, setPanel] = useState<'search' | 'reference' | 'settings' | 'profile' | null>(null);
  const [query, setQuery] = useState('');
  const [time, setTime] = useState('');
  const [motion, setMotion] = useState(true);
  const system = systems[selected] ?? systems[0];
  useEffect(() => { const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })); tick(); const timer = setInterval(tick, 60000); return () => clearInterval(timer); }, []);
  return <main className={`console-home ${motion ? '' : 'motion-off'}`}>
    <section className="console-stage">
      <img className="stage-background" src={wave} alt="" width={1920} height={1024} />
      <div className="stage-wash" />
      <header className="console-header">
        <a href="/" className="wordmark" aria-label="SFL Studio home">sfl<span className="wordmark-divider" /> <span>studio</span></a>
        <nav aria-label="Main navigation"><Button variant="navigation" className="nav-active" onClick={() => { setPanel(null); setWorkspace(false); }}>Analysis</Button><Button variant="navigation" onClick={() => setPanel('reference')}>Reference</Button><Button variant="navigation" onClick={() => setWorkspace(true)}>Projects</Button></nav>
        <div className="header-tools"><Button variant="ghost" size="icon" aria-label="Search systems" title="Search systems" onClick={() => setPanel('search')}><Search /></Button><Button variant="ghost" size="icon" aria-label="Settings" title="Settings" onClick={() => setPanel('settings')}><Settings2 /></Button><Button variant="ghost" size="icon" className="profile-icon" aria-label="Your workspace" title="Your workspace" onClick={() => setPanel('profile')}><UserRound /></Button><time>{time}</time></div>
      </header>
      <div className="stage-content">
        <div className="system-selector" aria-label="Select an analysis system">{systems.map((item, i) => <div className={`tile-group ${selected === i ? 'selected' : ''}`} key={item.id}><Button variant="tile" aria-label={`Select ${item.name} System`} aria-pressed={selected === i} onClick={() => setSelected(i)}><img src={item.image} alt="" width={1024} height={1024} /><span className="tile-mini-icon">{(() => { const Icon = icons[i] ?? Network; return <Icon />; })()}</span></Button>{selected === i && <span className="tile-caption">{item.name} System</span>}</div>)}<div className="selector-divider" /><Button variant="glass" size="icon" className="reference-tile" aria-label="Open reference" title="System reference" onClick={() => setPanel('reference')}><BookOpen /></Button><span className="selector-note">Three systems.<br />Infinite meaning.</span></div>
        <div className="featured-system" key={system.id}>
          <div className="eyebrow"><span className={`system-dot ${system.id}`} /> {system.metafunction}</div>
          <h1>{system.name}<br /><span>System</span></h1>
          <p className="featured-description">{system.description}</p>
          <div className="system-tags">{system.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
          <div className="featured-actions"><Button variant="console" className="launch-button" onClick={() => setWorkspace(true)}>Start analysis <ArrowRight /></Button><Button variant="glass" size="icon" className="info-button" aria-label={`About ${system.name}`} title={`About ${system.name}`} onClick={() => setPanel('reference')}><CircleHelp /></Button></div>
        </div>
        <div className="stage-signature"><span>THE LANGUAGE OF MEANING</span><div>Systemic Functional<br />Linguistics</div></div>
        <div className="stage-bottom"><span><span className="online-dot" />Your linguistic workspace</span><span>EXPLORE. ANALYZE. UNDERSTAND.</span><div className="pagination-dots">{systems.map((s,i) => <span key={s.id} className={i === selected ? 'active' : ''} />)}</div></div>
      </div>
    </section>
    <section className="explore-section">
      <div className="section-heading"><div><span className="eyebrow">A NEW PERSPECTIVE ON EVERY CLAUSE</span><h2>Explore the systems</h2></div><span className="system-count">03 <span>connected perspectives</span></span></div>
      <div className="system-grid">{systems.map((item,i) => { const Icon = icons[i] ?? Network; return <Button variant="feature" key={item.id} onClick={() => { setSelected(i); setWorkspace(true); }} aria-label={`Explore ${item.name} System`}><div className={`feature-art ${item.id}`}><img src={item.image} width={1024} height={1024} loading="lazy" alt={`${item.name} glass sculpture`} /><span className="feature-number">{item.number}</span><span className="feature-arrow"><ArrowUpRight /></span></div><div className="feature-details"><Icon /><div><h3>{item.name} System</h3><p>{item.subtitle}</p></div><ChevronRight /></div></Button>; })}</div>
      <footer><span>Rooted in M. A. K. Halliday’s Systemic Functional Linguistics</span><span>SFL Studio <span className="footer-dot">·</span> A space for meaning</span></footer>
    </section>
    <Dialog open={panel !== null} onOpenChange={open => { if (!open) setPanel(null); }}><DialogContent className="utility-dialog"><DialogTitle>{panel === 'search' ? 'Find your perspective' : panel === 'settings' ? 'Settings' : panel === 'profile' ? 'Your workspace' : 'System reference'}</DialogTitle><DialogDescription>{panel === 'reference' ? 'Three complementary perspectives on meaning.' : panel === 'profile' ? 'Guest session' : panel === 'settings' ? 'Make this space your own.' : 'Transitivity, Mood, and Theme.'}</DialogDescription>
      {panel === 'search' && <input aria-label="Search" autoFocus placeholder="Search systems…" value={query} onChange={e => setQuery(e.target.value)} />}
      {(panel === 'search' || panel === 'reference') && <div className="reference-list">{systems.filter(s => panel !== 'search' || `${s.name} ${s.description} ${s.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())).map(s => <Button key={s.id} variant="ghost" className="reference-item" onClick={() => { setSelected(systems.findIndex(item => item.id === s.id)); setPanel(null); if (panel === 'reference') setWorkspace(true); }}><img src={s.image} width={1024} height={1024} alt="" /><div><strong>{s.name} System</strong><p>{s.subtitle}</p><small>{s.tags.join(' · ')}</small></div><ArrowUpRight /></Button>)}{panel === 'search' && !systems.some(s => `${s.name} ${s.description} ${s.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())) && <p className="empty-state">No systems found.</p>}</div>}
      {panel === 'settings' && <div className="setting-row"><span>Interface animation</span><Button variant={motion ? 'default' : 'outline'} aria-pressed={motion} onClick={() => setMotion(!motion)}>{motion && <Check />}{motion ? 'On' : 'Off'}</Button></div>}
      {panel === 'profile' && <div className="guest-info"><UserRound /><h3>A fresh perspective</h3><p>Your analysis stays in this session. Export your annotations before closing the workspace.</p><Button variant="console" onClick={() => { setPanel(null); setWorkspace(true); }}>Start analysis <ArrowRight /></Button></div>}
    </DialogContent></Dialog>
  </main>;
}
