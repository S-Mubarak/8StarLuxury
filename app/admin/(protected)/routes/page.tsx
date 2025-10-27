/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { IRoute } from '@/models/Route';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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

import {
  Bus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  Map,
  MoreHorizontal,
  Plane,
  PlusCircle,
  Star,
  Trash2,
} from 'lucide-react';

const imageOptions = [
  { value: '/abuja.jpg', label: 'Abuja' },
  {
    value: '/airplane-interior-luxury.jpg',
    label: 'Airplane Interior',
  },
  {
    value: '/luxury-mountain-road-aerial-view.jpg',
    label: 'Mountain Road (Aerial)',
  },
  { value: '/jalingo.jpg', label: 'Jalingo' },
  {
    value: '/luxury-suv-mountain-road.jpg',
    label: 'Mountain Road (SUV)',
  },
  {
    value: '/mambilla-plateau-scenic-view.jpg',
    label: 'Mambilla Plateau',
  },
];
const segmentSchema = z.object({
  origin: z.string().min(2, 'Origin is required.'),
  destination: z.string().min(2, 'Destination is required.'),
  cost: z.coerce.number().min(0, 'Cost is required.'),
  //@ts-expect-error ???
  mode: z.enum(['road', 'air'], { required_error: 'Mode is required.' }),
  durationEstimate: z.string().optional(),
});
const routeSchema = z.object({
  name: z.string().min(3, 'Route name is required.'),
  //@ts-expect-error ???
  imageUrl: z.string({ required_error: 'Image is required.' }),
  isFeatured: z.boolean().default(false),
  segments: z.array(segmentSchema).min(1, 'At least one segment is required.'),
});
type RouteFormValues = z.infer<typeof routeSchema>;

