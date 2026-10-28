import { useState, type FormEvent } from 'react';
import { Bot, Mic, Paperclip, Send, Sparkles, Table2, BarChart3, CalendarDays, Settings, FileSpreadsheet } from 'lucide-react';
import { api } from '../api';
import type { ChatMessage } from '../api/types';
import { useAsync } from '../hooks/useAsync';
import { Card } from './ui';

type CopilotTab = 'Chat' | 'Workflows' | 'Insights' | 'History';
const COPILOT_TABS: readonly CopilotTab[] = ['Chat', 'Workflows', 'Insights', 'History'];

/** Chat panel. Fully presentational: messages and suggestions come from the Api, send goes through api.sendCopilotMessage. */
export function AICopilotPanel({ className = '' }: { className?: string }) {
  const thread = useAsync(() => api.getCopilotThread(), []);
  const [tab, setTab] = useState<CopilotTab>('Chat');
  const [extra, setExtra] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const messages = [...(thread.data?.messages ?? []), ...extra];

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    const now = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    setExtra((m) => [...m, { id: `u_${Date.now()}`, role: 'user', text: trimmed, time: now, read: false }]);
    setDraft('');
    setSending(true);
    try {
      const reply = await api.sendCopilotMessage(trimmed);
      setExtra((m) => [...m, reply]);
    } finally {
      setSending(false);
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void send(draft);
  }

  return (
    <Card
      className={`flex flex-col ${className}`}
      bodyClassName="flex min-h-0 flex-1 flex-col px-0 pb-0"
      title={
        <span className="flex items-center gap-2">
          <Sparkles size={15} className="text-blue-600" aria-hidden="true" />
          AI Copilot
          <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700">Beta</span>
        </span>
      }
      action={
        <span className="flex items-center gap-1 text-[10px] font-medium text-green-600">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Online
        </span>
      }
    >
      <div className="flex gap-4 border-b border-line px-4" role="tablist">
        {COPILOT_TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={t === tab}
            type="button"
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 pb-2 text-[11px] font-medium ${t === tab ? 'border-blue-600 text-blue-700' : 'border-transparent text-muted hover:text-ink'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex min-h-[260px] flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
        {thread.loading && <p className="text-[11px] text-muted">Loading conversation...</p>}
        {tab !== 'Chat' && (
          <p className="text-[11px] text-muted">{tab} is coming soon. Chat is live.</p>
        )}
        {tab === 'Chat' &&
          messages.map((m) =>
            m.role === 'user' ? (
              <div key={m.id} className="ml-auto max-w-[85%]">
                <div className="rounded-2xl rounded-br-sm bg-blue-50 px-3 py-2 text-[11px] leading-relaxed text-ink">{m.text}</div>
                <p className="mt-0.5 text-right text-[9px] text-muted">
                  {m.time}
                  {m.read && <span className="ml-1 text-blue-600">✓✓</span>}
                </p>
              </div>
            ) : (
              <div key={m.id} className="flex max-w-[92%] gap-2">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Bot size={13} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="rounded-2xl rounded-tl-sm border border-line bg-white px-3 py-2 text-[11px] leading-relaxed text-ink shadow-card">{m.text}</div>
                  {m.attachment && (
                    <div className="mt-2 flex items-center gap-2 rounded-lg border border-line bg-white p-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded bg-green-50 text-green-600">
                        <FileSpreadsheet size={16} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-medium text-ink">{m.attachment.name}</p>
                        <p className="text-[9px] text-muted">{m.attachment.meta}</p>
                        <button type="button" className="text-[10px] font-medium text-blue-600">{m.attachment.actionLabel}</button>
                      </div>
                    </div>
                  )}
                  <p className="mt-0.5 text-[9px] text-muted">{m.time}</p>
                </div>
              </div>
            ),
          )}
        {sending && <p className="text-[10px] text-muted">AI is typing...</p>}
      </div>

      <div className="space-y-2 px-4 pb-2">
        <div className="flex flex-wrap gap-1.5">
          {(thread.data?.suggestions ?? []).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void send(s)}
              className="rounded-full border border-line bg-white px-2.5 py-1 text-[10px] font-medium text-slate-600 hover:border-blue-300 hover:text-blue-700"
            >
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={onSubmit} className="rounded-xl border border-line bg-white p-2 shadow-card">
          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask AI to execute a task..."
              aria-label="Ask AI to execute a task"
              className="min-w-0 flex-1 bg-transparent text-[11px] text-ink outline-none placeholder:text-slate-400"
            />
            <Mic size={13} className="text-muted" aria-hidden="true" />
            <button type="submit" aria-label="Send" disabled={!draft.trim() || sending} className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white disabled:opacity-40">
              <Send size={13} aria-hidden="true" />
            </button>
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-muted">
            <Paperclip size={12} aria-hidden="true" />
            <Table2 size={12} aria-hidden="true" />
            <BarChart3 size={12} aria-hidden="true" />
            <CalendarDays size={12} aria-hidden="true" />
            <Settings size={12} aria-hidden="true" />
          </div>
        </form>
        <p className="pb-2 text-center text-[9px] text-muted">AI can make mistakes. Verify important info.</p>
      </div>
    </Card>
  );
}
