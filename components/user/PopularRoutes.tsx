import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IRoute } from '@/models/Route';
import { ArrowRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Props {
  featuredRoutes: IRoute[];
}

export default function PopularRoutes({ featuredRoutes }: Props) {
  return (
    <section className="py-20 bg-white justify-center items-center flex">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Featured Routes
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover our premium routes
          </p>
        </div>

        {featuredRoutes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featuredRoutes.map((route) => {
              const start = route.segments[0]?.origin || 'N/A';
              const end =
                route.segments[route.segments.length - 1]?.destination || 'N/A';

              const approxPrice = route.segments.reduce(
                (sum, seg) => sum + seg.cost,
                0
              );
              const searchUrl = `/search?from=${encodeURIComponent(start)}&to=${encodeURIComponent(end)}`;

              return (
                <Card
                  key={route._id as string}
                  className="overflow-hidden border-slate-200 hover:shadow-xl transition-shadow group"
                >
                  <Link href={searchUrl}>
                    <div className="relative h-48 bg-slate-200">
                      <Image
                        src={route.imageUrl || '/placeholder.svg'}
                        alt={route.name}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 text-slate-600 mb-3">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">{start}</span>
                        <ArrowRight className="h-4 w-4" />
                        <span className="font-medium">{end}</span>
                      </div>

                      <h3 className="text-lg font-semibold text-slate-900 mb-4">
                        {route.name}
                      </h3>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600">
                            Starting from
                          </p>
                          <p className="text-2xl font-bold text-slate-900">
                            ₦{approxPrice.toLocaleString()}
                          </p>
                        </div>
                        <Button
                          asChild
                          className="bg-slate-900 hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span>
                            Book Now{' '}
                            <ArrowRight className="inline ml-1 h-4 w-4" />
                          </span>
                        </Button>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            No featured routes available at the moment. Check back soon!
          </p>
        )}
      </div>
    </section>
  );
}
