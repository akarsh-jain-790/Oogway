import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 3) {
        return NextResponse.json({ features: [] });
    }

    try {
        const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`);
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching from Photon API:', error);
        return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
    }
}
