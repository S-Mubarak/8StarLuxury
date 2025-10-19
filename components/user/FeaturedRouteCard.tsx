import Link from 'next/link';
import Image from 'next/image';
import type { IRoute } from '@/models/Route';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface Props {
  route: IRoute;
}

export default function FeaturedRouteCard({ route }: Props) {
  const start = route.segments[0]?.origin || 'N/A';
  const end = route.segments[route.segments.length - 1]?.destination || 'N/A';

  const searchUrl = `/search?from=${encodeURIComponent(start)}&to=${encodeURIComponent(end)}`;

  return (
    <Link href={searchUrl} className="group">
      <Card className="overflow-hidden transition-all hover:shadow-lg">
        <CardContent className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={route.imageUrl || '/placeholder.svg'}
              alt={route.name}
              layout="fill"
              objectFit="cover"
            />
          </div>
        </CardContent>
        <CardFooter className="p-4 bg-white">
          <div className="w-full">
            <h3 className="text-lg font-semibold">{route.name}</h3>
            <p className="text-sm text-muted-foreground">
              {start} → {end}
            </p>
            <div className="text-sm font-medium text-blue-600 mt-2 flex items-center group-hover:underline">
              Book Now <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
