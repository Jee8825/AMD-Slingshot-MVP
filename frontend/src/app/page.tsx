import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ShieldCheck, MapPin, BarChart3, Clock } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 select-none">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 md:px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <ShieldCheck className="h-6 w-6 text-green-600" />
            <span>DigiGram Pro</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/transparency" className="text-sm font-medium hover:text-green-600 transition-colors">
              Ledger
            </Link>
            <Link href="/login">
              <Button variant="outline" className="border-slate-200 hidden sm:flex">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-green-600 hover:bg-green-700 text-white">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-24 md:py-32 lg:py-48 bg-gradient-to-b from-white to-slate-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-slate-900">
                  Digital Governance for <span className="text-green-600">Modern Villages</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-slate-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  DigiGram Pro bridges the gap between citizens and officials. Report grievances instantly with geotagging, track public project funds on an immutable ledger, and ensure task completion with AI-powered verification.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 min-w-[300px]">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white gap-2">
                    Citizen Portal <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full border-slate-200">
                    Official Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-slate-900 mb-4">Core Features</h2>
              <p className="max-w-[700px] mx-auto text-slate-500 md:text-lg">Experience the next generation of rural administration tools designed to end corruption and prioritize rapid development.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg bg-slate-50/50">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                    <MapPin className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Geo-Tagged Grievances</h3>
                  <p className="text-slate-500">
                    Citizens can submit civic issues with precise GPS coordinates, allowing officials to view all problems directly on an interactive map.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-slate-50/50">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                    <BarChart3 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Immutable Audit Ledger</h3>
                  <p className="text-slate-500">
                    All project funding allocations are tracked cryptographically. Prevent fund diversion with a fully transparent public financial trail.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-slate-50/50">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-green-100 rounded-full text-green-600">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">AI Image Verification</h3>
                  <p className="text-slate-500">
                    Officials cannot close tasks without uploading photographic proof. Our Gemini-powered AI verifies completion autonomously.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 border-t bg-slate-50">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
          <p>© 2026 DigiGram Pro. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/transparency" className="hover:text-slate-900 transition-colors">Public Transparency Ledger</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
