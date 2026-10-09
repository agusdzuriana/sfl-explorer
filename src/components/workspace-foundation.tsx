import type { ReactNode } from 'react';
import { systems } from '@/lib/systems';
import type { Clause } from '@/lib/projects-store';
import wave from '@/assets/console-wave.jpg';

export function PageIntro({ eyebrow, title, description, actions, children }: { eyebrow: string; title: string; description?: string; actions?: ReactNode; children?: ReactNode }) {
  return <section className="workspace-intro"><img src={wave} className="workspace-wave" alt="" /><div className="intro-wash" /><div className="intro-content"><div className="intro-title-row"><div><span className="eyebrow">{eyebrow}</span><h1 className="page-title">{title}</h1>{description && <p className="page-description">{description}</p>}</div><div className="intro-actions">{actions}</div></div>{children}</div></section>;
}
export function Metrics({ items }: { items: { label: string; value: number | string; detail?: string }[] }) {
  return <dl className="workspace-metrics">{items.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd>{item.detail && <small>{item.detail}</small>}</div>)}</dl>;
}
export function SystemStatus({ clauses }: { clauses: Clause[] }) {
  return <div className="system-status">{systems.map(s => { const count = clauses.reduce((sum, c) => sum + c.segments.filter(a => a.system === s.id).length, 0); return <span key={s.id} title={`${s.name}: ${count} annotations`}><span className={`system-dot ${s.id} ${count ? '' : 'inactive'}`} />{s.name}<small>{count}</small></span>; })}</div>;
}
export function WorkspaceFooter() {
  return <footer className="workspace-footer"><span>SFL Studio <span className="footer-dot">·</span> Systemic Functional Linguistics</span><span><span className="online-dot" /> Saved on this browser</span></footer>;
}
