import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function TripsPage() {
  const { data: trips, error } = await supabase
    .from('trips')
    .select('*, guides(name, rating)')
    .limit(20);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">Trips</h1>
          <div className="bg-red-900/50 text-red-100 p-4 rounded-lg">
            <p>Error loading trips: {error.message}</p>
            <p className="text-sm mt-2">Check that Supabase is properly configured and has data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900">
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-white mb-2">Available Trips</h1>
        <p className="text-summit-100 mb-8">Find your next adventure</p>

        {!trips || trips.length === 0 ? (
          <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-12 text-center">
            <p className="text-summit-200 text-lg mb-4">No trips available yet.</p>
            <Link
              href="/become-a-guide"
              className="inline-block bg-summit-600 hover:bg-summit-500 text-white px-6 py-3 rounded-lg transition"
            >
              Become a Guide
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip: any) => (
              <div
                key={trip.id}
                className="bg-summit-800/50 border border-summit-700 rounded-lg overflow-hidden hover:border-summit-600 transition"
              >
                {trip.image_url && (
                  <img
                    src={trip.image_url}
                    alt={trip.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {trip.title}
                  </h3>
                  <p className="text-summit-300 text-sm mb-3">
                    {trip.description?.substring(0, 100)}...
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-summit-100 font-bold">
                      ${trip.price_per_person}
                    </span>
                    <span className="text-summit-300 text-sm">
                      {trip.duration_days} days
                    </span>
                  </div>
                  <Link
                    href={`/trips/${trip.id}`}
                    className="block w-full text-center bg-summit-600 hover:bg-summit-500 text-white py-2 rounded transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
