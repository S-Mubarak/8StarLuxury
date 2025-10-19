import Link from 'next/link';
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Car,
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 flex items-center justify-center">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              {/* Logo Placeholder - You can replace this with an actual logo component/image */}
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <Car className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-white">
                8 Star Luxury
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Redefining travel with comfort, class, and care. Experience
              premium rides.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="hover:text-blue-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="hover:text-blue-400 transition-colors"
                >
                  Find Trips
                </Link>
              </li>
              <li>
                <Link
                  href="/bookings"
                  className="hover:text-blue-400 transition-colors"
                >
                  My Booking
                </Link>
              </li>
              {/* Add About/Contact links if those pages exist */}
              {/* <li><Link href="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li> */}
              {/* <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact</Link></li> */}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="hover:text-blue-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-blue-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>+234 123 456 7890</span> {/* Update phone */}
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>support@8starluxury.com</span> {/* Update email */}
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Abuja, Nigeria</span> {/* Update address */}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">
            © {currentYear} 8 Star Luxury Travels. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Update social media links */}
            <Link href="#" className="hover:text-blue-400 transition-colors">
              <Facebook className="h-5 w-5" />
            </Link>
            <Link href="#" className="hover:text-blue-400 transition-colors">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="hover:text-blue-400 transition-colors">
              <Instagram className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
