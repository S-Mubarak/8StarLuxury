'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Asterisk as Steering } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '../ui/card';

export type CarType = 'sedan' | 'suv' | 'van' | 'compact' | 'luxury';

interface SeatSelectorProps {
  capacity: number;
  bookedSeats: number[];
  selectedSeats: number[];
  onSeatSelect: (seatNumber: number) => void;
  passengerCount: number;
  carType: CarType;
}

interface SeatLayout {
  rows: number;
  seatsPerRow: number[];
}

const CAR_LAYOUTS: Record<CarType, SeatLayout> = {
  sedan: { rows: 3, seatsPerRow: [2, 2, 2] },
  suv: { rows: 3, seatsPerRow: [2, 3, 3] },
  van: { rows: 4, seatsPerRow: [2, 3, 3, 4] },
  compact: { rows: 2, seatsPerRow: [2, 2] },
  luxury: { rows: 3, seatsPerRow: [2, 2, 2] },
};

const generateSeatData = (layout: SeatLayout, capacity: number) => {
  const seatArray: Array<{
    number: number;
    row: number;
    col: number;
    label: string;
    isDriver: boolean;
  }> = [];
  let seatNumber = 1;

  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.seatsPerRow[row]; col++) {
      const isDriver = row === 0 && col === 0;

      if (!isDriver && seatNumber <= capacity) {
        const label = String.fromCharCode(65 + row) + (col + 1);
        seatArray.push({
          number: seatNumber,
          row,
          col,
          label,
          isDriver: false,
        });
        seatNumber++;
      } else if (isDriver) {
        seatArray.push({
          number: 0,
          row,
          col,
          label: 'Driver',
          isDriver: true,
        });
      }
    }
  }
  return seatArray;
};

