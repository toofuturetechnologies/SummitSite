'use client';

console.log('📄 Dashboard page file loaded');

export default function DashboardPage() {
  console.log('🎯 [Dashboard] Rendering component');

  return (
    <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 p-8">
      <div className="max-w-4xl mx-auto bg-summit-800/50 border border-summit-700 rounded-lg p-8">
        <h1 className="text-4xl font-bold text-white mb-4">✅ Dashboard Component Rendered!</h1>
        <p className="text-summit-300 mb-6">
          If you can see this, the component is rendering. No auth checks, no redirects - just pure HTML.
        </p>
        <div className="bg-summit-900/50 p-4 rounded mb-6">
          <p className="text-summit-300 text-sm font-mono">
            Check your browser console for logs starting with [Dashboard]
          </p>
        </div>
        <a
          href="/auth/login"
          className="inline-block bg-summit-600 hover:bg-summit-500 text-white px-6 py-3 rounded font-medium transition"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}
