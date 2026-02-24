'use client';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">✅ Test Page Works!</h1>
        <p className="text-white mb-8">If you can see this, routing is working fine.</p>
        <a
          href="/dashboard"
          className="bg-white text-blue-600 px-6 py-3 rounded font-bold"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
