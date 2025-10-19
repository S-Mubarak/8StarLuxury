'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface SeatSelectionProps {
  capacity: number;
  bookedSeats: string[];
  selectedSeats: string[];
  onSeatSelect: (seat: string) => void;
  passengerCount: number;
}

const generateLayout = (capacity: number) => {
  const rows = Math.ceil(capacity / 4);
  const layout = [];
  let seatNum = 1;
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < 4; j++) {
      if (seatNum <= capacity) {
        const seatId = `${i + 1}${String.fromCharCode(65 + j)}`;
        row.push(seatId);
        seatNum++;
      }
    }
    layout.push(row);
  }
  return layout;
};

export default function SeatSelection({
  capacity,
  bookedSeats,
  selectedSeats,
  onSeatSelect,
  passengerCount,
}: SeatSelectionProps) {
  const seatLayout = generateLayout(capacity);

  const handleSelect = (seatId: string) => {
    if (bookedSeats.includes(seatId)) {
      toast.error('This seat is already booked.');
      return;
    }

    if (selectedSeats.includes(seatId)) {
      onSeatSelect(seatId);
      return;
    }

    if (selectedSeats.length >= passengerCount) {
      toast.warning(
        `You can only select ${passengerCount} seat(s). Please deselect another seat first.`
      );
      return;
    }

    onSeatSelect(seatId);
  };

  const seatsLeftToSelect = passengerCount - selectedSeats.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Your Seat(s)</CardTitle>
        <CardDescription>
          Please select {passengerCount} seat(s).{' '}
          {seatsLeftToSelect > 0 ? (
            <span className="font-semibold text-blue-600">
              {seatsLeftToSelect} remaining.
            </span>
          ) : (
            <span className="font-semibold text-green-600">
              All seats selected!
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="bg-gray-200 p-4 rounded-lg w-full max-w-xs">
          <div className="bg-white p-2 rounded flex justify-center mb-4">
            <p className="font-bold">FRONT (DRIVER)</p>
          </div>
          <div className="space-y-2">
            {seatLayout.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-between items-center">
                {/* Aisle in the middle */}
                <div className="flex gap-2">
                  <Seat
                    id={row[0]}
                    isBooked={bookedSeats.includes(row[0])}
                    isSelected={selectedSeats.includes(row[0])}
                    onClick={handleSelect}
                  />
                  {row[1] && (
                    <Seat
                      id={row[1]}
                      isBooked={bookedSeats.includes(row[1])}
                      isSelected={selectedSeats.includes(row[1])}
                      onClick={handleSelect}
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  {row[2] && (
                    <Seat
                      id={row[2]}
                      isBooked={bookedSeats.includes(row[2])}
                      isSelected={selectedSeats.includes(row[2])}
                      onClick={handleSelect}
                    />
                  )}
                  {row[3] && (
                    <Seat
                      id={row[3]}
                      isBooked={bookedSeats.includes(row[3])}
                      isSelected={selectedSeats.includes(row[3])}
                      onClick={handleSelect}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SeatProps {
  id: string;
  isBooked: boolean;
  isSelected: boolean;
  onClick: (id: string) => void;
}

function Seat({ id, isBooked, isSelected, onClick }: SeatProps) {
  if (!id) return <div className="w-10 h-10" />;

  const getClasses = () => {
    if (isBooked) return 'bg-gray-400 text-gray-600 cursor-not-allowed';
    if (isSelected) return 'bg-blue-600 text-white';
    return 'bg-green-200 text-green-800 hover:bg-green-300 cursor-pointer';
  };

  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      disabled={isBooked}
      className={`w-10 h-10 rounded text-xs font-bold flex items-center justify-center transition-colors ${getClasses()}`}
    >
      {isBooked ? <X className="h-5 w-5" /> : id}
    </button>
  );
}
