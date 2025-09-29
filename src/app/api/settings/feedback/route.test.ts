import { POST } from "./route";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

//this is mock nodemailer
jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(),
  })),
}));

describe("POST /api/feedback", () => {
  const mockSendMail = jest.fn();
  const mockCreateTransport = nodemailer.createTransport as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateTransport.mockReturnValue({ sendMail: mockSendMail });
    process.env.EMAIL_USER = "test@example.com";
    process.env.EMAIL_PASS = "password123";
    process.env.RECEIVING_MAIL = "receiver@example.com";
  });

  it("should send an email and return success for a valid message", async () => {
    mockSendMail.mockResolvedValueOnce(true);

    const req = {
      json: jest.fn().mockResolvedValue({ message: "Test feedback message" }),
    } as any;

    const res = await POST(req);

    expect(req.json).toHaveBeenCalled();
    expect(mockCreateTransport).toHaveBeenCalledWith({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    expect(mockSendMail).toHaveBeenCalledWith({
      from: `"Feedback bot" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVING_MAIL,
      subject: "Feedback",
      text: "Test feedback message",
    });

    const json = await res.json();
    expect(json).toEqual({ success: true });
  });

  it("should return 400 if message is missing", async () => {
    const req = {
      json: jest.fn().mockResolvedValue({}),
    } as any;

    const res = await POST(req);

    expect(req.json).toHaveBeenCalled();
    expect(mockSendMail).not.toHaveBeenCalled();
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json).toEqual({ message: "Missing message" });
  });

  it("should return 500 if sendMail throws an error", async () => {
    mockSendMail.mockRejectedValueOnce(new Error("SMTP Error"));

    const req = {
      json: jest.fn().mockResolvedValue({ message: "Test error case" }),
    } as any;

    const res = await POST(req);

    expect(req.json).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalled();
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json).toEqual({ success: false });
  });
});
