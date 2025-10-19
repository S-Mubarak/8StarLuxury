import TripSearchForm from './TripSearchForm';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[url('/luxury-mountain-road-aerial-view.jpg')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

      <div className="container relative z-10 px-4 py-20">
        <div className="mx-auto max-w-4xl text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <span className="text-amber-400 text-sm font-medium">
              Premium Travel Experience
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 text-balance">
            Luxury on the Road
          </h1>

          <p className="text-xl text-slate-300 mb-8 text-pretty max-w-2xl mx-auto">
            Redefining travel with comfort, class, and care. Experience premium
            rides through Nigeria&apos;s most scenic routes.
          </p>
        </div>

        <div className="mx-auto max-w-xl">
          {' '}
          <TripSearchForm />
        </div>
      </div>
    </section>
  );
}
