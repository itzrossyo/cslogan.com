// /components/checkout-form.tsx
"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CartItem {
    id: string;
    title: string;
    author: string;
    image?: string;
    price: number;
    quantity: number;
    description: string;
    formats: string[];
    isFree: boolean;
    pdfUrl?: string;
    coverUrl?: string;
    interiorUrl?: string;
}

export function CheckoutForm() {
    const { cartItems } = useCart();
    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        address: "",
        address2: "",
        city: "",
        state: "",
        zipCode: "",
        country: "GB",
        phone: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const total = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );


    const handleSubmit = async (e:any) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const orderDetails = {
                ...formData,
                items: cartItems.map((item) => ({
                    ...item,
                    coverUrl: item.coverUrl || "https://example.com/default-cover.pdf",
                    interiorUrl: item.interiorUrl || item.pdfUrl || "https://example.com/default-interior.pdf",
                })),
            };
            console.log("Sending orderDetails:", JSON.stringify({ orderDetails }, null, 2));

            const res = await fetch("/api/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderDetails }), // Wrap in { orderDetails }
            });

            const data = await res.json();
            console.log("API response:", data);

            if (!res.ok) {
                throw new Error(data.error || "Failed to create checkout session");
            }

            const { sessionId } = data;
            if (!sessionId) {
                throw new Error("Failed to create checkout session");
            }

            const stripe = await stripePromise;
            if (!stripe) {
                throw new Error("Stripe failed to initialize.");
            }
            await stripe.redirectToCheckout({ sessionId });

        } catch (error) {
            if (error instanceof Error) {
                console.error("Stripe Checkout redirect error:", error.message, error);
                alert(`Checkout failed: ${error.message}`);
            } else {
                console.error("Unknown error during Stripe checkout:", error);
                alert("Checkout failed due to an unknown error.");
            }
        } finally {
            setIsLoading(false);
        }

    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                        }
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                        }
                        required
                    />
                </div>
            </div>
            <div>
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                />
            </div>
            <div>
                <Label htmlFor="address">Address</Label>
                <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                        setFormData((prev) => ({ ...prev, address: e.target.value }))
                    }
                    required
                />
            </div>
            <div>
                <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                <Input
                    id="address2"
                    value={formData.address2}
                    onChange={(e) =>
                        setFormData((prev) => ({ ...prev, address2: e.target.value }))
                    }
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, city: e.target.value }))
                        }
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="state">State/Region</Label>
                    <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, state: e.target.value }))
                        }
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="zipCode">Postal Code</Label>
                    <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, zipCode: e.target.value }))
                        }
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, country: e.target.value }))
                        }
                        required
                    />
                </div>
            </div>
            <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                        setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                />
            </div>
            <Button
                type="submit"
                className="w-full"
                disabled={isLoading || cartItems.length === 0}
            >
                {isLoading ? "Processing..." : `Complete Order - £${total.toFixed(2)}`}
            </Button>
        </form>
    );
}