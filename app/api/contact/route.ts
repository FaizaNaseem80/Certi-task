import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, subject, message, type } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject: subject || null,
        message,
        type: type || "contact",
      },
    });

    return NextResponse.json({ success: true, id: contactMessage.id });
  } catch (error) {
    console.error("Contact message error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
