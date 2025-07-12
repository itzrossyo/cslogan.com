import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY env variable");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
});

export async function POST(request: NextRequest) {
    try {
        const { amount, orderDetails } = await request.json();

        if (!amount || amount <= 0 || !orderDetails?.email) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: "gbp",
            automatic_payment_methods: { enabled: true },
            metadata: {
                orderId: orderDetails.orderId || Date.now().toString(),
                customerEmail: orderDetails.email,
            },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Error creating payment intent:", error);
        return NextResponse.json(
            { error: "Failed to create payment intent" },
            { status: 500 }
        );
    }
}
