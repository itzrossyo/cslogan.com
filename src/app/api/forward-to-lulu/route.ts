// /app/api/webhook/route.ts
import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-10-28.acacia", // Updated to latest API version
});

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature")!;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    // Verify webhook signature
    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
        console.error("❌ Webhook signature verification failed:", err.message);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log("✅ Payment confirmed:", session.id, session.customer_email);

        // Extract order details from session.metadata (recommended approach)
        const orderDetails = session.metadata || {};
        if (!orderDetails.email || !orderDetails.items) {
            console.error("❌ Missing required metadata in session:", session.id);
            return new NextResponse("Missing order details in session metadata", {
                status: 400,
            });
        }

        // Parse items from metadata (stored as JSON string)
        let items;
        try {
            items = JSON.parse(orderDetails.items);
            if (!Array.isArray(items) || items.length === 0) {
                throw new Error("Invalid items format");
            }
        } catch (err) {
            console.error("❌ Invalid items metadata:", err.message);
            return new NextResponse("Invalid items metadata", { status: 400 });
        }

        // Construct order payload for Lulu
        const luluOrder = {
            email: session.customer_email || orderDetails.email,
            firstName: orderDetails.firstName || "Unknown",
            lastName: orderDetails.lastName || "Customer",
            address: orderDetails.address || "",
            city: orderDetails.city || "",
            state: orderDetails.state || "",
            zipCode: orderDetails.zipCode || "",
            country: orderDetails.country || "GB",
            phone: orderDetails.phone || "",
            paymentIntentId: session.payment_intent as string,
            items: items.map((item) => ({
                id: item.id || `item-${Date.now()}`,
                quantity: parseInt(item.quantity, 10) || 1,
                coverUrl: item.coverUrl || "https://example.com/default-cover.pdf",
                interiorUrl:
                    item.interiorUrl || "https://example.com/default-interior.pdf",
            })),
        };

        // Forward order to Lulu API route
        try {
            const luluRes = await fetch(
                `${process.env.NEXT_PUBLIC_SITE_URL}/api/forward-to-lulu`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(luluOrder),
                }
            );

            const luluData = await luluRes.json();
            if (!luluRes.ok) {
                console.error("❌ Lulu API error:", luluData);
                return new NextResponse(
                    `Failed to forward order to Lulu: ${luluData.error}`,
                    { status: luluRes.status }
                );
            }

            console.log("📦 Lulu order created:", luluData.luluOrderId);
            return new NextResponse(
                JSON.stringify({
                    success: true,
                    luluOrderId: luluData.luluOrderId,
                    paymentIntentId: session.payment_intent,
                }),
                { status: 200 }
            );
        } catch (err) {
            console.error("❌ Error forwarding to Lulu:", err.message);
            return new NextResponse(`Error forwarding to Lulu: ${err.message}`, {
                status: 500,
            });
        }
    }

    // Acknowledge other events
    return new NextResponse("Webhook received", { status: 200 });
}