import { type NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/firebase'
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-06-30.basil",
})

export async function POST(req: NextRequest) {
    console.log("🚀 /api/confirm-payment triggered")

    try {
        const { sessionId } = await req.json()
        console.log("👉 sessionId from client:", sessionId)

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent'],
        })

        const email = session.customer_details?.email
        const paymentIntentId =
            typeof session.payment_intent === 'string'
                ? session.payment_intent
                : session.payment_intent?.id

        console.log("🧾 Stripe session details:", { email, paymentIntentId })

        const docRef = doc(db, 'orders', sessionId)
        const snap = await getDoc(docRef)

        if (!snap.exists()) {
            console.error("❌ Firestore order not found for sessionId:", sessionId)
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        await updateDoc(docRef, {
            status: 'success',
            paymentIntentId,
            updatedAt: serverTimestamp(),
        })

        console.log("✅ Order updated in Firestore:", sessionId)

        return NextResponse.json({
            success: true,
            email,
            paymentIntentId,
        })
    } catch (err: unknown) {
        console.error("🔥 Error in confirm-payment:", err instanceof Error ? err.message : err)
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
