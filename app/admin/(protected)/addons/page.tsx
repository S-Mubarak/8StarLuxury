'use client';

import { IAddOn } from '@/models/AddOn';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

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
import { Switch } from '@/components/ui/switch';
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
import { Textarea } from '@/components/ui/textarea';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  MoreHorizontal,
  PackagePlus,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().min(0, 'Price is required.'),
  icon: z.string().optional(),
  //@ts-expect-error ???
  pricingType: z.enum(['per-passenger', 'per-booking'], {
    required_error: 'Pricing type is required.',
  }),
  isActive: z.boolean().default(true),
});
type AddOnFormValues = z.infer<typeof formSchema>;

export default function AddOnsPage() {
  const [addons, setAddons] = useState<IAddOn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState<IAddOn | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const form = useForm<AddOnFormValues>({
    //@ts-expect-error ???
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      icon: '',
      pricingType: 'per-booking',
      isActive: true,
    },
  });

  const fetchAddOns = useCallback(async (page = 1, rowsPerPage = 10) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/addons?page=${page}&limit=${rowsPerPage}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setAddons(data.data);
      setTotalPages(data.pagination.totalPages);
      setCurrentPage(data.pagination.currentPage);
      setTotalCount(data.pagination.totalCount);
      setLimit(rowsPerPage);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to fetch add-ons.');
      setAddons([]);
      setTotalPages(1);
      setCurrentPage(1);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchAddOns(currentPage, limit);
  }, [fetchAddOns, currentPage, limit]);

  const openNewForm = () => {
    setEditingAddOn(null);
    form.reset({
      name: '',
      description: '',
      price: 0,
      icon: '',
      pricingType: 'per-booking',
      isActive: true,
    });
    setIsDialogOpen(true);
  };
  const openEditForm = (addon: IAddOn) => {
    setEditingAddOn(addon);
    form.reset(addon);
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: AddOnFormValues) => {
    const apiPath = editingAddOn
      ? `/api/addons/${editingAddOn._id}`
      : '/api/addons';
    const method = editingAddOn ? 'PUT' : 'POST';
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
      toast.success(editingAddOn ? 'Add-on updated!' : 'Add-on created!');
      setIsDialogOpen(false);
      fetchAddOns(currentPage, limit);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create or update add-on.');
      }
    }
  };
  const onDelete = async (addonId: string) => {
    if (!confirm('Are you sure you want to delete this add-on?')) return;
    try {
      const res = await fetch(`/api/addons/${addonId}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete');
      }
      toast.success('Add-on deleted!');
      const newTotalCount = totalCount - 1;
      const newTotalPages = Math.ceil(newTotalCount / limit) || 1;
      if (currentPage > newTotalPages) {
        fetchAddOns(newTotalPages, limit);
      } else {
        fetchAddOns(newTotalCount === 0 ? 1 : currentPage, limit);
      }
    } catch (error: unknown) {
      toast.error((error as Error).message || 'Failed to delete add-on.');
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getStatusVariant = (
    isActive: boolean
  ): 'default' | 'destructive' | 'outline' | 'secondary' | 'success' => {
    return isActive ? 'success' : 'secondary';
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <PackagePlus className="h-7 w-7 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-800">
              Manage Add-Ons
            </h1>
          </div>

          <Button
            onClick={openNewForm}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Add-On
          </Button>
        </div>
        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-lg font-medium">
              Available Add-Ons ({totalCount})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableCaption className="py-4">
                {isLoading
                  ? 'Loading...'
                  : addons.length === 0
                    ? 'No add-ons created yet.'
                    : 'List of optional services and packages.'}
              </TableCaption>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[120px]">Price (₦)</TableHead>
                  <TableHead className="w-[150px]">Pricing Type</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="text-right w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-48 text-center text-slate-500"
                    >
                      Loading add-ons...
                    </TableCell>
                  </TableRow>
                ) : addons.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-48 text-center text-slate-500"
                    >
                      No add-ons found. Create one using the button above.
                    </TableCell>
                  </TableRow>
                ) : (
                  addons.map((addon) => (
                    <TableRow
                      key={addon._id as string}
                      className="hover:bg-slate-50/50 text-sm"
                    >
                      <TableCell className="font-medium text-slate-900">
                        {addon.name}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        ₦{addon.price.toLocaleString()}
                      </TableCell>
                      <TableCell className="capitalize text-slate-600 text-xs">
                        {addon.pricingType.replace('-', ' ')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          //@ts-expect-error ???
                          variant={getStatusVariant(addon.isActive)}
                          className="capitalize text-xs font-normal"
                        >
                          {addon.isActive ? 'Active' : 'Inactive'}
                        </Badge>
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
                              onClick={() => openEditForm(addon)}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-700"
                              onClick={() => onDelete(addon._id as string)}
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

              {totalPages > 1 || addons.length > 0 ? (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="flex items-center justify-between px-2">
                        <div className="text-sm text-muted-foreground">
                          Total Add-Ons: {totalCount}
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {editingAddOn ? (
                <Edit className="h-5 w-5 text-blue-600" />
              ) : (
                <PlusCircle className="h-5 w-5 text-blue-600" />
              )}
              {editingAddOn ? 'Edit Add-On' : 'Add New Add-On'}
            </DialogTitle>
            <DialogDescription>
              Provide the details for the optional service or package.
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
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Hotel Arrangement"
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the service..."
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <FormField
                    //@ts-expect-error ???
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₦) *</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    //@ts-expect-error ???
                    control={form.control}
                    name="pricingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pricing Type *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="per-booking">
                              Per Booking
                            </SelectItem>
                            <SelectItem value="per-passenger">
                              Per Passenger
                            </SelectItem>
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
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., hotel, plane (optional)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Enter a Lucide icon name (optional).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  //@ts-expect-error ???
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-slate-50/50 space-x-3 space-y-0">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center gap-1">
                          {field.value ? (
                            <ToggleRight className="text-green-600" />
                          ) : (
                            <ToggleLeft className="text-slate-400" />
                          )}
                          Active Status
                        </FormLabel>
                        <FormDescription>
                          Should this add-on be available for users to select?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
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
                    Save Add-On
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
