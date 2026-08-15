import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { email } = body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: true, message: 'Unsubscribed successfully (Dev Sandbox mode).' },
        { status: 200 }
      );
    }

    // 1. First check if the contact exists in Brevo
    const checkRes = await fetch(
      `https://api.brevo.com/v3/contacts/${encodeURIComponent(cleanEmail)}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
        },
      }
    );

    if (checkRes.status === 404) {
      return NextResponse.json(
        {
          success: false,
          notFound: true,
          message: 'This email was never subscribed to DailyVaultRates.',
        },
        { status: 404 }
      );
    }

    const checkData = await checkRes.json().catch(() => ({}));
    if (checkData?.code === 'document_not_found') {
      return NextResponse.json(
        {
          success: false,
          notFound: true,
          message: 'This email was never subscribed to DailyVaultRates.',
        },
        { status: 404 }
      );
    }

    if (!checkRes.ok) {
      console.error('Brevo check contact error:', checkData);
      return NextResponse.json(
        { error: 'Failed to verify email with our mailing provider.' },
        { status: 502 }
      );
    }

    // 2. Contact exists — delete contact from Brevo & remove from list 2
    // First remove from list 2
    await fetch(
      `https://api.brevo.com/v3/contacts/lists/2/contacts/remove`,
      {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({ emails: [cleanEmail] }),
      }
    ).catch(() => {});

    // Delete contact completely from Brevo
    const deleteRes = await fetch(
      `https://api.brevo.com/v3/contacts/${encodeURIComponent(cleanEmail)}`,
      {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
        },
      }
    );

    if (!deleteRes.ok && deleteRes.status !== 404) {
      const errData = await deleteRes.json().catch(() => ({}));
      console.error('Brevo delete contact error:', errData);
      return NextResponse.json(
        { error: 'Failed to unsubscribe contact. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `${cleanEmail} has been unsubscribed. You won't receive any more digest emails.`,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Unsubscribe endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error processing unsubscribe.' },
      { status: 500 }
    );
  }
}