export default function SeatSelector({
  capacity,
  bookedSeats,
  selectedSeats,
  onSeatSelect,
  passengerCount,
  carType,
}: SeatSelectorProps) {
  const layout = CAR_LAYOUTS[carType];

  const seats = useMemo(
    () => generateSeatData(layout, capacity),
    [capacity, layout]
  );

  const handleSeatClick = (seatNumber: number, isDriver: boolean) => {
    if (isDriver) return;
    if (bookedSeats.includes(seatNumber)) {
      toast.error('This seat is already booked.');
      return;
    }
    const isSelected = selectedSeats.includes(seatNumber);
    if (!isSelected && selectedSeats.length >= passengerCount) {
      toast.warning(`You have already selected ${passengerCount} seat(s).`);
      return;
    }
    onSeatSelect(seatNumber);
  };

  const getSeatStatus = (seatNumber: number, isDriver: boolean) => {
    if (isDriver) return 'driver';
    if (bookedSeats.includes(seatNumber)) return 'booked';
    if (selectedSeats.includes(seatNumber)) return 'selected';
    return 'available';
  };

  const seatsByRow = useMemo(() => {
    const grouped: Record<number, typeof seats> = {};
    seats.forEach((seat) => {
      if (!grouped[seat.row]) {
        grouped[seat.row] = [];
      }
      grouped[seat.row].push(seat);
    });
    return grouped;
  }, [seats]);

  return (
    <Card className="w-full mx-auto bg-white shadow-sm">
      <CardHeader>
        <h2 className="text-2xl font-bold text-foreground">
          Select Your Seats
        </h2>
        <p className="text-sm text-muted-foreground">
          {carType.charAt(0).toUpperCase() + carType.slice(1)} • {capacity}{' '}
          seats available • {passengerCount} passenger
          {passengerCount !== 1 ? 's' : ''}
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 p-4 bg-muted rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
              A1
            </div>
            <span className="text-sm text-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs font-bold ring-2 ring-green-300">
              B2
            </div>
            <span className="text-sm text-foreground">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center text-gray-600 text-xs font-bold opacity-60">
              C1
            </div>
            <span className="text-sm text-foreground">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-white">
              <Steering size={18} />
            </div>
            <span className="text-sm text-foreground">Driver</span>
          </div>
        </div>

        <div className="border-2 border-border rounded-xl p-6 sm:p-8 shadow-inner bg-slate-50/50">
          <div className="text-center mb-10">
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-full text-sm font-semibold text-blue-700">
              ↑ Front of Vehicle ↑
            </div>
          </div>

          <div className="space-y-6">
            {Array.from({ length: layout.rows }).map((_, rowIndex) => {
              const rowSeats = seatsByRow[rowIndex] || [];
              const seatsInRow = layout.seatsPerRow[rowIndex];
              const rowLetter = String.fromCharCode(65 + rowIndex);

              const leftSeats = rowSeats.slice(0, Math.ceil(seatsInRow / 2));
              const rightSeats = rowSeats.slice(Math.ceil(seatsInRow / 2));

              return (
                <div
                  key={rowIndex}
                  className="flex items-center justify-center gap-4"
                >
                  <div className="w-8 text-center">
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                      {rowLetter}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    {leftSeats.map((seat) => {
                      const status = getSeatStatus(seat.number, seat.isDriver);
                      const isDisabled =
                        status === 'booked' ||
                        status === 'driver' ||
                        (status === 'available' &&
                          selectedSeats.length >= passengerCount &&
                          !selectedSeats.includes(seat.number));
                      return (
                        <button
                          key={seat.number || 'driver'}
                          onClick={() =>
                            handleSeatClick(seat.number, seat.isDriver)
                          }
                          disabled={isDisabled}
                          className={cn(
                            'w-12 h-12 rounded-lg font-bold text-xs transition-all duration-200 flex items-center justify-center relative',
                            status === 'available' &&
                              'bg-blue-500 text-white hover:bg-[#96351e] cursor-pointer shadow-md hover:shadow-lg hover:scale-105',
                            status === 'selected' &&
                              'bg-green-500 text-white ring-2 ring-green-300 scale-105 shadow-lg',
                            status === 'booked' &&
                              'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60',
                            status === 'driver' &&
                              'bg-amber-500 text-white cursor-not-allowed',
                            isDisabled &&
                              status === 'available' &&
                              'opacity-50 cursor-not-allowed'
                          )}
                          title={
                            seat.isDriver
                              ? 'Driver Seat'
                              : status === 'booked'
                                ? 'Seat booked'
                                : status === 'selected'
                                  ? 'Seat selected'
                                  : 'Available seat'
                          }
                        >
                          {seat.isDriver ? <Steering size={16} /> : seat.label}
                        </button>
                      );
                    })}
                  </div>
                  {seatsInRow > 2 && <div className="w-6" />}
                  <div className="flex gap-3">
                    {rightSeats.map((seat) => {
                      const status = getSeatStatus(seat.number, seat.isDriver);
                      const isDisabled =
                        status === 'booked' ||
                        (status === 'available' &&
                          selectedSeats.length >= passengerCount &&
                          !selectedSeats.includes(seat.number));
                      return (
                        <button
                          key={seat.number}
                          onClick={() =>
                            handleSeatClick(seat.number, seat.isDriver)
                          }
                          disabled={isDisabled}
                          className={cn(
                            'w-12 h-12 rounded-lg font-bold text-xs transition-all duration-200 flex items-center justify-center',
                            status === 'available' &&
                              'bg-blue-500 text-white hover:bg-[#96351e] cursor-pointer shadow-md hover:shadow-lg hover:scale-105',
                            status === 'selected' &&
                              'bg-green-500 text-white ring-2 ring-green-300 scale-105 shadow-lg',
                            status === 'booked' &&
                              'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60',
                            isDisabled &&
                              status === 'available' &&
                              'opacity-50 cursor-not-allowed'
                          )}
                          title={
                            status === 'booked'
                              ? 'Seat booked'
                              : status === 'selected'
                                ? 'Seat selected'
                                : 'Available seat'
                          }
                        >
                          {seat.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="w-8" />
                </div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-full text-sm font-semibold text-blue-700">
              ↓ Back of Vehicle ↓
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                Seats Selected
              </p>
              <p className="text-2xl font-bold text-foreground">
                {selectedSeats.length}{' '}
                <span className="text-lg text-muted-foreground">
                  / {passengerCount}
                </span>
              </p>
            </div>
            {selectedSeats.length > 0 && (
              <div className="text-left sm:text-right">
                <p className="text-sm text-muted-foreground font-medium">
                  Your Seats
                </p>
                <p className="text-lg font-bold text-green-600">
                  {selectedSeats
                    .map((num) => seats.find((s) => s.number === num)?.label)
                    .sort()
                    .join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
