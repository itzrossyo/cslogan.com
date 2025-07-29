import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    try {
        const { email, bookTitle, pdfUrl, author } = await request.json();

        if (!email || !bookTitle || !pdfUrl) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Send email with PDF
        const { data, error } = await resend.emails.send({
            from: "CS Logan <noreply@cslogan.com>",
            to: [email],
            subject: `Your free PDF: ${bookTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #2563eb; margin-bottom: 20px;">Your Free PDF is Ready!</h1>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                        Thank you for downloading <strong>${bookTitle}</strong> by ${author}.
                    </p>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                        You can download your PDF using the link below:
                    </p>
                    
                    <div style="margin: 30px 0;">
                        <a href="${pdfUrl}" 
                           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                            Download PDF
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                        If you have any questions, please don't hesitate to contact us.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <p style="font-size: 12px; color: #9ca3af;">
                        This email was sent from CS Logan. If you didn't request this PDF, please ignore this email.
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error("Resend error:", error);
            return NextResponse.json(
                { error: "Failed to send email" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error sending PDF email:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 