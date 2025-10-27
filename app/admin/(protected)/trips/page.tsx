/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { IDriver } from '@/models/Driver';
import { IRoute } from '@/models/Route';
import { ITrip } from '@/models/Trip';
import { IVehicle } from '@/models/Vehicle';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  MoreHorizontal,
  PlusCircle,
  Route as RouteIcon,
  Trash2,
} from 'lucide-react';

import { cn } from '@/lib/utils';

const formSchema = z.object({
  route: z.string().min(1, 'Route is required.'),
  vehicle: z.string().min(1, 'Vehicle is required.'),
  driver: z.string().min(1, 'Driver is required.'),
  //@ts-expect-error ???
  departureDate: z.date({ required_error: 'Departure date is required.' }),
  departureTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time (HH:MM)'),
  status: z.enum(['scheduled', 'departed', 'completed', 'cancelled']),
});
type TripFormValues = z.infer<typeof formSchema>;

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<ITrip | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [drivers, setDrivers] = useState<IDriver[]>([]);

  const form = useForm<TripFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      route: undefined,
      vehicle: undefined,
      driver: undefined,
      departureDate: undefined,
      departureTime: '09:00',
      status: 'scheduled',
    },
  });

  const fetchTrips = useCallback(async (page = 1, rowsPerPage = 10) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/trips?page=${page}&limit=${rowsPerPage}`);
      if (!res.ok) throw new Error('Failed to fetch trips');
      const data = await res.json();
      setTrips(data.data);
      setTotalPages(data.pagination.totalPages);
      setCurrentPage(data.pagination.currentPage);
      setTotalCount(data.pagination.totalCount);
      setLimit(rowsPerPage);
    } catch (error) {
      toast.error('Failed to fetch trips.');
      setTrips([]);
      setTotalPages(1);
      setCurrentPage(1);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);
  const fetchRelatedData = useCallback(async () => {
    setIsFormLoading(true);
    try {
      const [routesRes, vehiclesRes, driversRes] = await Promise.all([
        fetch('/api/routes?limit=1000'),
        fetch('/api/vehicles?limit=1000'),
        fetch('/api/drivers?limit=1000'),
      ]);
      const routesData = await routesRes.json();
      const vehiclesData = await vehiclesRes.json();
      const driversData = await driversRes.json();
      setRoutes(routesData.data || []);
      setVehicles(vehiclesData.data || []);
      setDrivers(driversData.data || []);
    } catch (error) {
      toast.error('Failed to load data for form dropdowns.');
    } finally {
      setIsFormLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchTrips(currentPage, limit);
  }, [fetchTrips, currentPage, limit]);
  useEffect(() => {
    fetchRelatedData();
  }, [fetchRelatedData]);

  const openNewForm = () => {
    setEditingTrip(null);
    form.reset({
      route: undefined,
      vehicle: undefined,
      driver: undefined,
      departureDate: new Date(),
      departureTime: '09:00',
      status: 'scheduled',
    });
    setIsDialogOpen(true);
  };
  const openEditForm = (trip: any) => {
    setEditingTrip(trip);
    const departure = new Date(trip.departureTime);
    form.reset({
      route: trip.route._id,
      vehicle: trip.vehicle._id,
      driver: trip.driver._id,
      departureDate: departure,
      departureTime: format(departure, 'HH:mm'),
      status: trip.status,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: TripFormValues) => {
    const apiPath = editingTrip
      ? `/api/trips/${editingTrip._id}`
      : '/api/trips';
    const method = editingTrip ? 'PUT' : 'POST';
    const [hours, minutes] = values.departureTime.split(':').map(Number);
    const combinedDateTime = new Date(values.departureDate);
    combinedDateTime.setHours(hours, minutes, 0, 0);
    const dataToSubmit = {
      route: values.route,
      vehicle: values.vehicle,
      driver: values.driver,
      departureTime: combinedDateTime.toISOString(),
      status: values.status,
    };
    try {
      const res = await fetch(apiPath, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Something went wrong');
      }
      toast.success(editingTrip ? 'Trip updated!' : 'Trip created!');
      setIsDialogOpen(false);
      fetchTrips(currentPage, limit);
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const onDelete = async (tripId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this trip? This cannot be undone.'
      )
    )
      return;
    try {
      const res = await fetch(`/api/trips/${tripId}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete');
      }
      toast.success('Trip deleted!');
      const newTotalCount = totalCount - 1;
      const newTotalPages = Math.ceil(newTotalCount / limit) || 1;
      if (currentPage > newTotalPages) {
        fetchTrips(newTotalPages, limit);
      } else {
        fetchTrips(newTotalCount === 0 ? 1 : currentPage, limit);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getStatusVariant = (
    status: string
  ): 'default' | 'destructive' | 'outline' | 'secondary' | 'success' => {
    switch (status) {
      case 'scheduled':
        return 'default';
      case 'departed':
        return 'outline';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div className="space-y-6">
        {' '}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <RouteIcon className="h-7 w-7 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-800">Manage Trips</h1>
          </div>

          <Button
            onClick={openNewForm}
            className="bg-[#96351e] hover:bg-[#dbb98f]"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Schedule New Trip
          </Button>
        </div>
        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-lg font-medium">
              Scheduled & Past Trips ({totalCount})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableCaption className="py-4">
                {isLoading
                  ? 'Loading...'
                  : trips.length === 0
                    ? 'No trips scheduled.'
                    : 'A list of scheduled trips.'}
              </TableCaption>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead>Route</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>{' '}
                  <TableHead className="text-right w-[80px]">
                    Actions
                  </TableHead>{' '}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    {' '}
                    <TableCell
                      colSpan={6}
                      className="h-48 text-center text-slate-500"
                    >
                      {' '}
                      Loading trips...{' '}
                    </TableCell>{' '}
                  </TableRow>
                ) : trips.length === 0 ? (
                  <TableRow>
                    {' '}
                    <TableCell
                      colSpan={6}
                      className="h-48 text-center text-slate-500"
                    >
                      {' '}
                      No trips found. Schedule one using the button above.{' '}
                    </TableCell>{' '}
                  </TableRow>
                ) : (
                  trips.map((trip) => (
                    <TableRow
                      key={trip._id}
                      className="hover:bg-slate-50/50 text-sm"
                    >
                      {' '}
                      <TableCell className="font-medium text-slate-900">
                        {trip.route?.name ?? 'N/A'}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {format(
                          new Date(trip.departureTime),
                          'MMM d, yyyy h:mm a'
                        )}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {trip.vehicle?.name ?? 'N/A'}{' '}
                        <span className="text-xs text-slate-400">
                          ({trip.vehicle?.plateNumber ?? 'N/A'})
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {trip.driver?.firstName ?? ''}{' '}
                        {trip.driver?.lastName ?? 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          //@ts-expect-error ???
                          variant={getStatusVariant(trip.status)}
                          className="capitalize text-xs font-normal"
                        >
                          {trip.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                            >
                              {' '}
                              <MoreHorizontal className="h-4 w-4" />{' '}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openEditForm(trip)}
                            >
                              {' '}
                              <Edit className="mr-2 h-4 w-4" /> Edit{' '}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-700"
                              onClick={() => onDelete(trip._id)}
                            >
                              {' '}
                              <Trash2 className="mr-2 h-4 w-4" /> Delete{' '}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>

              {totalPages > 1 || trips.length > 0 ? (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="flex items-center justify-between px-2">
                        <div className="text-sm text-muted-foreground">
                          {' '}
                          Total Trips: {totalCount}{' '}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm mr-4">
                            {' '}
                            Page {currentPage} of {totalPages}{' '}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1 || isLoading}
                          >
                            {' '}
                            <ChevronsLeft className="h-4 w-4" />{' '}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || isLoading}
                          >
                            {' '}
                            <ChevronLeft className="h-4 w-4" />{' '}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || isLoading}
                          >
                            {' '}
                            <ChevronRight className="h-4 w-4" />{' '}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages || isLoading}
                          >
                            {' '}
                            <ChevronsRight className="h-4 w-4" />{' '}
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
        <DialogContent className="sm:max-w-lg">
          {' '}
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {editingTrip ? (
                <Edit className="h-5 w-5 text-blue-600" />
              ) : (
                <PlusCircle className="h-5 w-5 text-blue-600" />
              )}
              {editingTrip ? 'Edit Trip' : 'Schedule New Trip'}
            </DialogTitle>
            <DialogDescription>
              Select the route, vehicle, driver, and departure time.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 px-1">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="route"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Route</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isFormLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isFormLoading ? 'Loading...' : 'Select a route'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {routes.map((r) => (
                            <SelectItem
                              key={r._id as string}
                              value={r._id as string}
                            >
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehicle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isFormLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isFormLoading
                                  ? 'Loading...'
                                  : 'Select a vehicle'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicles.map((v) => (
                            <SelectItem
                              key={v._id as string}
                              value={v._id as string}
                            >
                              {v.name} ({v.plateNumber})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="driver"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driver</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isFormLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isFormLoading ? 'Loading...' : 'Select a driver'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {drivers.map((d) => (
                            <SelectItem
                              key={d._id as string}
                              value={d._id as string}
                            >
                              {d.firstName} {d.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {' '}
                  <FormField
                    control={form.control}
                    name="departureDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Departure Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="departureTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time (HH:MM)</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="departed">Departed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-5">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>

                  <Button
                    type="submit"
                    className="bg-[#96351e] hover:bg-[#dbb98f]"
                  >
                    Save Trip
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </div>{' '}
    </Dialog>
  );
}
