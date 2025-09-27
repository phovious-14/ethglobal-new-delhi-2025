import { NextResponse } from 'next/server';

export async function POST() {
    // Return empty response since we're using Privy for authentication
    return NextResponse.json({});
} 