export default function RoutesPage() {
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<IRoute | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const form = useForm<RouteFormValues>({
    //@ts-expect-error ???
    resolver: zodResolver(routeSchema),
    defaultValues: {
      name: '',
      imageUrl: undefined,
      isFeatured: false,
      segments: [
        {
          origin: '',
          destination: '',
          cost: 0,
          mode: 'road',
          durationEstimate: '',
        },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'segments',
  });

  const fetchRoutes = useCallback(async (page = 1, rowsPerPage = 10) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/routes?page=${page}&limit=${rowsPerPage}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRoutes(data.data);
      setTotalPages(data.pagination.totalPages);
      setCurrentPage(data.pagination.currentPage);
      setTotalCount(data.pagination.totalCount);
      setLimit(rowsPerPage);
    } catch (error) {
      toast.error('Failed to fetch routes.');
      setRoutes([]);
      setTotalPages(1);
      setCurrentPage(1);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchRoutes(currentPage, limit);
  }, [fetchRoutes, currentPage, limit]);

  const openNewForm = () => {
    setEditingRoute(null);
    form.reset({
      name: '',
      imageUrl: undefined,
      isFeatured: false,
      segments: [
        {
          origin: '',
          destination: '',
          cost: 0,
          mode: 'road',
          durationEstimate: '',
        },
      ],
    });
    setIsDialogOpen(true);
  };
  const openEditForm = (route: IRoute) => {
    setEditingRoute(route);
    form.reset({
      name: route.name,
      imageUrl: route.imageUrl,
      isFeatured: route.isFeatured,
      segments: route.segments,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: RouteFormValues) => {
    const apiPath = editingRoute
      ? `/api/routes/${editingRoute._id}`
      : '/api/routes';
    const method = editingRoute ? 'PUT' : 'POST';
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
      toast.success(editingRoute ? 'Route updated!' : 'Route created!');
      setIsDialogOpen(false);
      fetchRoutes(currentPage, limit);
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const onDelete = async (routeId: string) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    try {
      const res = await fetch(`/api/routes/${routeId}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete');
      }
      toast.success('Route deleted!');
      const newTotalCount = totalCount - 1;
      const newTotalPages = Math.ceil(newTotalCount / limit) || 1;
      if (currentPage > newTotalPages) {
        fetchRoutes(newTotalPages, limit);
      } else {
        fetchRoutes(newTotalCount === 0 ? 1 : currentPage, limit);
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
            <Map className="h-7 w-7 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-800">Manage Routes</h1>
          </div>

          <Button
            onClick={openNewForm}
            className="bg-[#96351e] hover:bg-[#dbb98f]"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Route
          </Button>
        </div>
        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-lg font-medium">
              All Routes ({totalCount})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableCaption className="py-4">
                {isLoading
                  ? 'Loading...'
                  : routes.length === 0
                    ? 'No routes created yet.'
                    : 'A list of available routes.'}
              </TableCaption>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead>Name</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead className="w-[100px]">Featured</TableHead>{' '}
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
                      Loading routes...{' '}
                    </TableCell>{' '}
                  </TableRow>
                ) : routes.length === 0 ? (
                  <TableRow>
                    {' '}
                    <TableCell
                      colSpan={4}
                      className="h-48 text-center text-slate-500"
                    >
                      {' '}
                      No routes found. Create one using the button above.{' '}
                    </TableCell>{' '}
                  </TableRow>
                ) : (
                  routes.map((route) => (
                    <TableRow
                      key={route._id as string}
                      className="hover:bg-slate-50/50 text-sm"
                    >
                      {' '}
                      <TableCell className="font-medium text-slate-900">
                        {route.name}
                      </TableCell>
                      <TableCell className="text-slate-600 text-xs">
                        {' '}
                        {route.segments.map((s, i) => (
                          <span key={i}>
                            {s.origin}{' '}
                            {i === route.segments.length - 1
                              ? ` → ${s.destination}`
                              : '→ '}
                          </span>
                        ))}
                      </TableCell>
                      <TableCell>
                        {route.isFeatured ? (
                          <Badge
                            variant="outline"
                            className="text-xs font-normal border-amber-400 text-amber-700"
                          >
                            <Star className="h-3 w-3 mr-1" /> Featured
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400">No</span>
                        )}
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
                              onClick={() => openEditForm(route)}
                            >
                              {' '}
                              <Edit className="mr-2 h-4 w-4" /> Edit{' '}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-700"
                              onClick={() => onDelete(route._id as string)}
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

              {totalPages > 1 || routes.length > 0 ? (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4}>
                      <div className="flex items-center justify-between px-2">
                        <div className="text-sm text-muted-foreground">
                          {' '}
                          Total Routes: {totalCount}{' '}
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
        <DialogContent className="sm:max-w-3xl">
          {' '}
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {editingRoute ? (
                <Edit className="h-5 w-5 text-blue-600" />
              ) : (
                <PlusCircle className="h-5 w-5 text-blue-600" />
              )}
              {editingRoute ? 'Edit Route' : 'Add New Route'}
            </DialogTitle>
            <DialogDescription>
              Define the name, image, featured status, and segments for this
              route.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 px-1 max-h-[70vh] overflow-y-auto">
            {' '}
            <Form {...form}>
              <form
                //@ts-expect-error ???
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    //@ts-expect-error ???
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Route Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Lagos-Kano Express"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    //@ts-expect-error ???
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Route Image *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an image" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {imageOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  //@ts-expect-error ???
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-slate-50/50 space-x-3 space-y-0">
                      {' '}
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Featured Status
                        </FormLabel>
                        <FormDescription>
                          Show this route prominently on the homepage?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="scale-110"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-lg font-semibold text-slate-800">
                      Route Segments *
                    </FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        append({
                          origin: '',
                          destination: '',
                          cost: 0,
                          mode: 'road',
                          durationEstimate: '',
                        })
                      }
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Segment
                    </Button>
                  </div>
                  <FormDescription className="text-xs">
                    Define the stops and legs of the journey in order.
                  </FormDescription>

                  {fields.length === 0 && (
                    <p className="text-sm text-red-600 py-4 text-center">
                      Please add at least one segment.
                    </p>
                  )}

                  <div className="space-y-3">
                    {fields.map((item, index) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-12 gap-x-3 gap-y-2 p-4 border rounded-md bg-slate-50/70 relative items-end"
                      >
                        <FormField
                          //@ts-expect-error ???
                          control={form.control}
                          name={`segments.${index}.origin`}
                          render={({ field }) => (
                            <FormItem className="col-span-6 sm:col-span-3">
                              <FormLabel className="text-xs">
                                Origin *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Lagos"
                                  {...field}
                                  className="bg-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          //@ts-expect-error ???
                          control={form.control}
                          name={`segments.${index}.destination`}
                          render={({ field }) => (
                            <FormItem className="col-span-6 sm:col-span-3">
                              <FormLabel className="text-xs">
                                Destination *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Abuja"
                                  {...field}
                                  className="bg-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          //@ts-expect-error ???
                          control={form.control}
                          name={`segments.${index}.cost`}
                          render={({ field }) => (
                            <FormItem className="col-span-4 sm:col-span-2">
                              <FormLabel className="text-xs">
                                Cost (₦) *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  className="bg-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          //@ts-expect-error ???
                          control={form.control}
                          name={`segments.${index}.mode`}
                          render={({ field }) => (
                            <FormItem className="col-span-4 sm:col-span-2">
                              <FormLabel className="text-xs">Mode *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="road">
                                    <div className="flex items-center">
                                      <Bus className="h-4 w-4 mr-2" /> Road
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="air">
                                    <div className="flex items-center">
                                      <Plane className="h-4 w-4 mr-2" /> Air
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="col-span-4 sm:col-span-2 flex justify-end">
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              className="text-red-500 hover:text-red-700 h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

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
                    Save Route
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
