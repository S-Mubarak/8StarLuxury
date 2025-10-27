import type React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface PolicyLayoutProps {
  title: string;
  effectiveDate: string;
  children: React.ReactNode;
}

export default function PolicyLayout({
  title,
  effectiveDate,
  children,
}: PolicyLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-slate-950 text-white py-12">
        <div className="container px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-2">{title}</h1>
          <p className="text-slate-400">Effective Date: {effectiveDate}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-slate max-w-none">{children}</div>
        </div>
      </div>
    </div>
  );
}
