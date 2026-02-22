import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function GuidesPage() {
  const { data: guides, error } = await supabase
    .from('guides')
    .select('*')
    .eq('is_verified', true)
    .limit(20)
    .order('rating', { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">Expert Guides</h1>
          <div className="bg-red-900/50 text-red-100 p-4 rounded-lg">
            <p>Error loading guides: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900">
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-white mb-2">Expert Guides</h1>
        <p className="text-summit-100 mb-8">
          Meet verified mountain guides from around the world
        </p>

        {!guides || guides.length === 0 ? (
          <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-12 text-center">
            <p className="text-summit-200 text-lg mb-4">
              No verified guides yet. Be the first!
            </p>
            <Link
              href="/become-a-guide"
              className="inline-block bg-summit-600 hover:bg-summit-500 text-white px-6 py-3 rounded-lg transition"
            >
              Become a Guide
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide: any) => (
              <div
                key={guide.id}
                className="bg-summit-800/50 border border-summit-700 rounded-lg p-6 hover:border-summit-600 transition"
              >
                {guide.avatar_url && (
                  <img
                    src={guide.avatar_url}
                    alt={guide.name}
                    className="w-24 h-24 rounded-full mb-4 object-cover"
                  />
                )}
                <h3 className="text-xl font-semibold text-white mb-2">
                  {guide.name}
                </h3>
                <p className="text-summit-300 text-sm mb-4">
                  {guide.bio?.substring(0, 100)}...
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-yellow-400">★ {guide.rating}</span>
                  <span className="text-summit-400 text-sm">
                    ({guide.review_count} reviews)
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {guide.specialties?.slice(0, 3).map((spec: string) => (
                    <span
                      key={spec}
                      className="bg-summit-700 text-summit-100 px-2 py-1 rounded text-xs"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/guides/${guide.id}`}
                  className="block w-full text-center bg-summit-600 hover:bg-summit-500 text-white py-2 rounded transition"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
