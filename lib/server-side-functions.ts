import 'server-only';
import dbConnect from '@/lib/dbConnect';
import Booking from '@/models/Booking';
import Trip from '@/models/Trip';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Route, { IRoute } from '@/models/Route'; // 1. Import Route and IRoute

export async function getAdminDashboardStats() {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'admin') {
      return {
        totalRevenue: 0,
        totalBookings: 0,
        todaysBookings: 0,
        pendingBookings: 0,
        totalTrips: 0,
      };
    }

    await dbConnect();

    const revenueResult = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalCost' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const totalBookings = await Booking.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysBookings = await Booking.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
    });

    const pendingBookings = await Booking.countDocuments({
      paymentStatus: 'pending',
    });

    const totalTrips = await Trip.countDocuments({ status: 'scheduled' });

    return {
      totalRevenue,
      totalBookings,
      todaysBookings,
      pendingBookings,
      totalTrips,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);

    return {
      totalRevenue: 0,
      totalBookings: 0,
      todaysBookings: 0,
      pendingBookings: 0,
      totalTrips: 0,
    };
  }
}

export async function getFeaturedRoutes(): Promise<IRoute[]> {
  try {
    await dbConnect();

    const featuredRoutes = await Route.find({ isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    return JSON.parse(JSON.stringify(featuredRoutes));
  } catch (error) {
    console.error('Error fetching featured routes:', error);
    return [];
  }
}
