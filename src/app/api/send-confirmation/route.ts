import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const orderDetails = await request.json()

        // Format order for Lulu API
        const luluOrder = {
            contact_email: orderDetails.email,
            external_id: `bookhaven-${Date.now()}`,
            items: orderDetails.items.map((item:any) => ({
                external_id: item.id,
                printable_normalization: {
                    cover: {
                        source_url: item.coverUrl || "https://example.com/default-cover.jpg",
                    },
                    interior: {
                        source_url: item.interiorUrl || "https://example.com/default-interior.pdf",
                    },
                },
                quantity: item.quantity,
            })),
            shipping_address: {
                name: `${orderDetails.firstName} ${orderDetails.lastName}`,
                street1: orderDetails.address,
                city: orderDetails.city,
                state_code: orderDetails.state,
                postcode: orderDetails.zipCode,
                country_code: orderDetails.country,
                phone_number: orderDetails.phone,
            },
        }

        console.log("Forwarding order to Lulu:", luluOrder)

        // Here you would make the actual API call to Lulu
        // const response = await fetch('https://api.lulu.com/print-jobs/', {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': `Bearer ${process.env.LULU_API_TOKEN}`,
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify(luluOrder)
        // })

        return NextResponse.json({ success: true, luluOrderId: "mock-lulu-id" })
    } catch (error) {
        console.error("Error forwarding to Lulu:", error)
        return NextResponse.json({ error: "Failed to forward order to Lulu" }, { status: 500 })
    }
}
