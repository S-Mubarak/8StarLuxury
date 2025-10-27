import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-[#e2dbd1] backdrop-blur supports-[backdrop-filter]:bg-[#e2dbd1]">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-20">
        {' '}
        <Link href="/" className="flex items-center space-x-2 mr-6">
          {' '}
          <div className=" rounded-md bg-gradient-to-br flex items-center justify-center">
            <Image
              src="/applogo.png"
              alt="8 Star Luxury Logo"
              width={100}
              height={100}
              /* fill={true} */
            />
          </div>
          <span className="font-bold text-lg sm:inline-block"> </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm lg:gap-6">
          {' '}
          <Link
            href="/"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Home
          </Link>
          <Link
            href="/bookings"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Find Booking
          </Link>
        </nav>
      </div>
    </header>
  );
}
