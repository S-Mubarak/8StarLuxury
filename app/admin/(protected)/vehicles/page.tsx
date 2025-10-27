'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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
import { CarType, IVehicle } from '@/models/Vehicle';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Bus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  MoreHorizontal,
  PlusCircle,
  Trash2,
  Wrench,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const carTypes: CarType[] = ['sedan', 'suv', 'van', 'compact', 'luxury'];

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  plateNumber: z.string().min(3, 'Plate number is required.'),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1.'),
  amenities: z.string().optional(),
  //@ts-expect-error TS2322: Type '"sedan"' is not assignable to type 'CarType'.
  carType: z.enum(carTypes, { required_error: 'Car type is required.' }),
});
type VehicleFormValues = z.infer<typeof formSchema>;

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<IVehicle | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const form = useForm<VehicleFormValues>({
    //@ts-expect-error ???
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      plateNumber: '',
      capacity: 1,
      amenities: '',
      carType: 'suv',
    },
  });

  const fetchVehicles = useCallback(async (page = 1, rowsPerPage = 10) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/vehicles?page=${page}&limit=${rowsPerPage}`
      );
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setVehicles(data.data);
      setTotalPages(data.pagination.totalPages);
      setCurrentPage(data.pagination.currentPage);
      setTotalCount(data.pagination.totalCount);
      setLimit(rowsPerPage);
    } catch (error: any) {
      toast.error('Failed to fetch vehicles.');
      console.error(error);

      setVehicles([]);
      setTotalPages(1);
      setCurrentPage(1);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchVehicles(currentPage, limit);
  }, [fetchVehicles, currentPage, limit]);

  const openNewForm = () => {
    setEditingVehicle(null);
    form.reset({
      name: '',
      plateNumber: '',
      capacity: 1,
      amenities: '',
      carType: 'suv',
    });
    setIsDialogOpen(true);
  };
  const openEditForm = (vehicle: IVehicle) => {
    setEditingVehicle(vehicle);
    form.reset({
      name: vehicle.name,
      plateNumber: vehicle.plateNumber,
      capacity: vehicle.capacity,
      amenities: vehicle.amenities.join(', '),
      carType: vehicle.carType,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: VehicleFormValues) => {
    const apiPath = editingVehicle
      ? `/api/vehicles/${editingVehicle._id}`
      : '/api/vehicles';
    const method = editingVehicle ? 'PUT' : 'POST';
    const dataToSubmit = {
      ...values,
      amenities: values.amenities
        ? values.amenities
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
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
      toast.success(editingVehicle ? 'Vehicle updated!' : 'Vehicle created!');
      setIsDialogOpen(false);
      fetchVehicles(currentPage, limit);
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const onDelete = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete');
      }
      toast.success('Vehicle deleted!');
      const newTotalCount = totalCount - 1;
      const newTotalPages = Math.ceil(newTotalCount / limit) || 1;
      if (currentPage > newTotalPages) {
        fetchVehicles(newTotalPages, limit);
      } else {
        fetchVehicles(newTotalCount === 0 ? 1 : currentPage, limit);
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
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bus className="h-7 w-7 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-800">
              Manage Vehicles
            </h1>
          </div>
          <Button
            onClick={openNewForm}
            className="bg-[#96351e] hover:bg-[#dbb98f]"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Vehicle
          </Button>
        </div>
        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-lg font-medium">
              Vehicle Fleet ({totalCount})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableCaption className="py-4">
                {isLoading
                  ? 'Loading...'
                  : vehicles.length === 0
                    ? 'No vehicles added yet.'
                    : 'List of registered vehicles.'}
              </TableCaption>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead>Name</TableHead>
                  <TableHead>Plate Number</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amenities</TableHead>
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
                      {' '}
                      Loading vehicles...{' '}
                    </TableCell>
                  </TableRow>
                ) : vehicles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-48 text-center text-slate-500"
                    >
                      {' '}
                      No vehicles found.{' '}
                    </TableCell>
                  </TableRow>
                ) : (
                  vehicles.map((vehicle) => (
                    <TableRow
                      key={vehicle._id as string}
                      className="hover:bg-slate-50/50 text-sm"
                    >
                      <TableCell className="font-medium text-slate-900">
                        {vehicle.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">
                        {vehicle.plateNumber}
                      </TableCell>
                      <TableCell className="text-slate-600 text-center">
                        {vehicle.capacity}
                      </TableCell>
                      <TableCell className="text-slate-600 capitalize">
                        {vehicle.carType}
                      </TableCell>{' '}
                      <TableCell className="text-slate-600 text-xs">
                        {vehicle.amenities && vehicle.amenities.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {vehicle.amenities.map((a) => (
                              <Badge
                                key={a}
                                variant="outline"
                                className="font-normal"
                              >
                                {a}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
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
                              onClick={() => openEditForm(vehicle)}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-700"
                              onClick={() => onDelete(vehicle._id as string)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="flex items-center justify-between px-2">
                      <div className="text-sm text-muted-foreground">
                        {' '}
                        Total Vehicles: {totalCount}{' '}
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
            </Table>
          </CardContent>
        </Card>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {editingVehicle ? (
                <Edit className="h-5 w-5 text-blue-600" />
              ) : (
                <PlusCircle className="h-5 w-5 text-blue-600" />
              )}
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </DialogTitle>
            <DialogDescription>
              Enter the details for the vehicle below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 px-1">
            <Form {...form}>
              <form
                //@ts-expect-error ???
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  //@ts-expect-error ???
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Luxury Sprinter 1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    //@ts-expect-error ???
                    control={form.control}
                    name="plateNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plate Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., ABC-123-XYZ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    //@ts-expect-error ???
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity (Seats) *</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  //@ts-expect-error ???
                  control={form.control}
                  name="carType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Car Type *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a car type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {carTypes.map((type) => (
                            <SelectItem
                              key={type}
                              value={type}
                              className="capitalize"
                            >
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  //@ts-expect-error ???
                  control={form.control}
                  name="amenities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Wrench className="h-3 w-3 text-slate-500" /> Amenities
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="WiFi, AC, Refreshment" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Separate amenities with a comma (,).
                      </FormDescription>
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
                    Save Vehicle
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
