import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.RECEIVING_MAIL,
            subject: `Feedback`,
            text: message,
        });

        return NextResponse.json({ success: true });
    }catch (err){
        console.error("Feedback Error:", err);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}