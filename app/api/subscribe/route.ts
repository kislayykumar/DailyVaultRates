import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email } = body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      console.warn('BREVO_API_KEY environment variable is not configured.');
      return NextResponse.json(
        {
          success: true,
          message: 'Subscribed successfully (Dev Sandbox mode). Configure BREVO_API_KEY for live Brevo sync.',
        },
        { status: 200 }
      );
    }

    // Call Brevo Contacts API v3 to create or update contact
    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        email: cleanEmail,
        attributes: {
          FIRSTNAME: name ? name.trim() : 'Subscriber',
        },
        listIds: [2], // Brevo Contact List ID 2
        updateEnabled: true,
        emailBlacklisted: false, // Ensure contact receives emails even if previously blacklisted
      }),
    });

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.json().catch(() => ({}));
      console.error('Brevo API Error:', errorData);

      if (errorData?.code === 'duplicate_parameter') {
        return NextResponse.json(
          { success: true, message: 'You are already subscribed to daily rate digests!' },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: errorData?.message || 'Failed to register subscription with Brevo.' },
        { status: brevoResponse.status }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Successfully subscribed to the DailyVaultRates Digest!' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Subscription Endpoint Error:', error);
    return NextResponse.json(
      { error: 'Internal server error processing subscription.' },
      { status: 500 }
    );
  }
}
