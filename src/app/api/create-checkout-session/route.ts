import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { db } from "@/lib/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-06-30.basil",
})

// Helper to get matching PDF cover URL based on webp cover
function getMatchingPdfCover(webpUrl: string): string | null {
    if (!webpUrl || typeof webpUrl !== 'string') return null;

    const filename = webpUrl.split('/').pop()?.split('?')[0] || '';
    const baseName = filename.replace('.webp', '').split('-')[0]; // e.g., '3d225dee82fd8faab6116635dbb334d295c0a133'

    return `https://firebasestorage.googleapis.com/v0/b/cslogancom.firebasestorage.app/o/covers%2F${baseName}_Cover.pdf?alt=media`;
}

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text()
        console.log("Raw request body:", rawBody)

        const { orderDetails } = JSON.parse(rawBody)
        console.log("Parsed orderDetails:", orderDetails)

        if (
            !orderDetails.email ||
            !orderDetails.items ||
            !Array.isArray(orderDetails.items) ||
            orderDetails.items.length === 0
        ) {
            return NextResponse.json({ error: "Missing or invalid order data" }, { status: 400 })
        }

        // 🧠 Enhance each item with its .pdf cover version
        const enhancedItems = orderDetails.items.map((item: any) => ({
            ...item,
            coverPdfUrl: getMatchingPdfCover(item.coverUrl),
        }))

        // 🔐 Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: enhancedItems.map((item: any, i: number) => {
                const price = Number(item.price)
                if (isNaN(price)) {
                    throw new Error(`Invalid price at item[${i}]: ${JSON.stringify(item)}`)
                }

                return {
                    price_data: {
                        currency: "gbp",
                        product_data: {
                            name: item.title,
                            description: item.author,
                            images: item.image ? [item.image] : undefined,
                        },
                        unit_amount: Math.round(price * 100),
                    },
                    quantity: item.quantity,
                }
            }),

            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
        })

        console.log("✅ Stripe session created:", session.id)

        // 📝 Save to Firestore with enhanced item info
        await setDoc(doc(db, "orders", session.id), {
            ...orderDetails,
            items: enhancedItems,
            status: "pending",
            sessionId: session.id,
            createdAt: serverTimestamp(),
        })

        console.log("✅ Order saved to Firestore with ID:", session.id)

        return NextResponse.json({ sessionId: session.id })
    } catch (err: any) {
        console.error("🔥 Stripe Checkout session error:", err.message)
        return NextResponse.json({ error: "Failed to create Stripe session" }, { status: 500 })
    }
}
