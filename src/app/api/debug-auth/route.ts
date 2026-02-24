import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Log all cookies
    const cookies = request.cookies.getAll();
    const authCookies = cookies.filter((c) => c.name.includes('supabase') || c.name.includes('auth'));

    return NextResponse.json({
      message: 'Auth debug',
      cookies: {
        all: cookies.length,
        auth: authCookies.map((c) => ({ name: c.name, hasValue: !!c.value })),
      },
      headers: {
        authorization: !!request.headers.get('authorization'),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error' },
      { status: 500 }
    );
  }
}
