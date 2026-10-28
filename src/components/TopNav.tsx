import { NavLink } from 'react-router-dom';
import { ChevronDown, Bell, HelpCircle, LayoutGrid, MessageSquare, Plus, Search, Star } from 'lucide-react';
import { NAV_ITEMS } from './nav';
import { useSession } from '../lib/session';
import { DevRoleSwitcher } from './DevRoleSwitcher';

export function Logo() {
  return (
    <div className="flex items-center gap-2 pr-3">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-[11px] font-bold text-blue-800">O</span>
      <span className="text-[14px] font-bold tracking-tight text-white">Officeroom</span>
    </div>
  );
}

export function TopNav({ searchPlaceholder = 'Search files, tasks, people, workflows...' }: { searchPlaceholder?: string }) {
  const { user, can } = useSession();
  const items = NAV_ITEMS.filter((i) => !i.capability || can(i.capability));
  return (
    <header className="sticky top-0 z-30 flex h-12 min-w-0 items-center gap-2 bg-nav px-3 text-white shadow-sm md:gap-3">
      <Logo />
      <nav aria-label="Primary" className="flex min-w-0 items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <LayoutGrid size={14} className="mx-1.5 shrink-0 opacity-80" aria-hidden="true" />
        {items.map((item) => {
          const cls = 'flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium text-blue-100 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300';
          const content = (
            <>
              {item.label}
              {item.caret && <ChevronDown size={11} aria-hidden="true" />}
            </>
          );
          return item.to ? (
            <NavLink key={item.label} to={item.to} className={({ isActive }) => `${cls} ${isActive ? 'bg-blue-600 text-white' : ''}`}>
              {content}
            </NavLink>
          ) : (
            <span key={item.label} className={cls}>{content}</span>
          );
        })}
      </nav>
      <div className="relative ml-auto hidden w-56 items-center xl:flex">
        <Search size={13} className="absolute left-2.5 text-blue-200" aria-hidden="true" />
        <input
          aria-label="Search"
          placeholder={searchPlaceholder}
          className="h-7 w-full rounded-md border border-white/15 bg-white/10 pl-7 pr-9 text-[11px] text-white placeholder:text-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-300"
        />
        <span className="absolute right-2 rounded bg-white/15 px-1 text-[9px] text-blue-100">⌘ K</span>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-2.5 xl:ml-0">
        <button type="button" aria-label="Add" className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200">
          <Plus size={14} />
        </button>
        <Star size={14} className="text-blue-100" aria-hidden="true" />
        <span className="relative">
          <Bell size={14} className="text-blue-100" aria-hidden="true" />
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
        </span>
        <MessageSquare size={14} className="text-blue-100" aria-hidden="true" />
        <HelpCircle size={14} className="text-blue-100" aria-hidden="true" />
        <DevRoleSwitcher />
        <div className="ml-1 flex items-center gap-2 border-l border-white/20 pl-2 md:pl-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-300 text-[9px] font-bold text-blue-900" aria-hidden="true">
            {user.initials}
          </span>
          <div className="hidden leading-tight lg:block">
            <p className="text-[11px] font-semibold">{user.fullName}</p>
            <p className="text-[9px] text-blue-200">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
