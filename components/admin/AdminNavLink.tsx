'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface AdminNavLinkProps {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
}

export default function AdminNavLink({
  href,
  children,
  icon,
}: AdminNavLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href ||
    (href !== '/admin/dashboard' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 transition-all hover:text-white hover:bg-slate-700/50',
        isActive && 'bg-blue-600 text-white font-medium shadow-inner'
      )}
    >
      {icon && (
        <span className={cn(isActive ? 'text-white' : 'text-slate-400')}>
          {icon}
        </span>
      )}
      {children}
    </Link>
  );
}
