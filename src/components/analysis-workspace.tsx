import { useState } from 'react';
import { Download, Plus, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { System } from '@/lib/systems';

type Annotation = { text: string; label: string };
export function AnalysisWorkspace({ system, onClose }: { system: System; onClose: () => void }) {
  const [text, setText] = useState('');
  const [phrase, setPhrase] = useState('');
  const [label, setLabel] = useState<string>(system.labels[0]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [error, setError] = useState('');
  function add() {
    if (!phrase.trim() || !text.includes(phrase.trim())) { setError('This phrase must appear in your text.'); return; }
    setAnnotations([...annotations, { text: phrase.trim(), label }]); setPhrase(''); setError('');
  }
  function exportCsv() {
    const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const csv = ['Phrase,Label', ...annotations.map(a => `${quote(a.text)},${quote(a.label)}`)].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `${system.id}-analysis.csv`; link.click(); URL.revokeObjectURL(url);
  }
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}><DialogContent className="workspace-dialog">
    <div className="workspace-heading"><span className={`system-dot ${system.id}`} /> <span className="eyebrow">{system.metafunction}</span></div>
    <DialogTitle>{system.name} analysis</DialogTitle><DialogDescription>Manual annotation workspace</DialogDescription>
    <label className="field-label" htmlFor="analysis-text">Your text</label>
    <textarea id="analysis-text" rows={3} value={text} onChange={e => { setText(e.target.value); setAnnotations([]); }} placeholder="Enter a sentence or passage…" />
    <div className="workspace-toolbar"><Button variant="ghost" size="sm" onClick={() => { setText(system.sample); setAnnotations(system.annotations.map(a => ({ ...a }))); setError(''); }}>Load example</Button><Button variant="ghost" size="icon" title="Clear analysis" aria-label="Clear analysis" onClick={() => { setText(''); setAnnotations([]); setError(''); }}><RotateCcw /></Button></div>
    <div className="annotation-form"><div><label htmlFor="phrase" className="field-label">Phrase</label><input id="phrase" value={phrase} onChange={e => setPhrase(e.target.value)} placeholder="A phrase from your text" /></div><div><label htmlFor="label" className="field-label">Function</label><select id="label" value={label} onChange={e => setLabel(e.target.value)}>{system.labels.map(l => <option key={l}>{l}</option>)}</select></div><Button aria-label="Add annotation" title="Add annotation" onClick={add}><Plus /></Button></div>
    {error && <p className="text-destructive text-sm" role="alert">{error}</p>}
    <div className="annotations">{annotations.length === 0 ? <p className="empty-state">No annotations yet</p> : annotations.map((a, i) => <div className="annotation-row" key={`${a.text}-${i}`}><span>{a.text}</span><span className="annotation-label">{a.label}</span><Button variant="ghost" size="icon" aria-label={`Remove ${a.text}`} onClick={() => setAnnotations(annotations.filter((_, index) => index !== i))}><Trash2 /></Button></div>)}</div>
    <div className="workspace-footer"><span>{annotations.length} annotations</span><Button variant="console" disabled={!annotations.length} onClick={exportCsv}><Download />Export CSV</Button></div>
  </DialogContent></Dialog>;
}