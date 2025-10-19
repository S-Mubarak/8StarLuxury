/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MapPin, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function TripSearchForm() {
  const [origins, setOrigins] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);

  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');

  const [isOriginsLoading, setIsOriginsLoading] = useState(true);
  const [isDestinationsLoading, setIsDestinationsLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchOrigins = async () => {
      try {
        setIsOriginsLoading(true);
        const res = await fetch('/api/locations/origins');
        if (!res.ok) throw new Error('Failed to fetch origins');
        const data = await res.json();
        setOrigins(data);
      } catch (error) {
        toast.error('Could not load locations.');
      } finally {
        setIsOriginsLoading(false);
      }
    };
    fetchOrigins();
  }, []);

  const handleOriginChange = async (origin: string) => {
    setSelectedOrigin(origin);
    setSelectedDestination('');
    setDestinations([]);

    if (!origin) return;

    try {
      setIsDestinationsLoading(true);
      const res = await fetch(`/api/locations/destinations?from=${origin}`);
      if (!res.ok) throw new Error('Failed to fetch destinations');
      const data = await res.json();
      setDestinations(data);
    } catch (error) {
      toast.error('Could not load destinations for this location.');
    } finally {
      setIsDestinationsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrigin || !selectedDestination) {
      toast.error('Please select both an origin and a destination.');
      return;
    }
    router.push(`/search?from=${selectedOrigin}&to=${selectedDestination}`);
  };

  return (
    <Card className="w-full max-w-2xl shadow-2xl border-slate-200 bg-white">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-900">
              Plan Your Luxury Escape
            </h3>
            <p className="text-slate-500 text-sm">
              Select your departure and destination to explore premium routes
            </p>
          </div>

          {/* Form Fields Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* --- Origin Select --- */}
            <div className="space-y-3">
              <Label
                htmlFor="source"
                className="text-sm font-semibold text-slate-700 flex items-center gap-2"
              >
                <MapPin className="h-4 w-4 text-blue-600" />
                Departure
              </Label>
              <Select
                value={selectedOrigin}
                onValueChange={handleOriginChange}
                disabled={isOriginsLoading}
              >
                <SelectTrigger
                  id="source"
                  className="border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-blue-600 h-11 rounded-lg"
                >
                  <SelectValue
                    placeholder={
                      isOriginsLoading
                        ? 'Loading locations...'
                        : 'Select departure city'
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  {origins.map((origin) => (
                    <SelectItem
                      key={origin}
                      value={origin}
                      className="text-slate-900"
                    >
                      {origin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* --- Destination Select --- */}
            <div className="space-y-3">
              <Label
                htmlFor="destination"
                className="text-sm font-semibold text-slate-700 flex items-center gap-2"
              >
                <MapPin className="h-4 w-4 text-blue-600" />
                Destination
              </Label>
              <Select
                value={selectedDestination}
                onValueChange={setSelectedDestination}
                disabled={!selectedOrigin || isDestinationsLoading}
              >
                <SelectTrigger
                  id="destination"
                  className="border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-blue-600 h-11 rounded-lg disabled:opacity-50"
                >
                  <SelectValue
                    placeholder={
                      isDestinationsLoading
                        ? 'Loading...'
                        : 'Select destination city'
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  {destinations.map((destination) => (
                    <SelectItem
                      key={destination}
                      value={destination}
                      className="text-slate-900"
                    >
                      {destination}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Button */}
          <Button
            type="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            disabled={!selectedOrigin || !selectedDestination}
          >
            <Search className="h-5 w-5" />
            Explore Luxury Routes
          </Button>

          {/* Divider with text */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-xs text-slate-400 font-medium">
              Premium Selection
            </span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Info text */}
          <p className="text-center text-xs text-slate-500">
            Discover curated luxury travel experiences tailored to your
            preferences
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
