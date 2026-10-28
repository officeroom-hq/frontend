import { useEffect, useState, type FormEvent } from 'react';
import { Hash, MessageCircle, Send, Smile, Paperclip } from 'lucide-react';
import { api, type Channel, type Message } from '../../api';
import { SidebarLayout } from '../../layouts/SidebarLayout';
import { AppSidebar, type AppSidebarLink } from '../../components/AppSidebar';
import { Avatar, Button, EmptyState, ErrorState, IconButton, LoadingState, SearchInput } from '../../components/ui';
import { TONE_HEX } from '../../lib/tones';
import { useAsync } from '../../hooks/useAsync';
import { useSession } from '../../lib/session';

const MSG_LINKS: AppSidebarLink[] = [
  { label: 'Messages', to: '/messages', capability: 'messages:view', icon: <MessageCircle size={13} aria-hidden="true" /> },
  { label: 'Files', to: '/files', capability: 'files:view', icon: <Hash size={13} aria-hidden="true" /> },
];

function ChannelList({ channels, activeId, onSelect }: { channels: Channel[]; activeId: string; onSelect: (id: string) => void }) {
  const [q, setQ] = useState('');
  const shown = channels.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <section aria-label="Channels" className="flex w-full shrink-0 flex-col gap-2 border-line md:w-56 md:border-r md:pr-3">
      <SearchInput label="Find a channel" placeholder="Find a channel" value={q} onChange={(e) => setQ(e.target.value)} className="w-full" />
      <ul className="space-y-0.5">
        {shown.map((c) => (
          <li key={c.id}>
            <button type="button" aria-current={c.id === activeId ? 'true' : undefined} onClick={() => onSelect(c.id)} className={`flex w-full items-center gap-2 rounded-control px-2 py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${c.id === activeId ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
              <Avatar initials={c.initials} tone={c.tone} size={24} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-caption font-medium text-ink">{c.kind === 'channel' ? '#' : ''}{c.name}</span>
                  <span className="text-micro text-muted">{c.time}</span>
                </span>
                <span className="block truncate text-micro text-muted">{c.preview}</span>
              </span>
              {c.unread > 0 && <span className="rounded-full bg-blue-600 px-1.5 text-micro font-semibold text-white">{c.unread}</span>}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MessagingPage() {
  const { user } = useSession();
  const channels = useAsync(() => api.listChannels(), []);
  const [activeId, setActiveId] = useState<string>('');
  const current = channels.data?.find((c) => c.id === (activeId || channels.data?.[0]?.id));
  const messages = useAsync(() => (current ? api.listMessages(current.id) : Promise.resolve([] as Message[])), [current?.id]);
  const [local, setLocal] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sendError, setSendError] = useState<string>();

  useEffect(() => { setLocal([]); setSendError(undefined); }, [current?.id]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!current || !draft.trim()) return;
    const text = draft.trim();
    try {
      const m = await api.sendMessage(current.id, text);
      setLocal((l) => [...l, m]);
      setDraft('');
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Message not sent.');
    }
  };

  return (
    <SidebarLayout sidebar={<AppSidebar links={MSG_LINKS} title="Messages" />} searchPlaceholder="Search messages">
      <div className="flex min-h-[70vh] flex-col gap-4 rounded-card border border-line bg-white p-3 shadow-card md:flex-row">
        {channels.loading ? <div className="w-full md:w-56"><LoadingState rows={6} label="Loading channels" /></div>
          : channels.error ? <ErrorState error={channels.error} onRetry={channels.reload} />
          : (channels.data ?? []).length === 0 ? <EmptyState title="No conversations yet" body="Channels and direct messages will show here." />
          : (
            <>
              <ChannelList channels={channels.data ?? []} activeId={current?.id ?? ''} onSelect={setActiveId} />
              <section aria-label={`Conversation ${current?.name ?? ''}`} className="flex min-w-0 flex-1 flex-col">
                <header className="flex items-center justify-between border-b border-line pb-2">
                  <h2 className="text-[13px] font-semibold text-ink">{current?.kind === 'channel' ? '#' : ''}{current?.name}</h2>
                  <span className="text-micro text-muted">Signed in as {user?.fullName}</span>
                </header>
                <div className="flex-1 space-y-3 overflow-y-auto py-3" aria-live="polite">
                  {messages.loading ? <LoadingState rows={4} label="Loading messages" />
                    : messages.error ? <ErrorState error={messages.error} onRetry={messages.reload} />
                    : [...(messages.data ?? []), ...local].length === 0 ? <EmptyState title="No messages yet" body="Say hello to start the conversation." />
                    : [...(messages.data ?? []), ...local].map((m) => (
                      <div key={m.id} className={`flex gap-2 ${m.mine ? 'flex-row-reverse' : ''}`}>
                        <Avatar initials={m.initials} tone={m.tone} size={24} />
                        <div className={`max-w-[75%] rounded-card px-3 py-2 text-caption ${m.mine ? 'bg-blue-600 text-white' : 'bg-slate-100 text-ink'}`}>
                          <p className={`mb-0.5 text-micro font-semibold ${m.mine ? 'text-blue-100' : 'text-muted'}`} style={m.mine ? undefined : { color: TONE_HEX[m.tone] }}>{m.authorName} · {m.time}</p>
                          {m.text}
                        </div>
                      </div>
                    ))}
                </div>
                {sendError && <p role="alert" className="pb-2 text-micro text-red-600">{sendError}</p>}
                <form onSubmit={send} className="flex items-center gap-2 border-t border-line pt-2" aria-label="Send a message">
                  <IconButton label="Attach a file (not connected yet)" disabled><Paperclip size={13} /></IconButton>
                  <label className="sr-only" htmlFor="msg-input">Message</label>
                  <input id="msg-input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Message ${current?.name ?? ''}`} className="h-8 flex-1 rounded-control border border-line px-2.5 text-caption focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                  <IconButton label="Emoji (not connected yet)" disabled><Smile size={13} /></IconButton>
                  <Button type="submit" disabled={!draft.trim()} icon={<Send size={12} />}>Send</Button>
                </form>
              </section>
            </>
          )}
      </div>
    </SidebarLayout>
  );
}
