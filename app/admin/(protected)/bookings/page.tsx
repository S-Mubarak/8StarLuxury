/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { IBooking } from '@/models/Booking';
import { format } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Clock,
  DollarSign,
  MoreHorizontal,
  Package,
  Ticket,
  Users,
  XCircle,
} from 'lucide-react';

type PopulatedBooking = IBooking & {
  trip: {
    _id: string;
    route: { _id: string; name: string; segments: unknown[] };
    vehicle: { _id: string; name: string; plateNumber: string };
    driver: { _id: string; firstName: string; lastName: string };
    departureTime: string;
  };
  markedAsPaidBy?: { _id: string; name: string; email: string };
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<PopulatedBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [detailBooking, setDetailBooking] = useState<PopulatedBooking | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [alertAction, setAlertAction] = useState<'paid' | 'cancelled' | null>(
    null
  );
  const [alertBookingId, setAlertBookingId] = useState<string | null>(null);

  const fetchBookings = useCallback(async (page = 1, rowsPerPage = 10) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/bookings?page=${page}&limit=${rowsPerPage}`
      );
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      setBookings(data.data);
      setTotalPages(data.pagination.totalPages);
      setCurrentPage(data.pagination.currentPage);
      setTotalCount(data.pagination.totalCount);
      setLimit(rowsPerPage);
    } catch (error) {
      toast.error('Failed to fetch bookings.');
      setBookings([]);
      setTotalPages(1);
      setCurrentPage(1);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings(currentPage, limit);
  }, [fetchBookings, currentPage, limit]);

  const openAlert = (bookingId: string, action: 'paid' | 'cancelled') => {
    setAlertBookingId(bookingId);
    setAlertAction(action);
  };
  const handleStatusUpdate = async () => {
    if (!alertBookingId || !alertAction) return;
    const originalBooking = bookings.find((b) => b._id === alertBookingId);
    if (!originalBooking) return;
    const originalStatus = originalBooking?.paymentStatus;
    const originalBookingUserFacingId = originalBooking?.bookingId;

    try {
      const res = await fetch(`/api/bookings/${alertBookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: alertAction }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Something went wrong');
      }
      toast.success(`Booking marked as ${alertAction}!`);
      if (alertAction === 'paid' && originalStatus === 'pending') {
        fetch('/api/email/send-ticket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: originalBookingUserFacingId }),
        }).catch((emailError) => {
          console.error(
            `Admin: Failed to trigger email for ${originalBookingUserFacingId}:`,
            emailError
          );
          toast.warning('Confirmation email failed to send.');
        });
        toast.info('Confirmation email sending...');
      }
      fetchBookings(currentPage, limit);
    } catch (error: unknown) {
      //@ts-expect-error ???
      toast.error(error.message);
    } finally {
      setAlertBookingId(null);
      setAlertAction(null);
    }
  };
  const openDetailModal = (booking: PopulatedBooking) => {
    setDetailBooking(booking);
    setIsDetailOpen(true);
  };
  const getStatusVariant = (
    status: string
  ): 'default' | 'destructive' | 'outline' | 'secondary' | 'success' => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'outline';
      case 'failed':
        return 'destructive';
      case 'cancelled':
        return 'secondary';
      default:
        return 'secondary';
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 mr-1 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 mr-1 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 mr-1 text-red-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 mr-1 text-slate-500" />;
      default:
        return null;
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-7 w-7 text-blue-600" />
        <h1 className="text-3xl font-bold text-slate-800">Manage Bookings</h1>
      </div>
      <Card className="shadow-sm border border-slate-200">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-lg font-medium">
            All Bookings ({totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableCaption className="py-4">
              {isLoading
                ? 'Loading...'
                : bookings.length === 0
                  ? 'No bookings found.'
                  : 'A list of recent bookings.'}
            </TableCaption>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="w-[120px]">Booking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Trip</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[120px]">Cost (₦)</TableHead>
                <TableHead className="text-right w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-48 text-center text-slate-500"
                  >
                    Loading bookings...
                  </TableCell>
                </TableRow>
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-48 text-center text-slate-500"
                  >
                    No bookings have been made yet.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow
                    key={booking?._id as string}
                    className="hover:bg-slate-50/50"
                  >
                    <TableCell className="font-mono text-xs text-slate-700">
                      {booking?.bookingId}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm text-slate-900">
                        {booking?.passengers[0].firstName}
                        {booking?.passengers[0].lastName}
                        {booking?.passengers.length > 1 && (
                          <span className="text-slate-500 text-xs ml-1">
                            (+{booking?.passengers.length - 1})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {booking?.passengers[0].email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm text-slate-900">
                        {booking?.trip?.route?.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {booking?.trip?.departureTime
                          ? format(
                              new Date(booking.trip.departureTime),
                              'MMM d, yyyy h:mm a'
                            )
                          : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        //@ts-expect-error ???
                        variant={getStatusVariant(booking?.paymentStatus)}
                        className="capitalize text-xs font-normal"
                      >
                        {booking?.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      ₦{booking?.totalCost.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openDetailModal(booking)}
                          >
                            View Details
                          </DropdownMenuItem>
                          {booking?.paymentStatus === 'pending' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-green-600 focus:text-green-700"
                                onClick={() =>
                                  openAlert(booking?._id as string, 'paid')
                                }
                              >
                                Mark as Paid
                              </DropdownMenuItem>
                            </>
                          )}

                          {booking?.paymentStatus !== 'cancelled' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-700"
                                onClick={() =>
                                  openAlert(booking?._id as string, 'cancelled')
                                }
                              >
                                Cancel Booking
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>

            {totalPages > 1 || bookings.length > 0 ? (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="flex items-center justify-between px-2">
                      <div className="text-sm text-muted-foreground">
                        Total Bookings: {totalCount}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm mr-4">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1 || isLoading}
                        >
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1 || isLoading}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages || isLoading}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                          disabled={currentPage === totalPages || isLoading}
                        >
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
            ) : null}
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader className="border-b pb-4 mb-4">
            <DialogTitle className="text-xl flex items-center gap-2">
              <Ticket className="h-5 w-5 text-blue-600" /> Booking Details
              <span className="ml-2 font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-sm">
                {detailBooking?.bookingId}
              </span>
            </DialogTitle>

            {detailBooking && (
              <div className="flex items-center mt-1">
                {getStatusIcon(detailBooking?.paymentStatus)}
                <span
                  className={`text-sm font-medium capitalize ${
                    detailBooking?.paymentStatus === 'paid'
                      ? 'text-green-700'
                      : detailBooking?.paymentStatus === 'pending'
                        ? 'text-yellow-700'
                        : detailBooking?.paymentStatus === 'failed'
                          ? 'text-red-700'
                          : 'text-slate-600'
                  }`}
                >
                  {detailBooking?.paymentStatus} Booking
                </span>
                <span className="text-xs text-slate-500 ml-2">
                  (Booked on:{' '}
                  {detailBooking?.createdAt
                    ? format(new Date(detailBooking.createdAt), 'PP')
                    : 'N/A'}
                  )
                </span>
              </div>
            )}
          </DialogHeader>
          {detailBooking && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-2 max-h-[70vh] overflow-y-auto text-sm">
              <section className="md:col-span-1 space-y-3 border-r md:pr-6">
                <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 border-b pb-1 mb-2">
                  <CalendarDays className="h-4 w-4 text-slate-500" /> Trip
                  Information
                </h3>
                <div className="flex justify-between">
                  <span className="text-slate-500">Route:</span>
                  <span className="font-medium text-right">
                    {detailBooking?.trip?.route?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Departure:</span>
                  <span className="font-medium text-right">
                    {detailBooking?.trip?.departureTime
                      ? format(
                          new Date(detailBooking.trip.departureTime),
                          'PPp'
                        )
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Segments:</span>
                  <span className="font-medium text-right">
                    {detailBooking?.bookedSegments.map((seg, i) => (
                      <span key={i}>
                        {seg.origin} → {seg.destination}
                        {i < detailBooking?.bookedSegments.length - 1 ? (
                          <br />
                        ) : (
                          ''
                        )}
                      </span>
                    ))}
                  </span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle:</span>
                  <span className="font-medium text-right">
                    {detailBooking?.trip.vehicle.name} (
                    {detailBooking?.trip.vehicle.plateNumber})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Driver:</span>
                  <span className="font-medium text-right">
                    {detailBooking?.trip.driver.firstName}
                    {detailBooking?.trip.driver.lastName}
                  </span>
                </div>
                {detailBooking?.seatNumbers &&
                  detailBooking?.seatNumbers.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Seats:</span>
                      <span className="font-medium text-right">
                        {detailBooking?.seatNumbers.join(', ')}
                      </span>
                    </div>
                  )}
              </section>

              <section className="md:col-span-1 space-y-3 border-r md:pr-6">
                <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 border-b pb-1 mb-2">
                  <Users className="h-4 w-4 text-slate-500" /> Passengers (
                  {detailBooking?.passengers.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {detailBooking?.passengers.map((p, index) => (
                    <div
                      key={index}
                      className="text-xs border rounded p-2 bg-slate-50"
                    >
                      <p>
                        <strong>{index + 1}:</strong> {p.title} {p.firstName}
                        {p.lastName}
                      </p>
                      <p className="text-slate-600">
                        {p.email !== 'N/A' ? p.email : ''}
                        {p.phoneNumber !== 'N/A' ? ` / ${p.phoneNumber}` : ''}
                      </p>
                      <p className="text-slate-600">
                        {p.documentType} - {p.idNumber}
                      </p>
                    </div>
                  ))}
                </div>
                {detailBooking?.bookedAddOns &&
                  detailBooking?.bookedAddOns.length > 0 && (
                    <div className="pt-3 mt-3 border-t">
                      <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 border-b pb-1 mb-2">
                        <Package className="h-4 w-4 text-slate-500" /> Add-Ons
                      </h3>
                      <ul className="list-disc list-inside text-xs space-y-1 pl-1 text-slate-600">
                        {detailBooking?.bookedAddOns.map((addon, i) => (
                          <li key={i}>
                            {addon.name} (₦{addon.price.toLocaleString()})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </section>

              <section className="md:col-span-1 space-y-3">
                <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 border-b pb-1 mb-2">
                  <DollarSign className="h-4 w-4 text-slate-500" /> Payment &
                  Details
                </h3>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Cost:</span>
                  <span className="font-bold text-lg text-slate-900">
                    ₦{detailBooking?.totalCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <Badge
                    //@ts-expect-error ???
                    variant={getStatusVariant(detailBooking?.paymentStatus)}
                    className="capitalize text-xs font-normal"
                  >
                    {detailBooking?.paymentStatus}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Method:</span>
                  <span className="font-medium capitalize">
                    {detailBooking?.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Paystack Ref:</span>
                  <span className="font-medium text-xs break-all text-right">
                    {detailBooking?.paymentRef || 'N/A'}
                  </span>
                </div>
                {detailBooking?.markedAsPaidBy && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Marked Paid By:</span>
                    <span className="font-medium text-right text-xs">
                      {detailBooking?.markedAsPaidBy.name}
                    </span>
                  </div>
                )}
              </section>
            </div>
          )}
          <DialogFooter className="mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!alertAction}
        onOpenChange={() => setAlertAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {alertAction === 'paid'
                ? 'This will mark the booking as paid and trigger a confirmation email. This cannot be undone.'
                : 'This will cancel the booking?. This cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusUpdate}
              className={
                alertAction === 'cancelled'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }
            >
              Confirm {alertAction === 'paid' ? 'Payment' : 'Cancellation'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
