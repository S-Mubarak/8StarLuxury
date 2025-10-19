/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { IDriver } from '@/models/Driver';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
  TableCaption,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  MoreHorizontal,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
  Edit,
  Trash2,
} from 'lucide-react';

const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters.'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters.'),
  phoneNumber: z.string().min(10, 'Phone number is required.'),
  licenseNumber: z.string().min(5, 'License number is required.'),
});

type DriverFormValues = z.infer<typeof formSchema>;

export default function DriversPage() {
  const [drivers, setDrivers] = useState<IDriver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<IDriver | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      licenseNumber: '',
    },
  });

  const fetchDrivers = useCallback(async (page = 1, rowsPerPage = 10) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/drivers?page=${page}&limit=${rowsPerPage}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setDrivers(data.data);
      setTotalPages(data.pagination.totalPages);
      setCurrentPage(data.pagination.currentPage);
      setTotalCount(data.pagination.totalCount);
      setLimit(rowsPerPage);
    } catch (error) {
      toast.error('Failed to fetch drivers.');
      setDrivers([]);
      setTotalPages(1);
      setCurrentPage(1);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchDrivers(currentPage, limit);
  }, [fetchDrivers, currentPage, limit]);

  const openNewForm = () => {
    setEditingDriver(null);
    form.reset({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      licenseNumber: '',
    });
    setIsDialogOpen(true);
  };
  const openEditForm = (driver: IDriver) => {
    setEditingDriver(driver);
    form.reset(driver);
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: DriverFormValues) => {
    const apiPath = editingDriver
      ? `/api/drivers/${editingDriver._id}`
      : '/api/drivers';
    const method = editingDriver ? 'PUT' : 'POST';
    try {
      const res = await fetch(apiPath, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Something went wrong');
      }
      toast.success(editingDriver ? 'Driver updated!' : 'Driver created!');
      setIsDialogOpen(false);
      fetchDrivers(currentPage, limit);
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const onDelete = async (driverId: string) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;
    try {
      const res = await fetch(`/api/drivers/${driverId}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete');
      }
      toast.success('Driver deleted!');
      const newTotalCount = totalCount - 1;
      const newTotalPages = Math.ceil(newTotalCount / limit) || 1;
      if (currentPage > newTotalPages) {
        fetchDrivers(newTotalPages, limit);
      } else {
        fetchDrivers(newTotalCount === 0 ? 1 : currentPage, limit);
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

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div className="space-y-6">
        {' '}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Users className="h-7 w-7 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-800">
              Manage Drivers
            </h1>
          </div>

          <Button
            onClick={openNewForm}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Driver
          </Button>
        </div>
        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-lg font-medium">
              Driver Roster ({totalCount})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableCaption className="py-4">
                {isLoading
                  ? 'Loading...'
                  : drivers.length === 0
                    ? 'No drivers registered.'
                    : 'A list of all registered drivers.'}
              </TableCaption>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead>Full Name</TableHead>
                  <TableHead className="w-[180px]">Phone Number</TableHead>{' '}
                  <TableHead>License Number</TableHead>
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
                      colSpan={4}
                      className="h-48 text-center text-slate-500"
                    >
                      {' '}
                      Loading drivers...{' '}
                    </TableCell>{' '}
                  </TableRow>
                ) : drivers.length === 0 ? (
                  <TableRow>
                    {' '}
                    <TableCell
                      colSpan={4}
                      className="h-48 text-center text-slate-500"
                    >
                      {' '}
                      No drivers found. Add one using the button above.{' '}
                    </TableCell>{' '}
                  </TableRow>
                ) : (
                  drivers.map((driver) => (
                    <TableRow
                      key={driver._id as string}
                      className="hover:bg-slate-50/50 text-sm"
                    >
                      {' '}
                      <TableCell className="font-medium text-slate-900">
                        {driver.firstName} {driver.lastName}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {driver.phoneNumber}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">
                        {driver.licenseNumber}
                      </TableCell>{' '}
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
                              onClick={() => openEditForm(driver)}
                            >
                              {' '}
                              <Edit className="mr-2 h-4 w-4" /> Edit{' '}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-700"
                              onClick={() => onDelete(driver._id as string)}
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

              {totalPages > 1 || drivers.length > 0 ? (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4}>
                      <div className="flex items-center justify-between px-2">
                        <div className="text-sm text-muted-foreground">
                          {' '}
                          Total Drivers: {totalCount}{' '}
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
        <DialogContent className="sm:max-w-md">
          {' '}
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {editingDriver ? (
                <Edit className="h-5 w-5 text-blue-600" />
              ) : (
                <PlusCircle className="h-5 w-5 text-blue-600" />
              )}
              {editingDriver ? 'Edit Driver' : 'Add New Driver'}
            </DialogTitle>
            <DialogDescription>
              Enter the details for the driver below. All fields are required.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 px-1">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Number *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
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
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Save Driver
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
}
