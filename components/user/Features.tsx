import { Shield, Star, Clock, Wifi } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Safe & Secure',
    description:
      'Professional drivers and well-maintained luxury vehicles for your peace of mind',
  },
  {
    icon: Star,
    title: 'Premium Comfort',
    description:
      'Leather seats, climate control, and refreshments for a first-class experience',
  },
  {
    icon: Clock,
    title: 'Punctual Service',
    description:
      'Reliable schedules and on-time departures to respect your valuable time',
  },
  {
    icon: Wifi,
    title: 'Modern Amenities',
    description:
      'Stay connected with WiFi, USB charging, and entertainment systems',
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-slate-50 w-full justify-center items-center flex">
      <div className="container px-4 ">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Why Choose Our Service
          </h2>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Experience the difference with our premium transport service
            designed for discerning travelers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                <feature.icon className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
