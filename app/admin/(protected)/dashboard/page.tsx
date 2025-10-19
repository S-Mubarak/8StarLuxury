import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import SignOutButton from '@/components/admin/dashboard/SignOutButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAdminDashboardStats } from '@/lib/server-side-functions';
import {
  CalendarDays,
  DollarSign,
  Hourglass,
  Route as RouteIcon,
  Ticket,
} from 'lucide-react';
import { getServerSession } from 'next-auth';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  const stats = await getAdminDashboardStats();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-lg text-slate-500 mt-1">
            Welcome back, {user?.name || user?.email}!
          </p>
        </div>
        <SignOutButton />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                ₦{stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-blue-700 opacity-80">
                From all paid bookings
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">
                Total Bookings
              </CardTitle>
              <Ticket className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                +{stats.totalBookings.toLocaleString()}
              </div>
              <p className="text-xs text-green-700 opacity-80">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">
                Today&apos;s Bookings
              </CardTitle>
              <CalendarDays className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                +{stats.todaysBookings.toLocaleString()}
              </div>
              <p className="text-xs text-purple-700 opacity-80">
                Bookings made today
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">
                Pending Bookings
              </CardTitle>
              <Hourglass className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-900">
                {stats.pendingBookings.toLocaleString()}
              </div>
              <p className="text-xs text-yellow-700 opacity-80">
                Awaiting payment
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-indigo-800">
                Scheduled Trips
              </CardTitle>
              <RouteIcon className="h-5 w-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-900">
                {stats.totalTrips.toLocaleString()}
              </div>
              <p className="text-xs text-indigo-700 opacity-80">
                Active upcoming trips
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">
          Recent Activity
        </h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {/* (Placeholder: A table showing the last 5 bookings will go here.) */}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
