import { NextResponse } from 'next/server';

export async function GET() {
    // Return empty session since we're using Privy for authentication
    return NextResponse.json({
        user: null,
        expires: null
    });
} 