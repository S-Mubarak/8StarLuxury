import Features from '@/components/user/Features';
import Hero from '@/components/user/Hero';
import PopularRoutes from '@/components/user/PopularRoutes';
import { getFeaturedRoutes } from '@/lib/server-side-functions';

export default async function HomePage() {
  const featuredRoutes = await getFeaturedRoutes();

  return (
    <main className="min-h-screen">
      <Hero />
      <Features />

      <PopularRoutes featuredRoutes={featuredRoutes} />
    </main>
  );
}
