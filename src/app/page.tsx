import Link from 'next/link'
import { Mountain, Search, Shield, Star, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Mountain className="h-8 w-8 text-summit-700" />
            <span className="text-xl font-bold text-summit-900">Summit</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/trips"
              className="text-sm font-medium text-gray-600 hover:text-summit-700"
            >
              Browse Trips
            </Link>
            <Link
              href="/guides"
              className="text-sm font-medium text-gray-600 hover:text-summit-700"
            >
              Find Guides
            </Link>
            <Link
              href="/become-a-guide"
              className="text-sm font-medium text-gray-600 hover:text-summit-700"
            >
              Become a Guide
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-summit-700"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-summit-700 px-4 py-2 text-sm font-medium text-white hover:bg-summit-800"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-summit-900 via-summit-800 to-summit-700">
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find Your Guide.
              <br />
              <span className="text-summit-300">Reach Your Peak.</span>
            </h1>
            <p className="mt-6 text-lg text-summit-100">
              Book guided outdoor adventures with certified mountain guides.
              From Colorado's 14ers to backcountry skiing, find your next
              adventure.
            </p>

            {/* Search Box */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Where do you want to go?"
                  className="w-full rounded-lg border-0 py-4 pl-12 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-summit-600"
                />
              </div>
              <button className="rounded-lg bg-white px-8 py-4 font-semibold text-summit-700 hover:bg-summit-50">
                Search
              </button>
            </div>

            {/* Quick Links */}
            <div className="mt-8 flex flex-wrap gap-3">
              {['Mountaineering', 'Rock Climbing', 'Ski Touring', '14ers'].map(
                (activity) => (
                  <Link
                    key={activity}
                    href={`/trips?activity=${activity.toLowerCase().replace(' ', '_')}`}
                    className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
                  >
                    {activity}
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose Summit?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              We connect you with the best certified guides for unforgettable
              adventures.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-summit-100">
                <Shield className="h-6 w-6 text-summit-700" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">
                Certified Guides Only
              </h3>
              <p className="mt-2 text-gray-600">
                Every guide is verified with AMGA, IFMGA, or equivalent
                certifications. Your safety is our priority.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-summit-100">
                <Star className="h-6 w-6 text-summit-700" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">
                Verified Reviews
              </h3>
              <p className="mt-2 text-gray-600">
                All reviews come from travelers who actually completed trips.
                Real experiences, real feedback.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-summit-100">
                <Users className="h-6 w-6 text-summit-700" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">
                Fair for Guides
              </h3>
              <p className="mt-2 text-gray-600">
                We take just 12% — the lowest in the industry. Guides keep more
                of what they earn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-summit-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Are you a guide?
              </h2>
              <p className="mt-2 text-lg text-gray-600">
                Join Summit and reach more adventurers. Lower fees, faster
                payouts.
              </p>
            </div>
            <Link
              href="/become-a-guide"
              className="rounded-lg bg-summit-700 px-8 py-4 font-semibold text-white hover:bg-summit-800"
            >
              Become a Guide
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Mountain className="h-6 w-6 text-summit-700" />
              <span className="font-semibold text-gray-900">Summit</span>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Summit. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
