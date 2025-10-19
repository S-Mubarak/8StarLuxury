import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Toaster } from '@/components/ui/sonner';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

import AdminNavLink from '@/components/admin/AdminNavLink';
import SignOutButton from '@/components/admin/dashboard/SignOutButton';
import {
  Building,
  Bus,
  ClipboardList,
  LayoutDashboard,
  Map,
  PackagePlus,
  Route as RouteIcon,
  Users,
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  //@ts-expect-error ???
  if (!session || (session.user as never)?.role !== 'admin') {
    redirect('/admin/login');
  }

  return (
    <div className="flex h-screen bg-slate-100">
      {' '}
      <aside className="w-64 bg-slate-900 text-white flex flex-col border-r border-slate-700/50">
        <div className="flex h-16 items-center border-b border-slate-700/50 px-6 shrink-0">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 font-semibold text-white"
          >
            <Building className="h-6 w-6 text-blue-400" />
            <span>8SL Admin</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-auto py-4 px-4 space-y-1">
          {' '}
          <AdminNavLink
            href="/admin/dashboard"
            icon={<LayoutDashboard className="h-4 w-4" />}
          >
            Dashboard
          </AdminNavLink>
          <AdminNavLink
            href="/admin/bookings"
            icon={<ClipboardList className="h-4 w-4" />}
          >
            Bookings
          </AdminNavLink>
          <div className="pt-4 pb-2 px-3">
            <h3 className="text-xs font-semibold uppercase text-slate-500">
              Manage
            </h3>
          </div>
          <AdminNavLink
            href="/admin/trips"
            icon={<RouteIcon className="h-4 w-4" />}
          >
            Trips
          </AdminNavLink>
          <AdminNavLink href="/admin/routes" icon={<Map className="h-4 w-4" />}>
            Routes
          </AdminNavLink>
          <AdminNavLink
            href="/admin/vehicles"
            icon={<Bus className="h-4 w-4" />}
          >
            Vehicles
          </AdminNavLink>
          <AdminNavLink
            href="/admin/drivers"
            icon={<Users className="h-4 w-4" />}
          >
            Drivers
          </AdminNavLink>
          <AdminNavLink
            href="/admin/addons"
            icon={<PackagePlus className="h-4 w-4" />}
          >
            Add-Ons
          </AdminNavLink>
        </nav>

        <div className="mt-auto border-t border-slate-700/50 p-4">
          <div className="mt-2 text-xs text-slate-400 truncate px-3 py-1">
            Logged in as: {user?.email}
          </div>

          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
      <Toaster position="top-right" richColors closeButton />{' '}
    </div>
  );
}
