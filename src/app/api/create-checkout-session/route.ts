import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-06-20",
})

export async function POST(req: NextRequest) {
    const { orderDetails } = await req.json()

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: orderDetails.items.map((item: any) => ({
                price_data: {
                    currency: "gbp",
                    product_data: {
                        name: item.title,
                        description: item.author,
                        images: item.image ? [item.image] : undefined,
                    },
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: item.quantity,
            })),
            customer_email: orderDetails.email,
            shipping_address_collection: {
                allowed_countries: ["GB"],
            },
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
        })

        return NextResponse.json({ sessionId: session.id })
    } catch (err) {
        console.error("Stripe Checkout session error:", err)
        return NextResponse.json({ error: "Failed to create Stripe session" }, { status: 500 })
    }
}
