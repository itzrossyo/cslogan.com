// /app/api/webhook/route.ts (Next.js 13+)
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature")!;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
        console.error("❌ Webhook Error:", err);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log("✅ Stripe payment confirmed:", session);

        // Simulate order payload (store this in session.metadata or Firestore in production)
        const mockOrder = {
            email: session.customer_email,
            firstName: "John",
            lastName: "Doe",
            address: "123 Example St",
            city: "London",
            state: "LND",
            zipCode: "EC1A1BB",
            country: "GB",
            phone: "+441234567890",
            items: [
                {
                    id: "book123",
                    quantity: 1,
                    title: "Sample Book",
                    coverUrl: "https://example.com/book-cover.pdf",
                    interiorUrl: "https://example.com/book-interior.pdf",
                },
            ],
        };

        // Forward order to Lulu
        const luluRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/forward-to-lulu`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mockOrder),
        });

        const luluData = await luluRes.json();
        console.log("📦 Lulu response:", luluData);
    }

    return new NextResponse("Webhook received", { status: 200 });
}
