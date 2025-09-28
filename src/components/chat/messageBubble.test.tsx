/** 
* @jest-environment jsdom
*/

import React from "react";
import { render, screen } from "@testing-library/react";
import MessageBubble from "./messageBubble";
import type { MessageInput } from "@/types/Message";

//this function is basically used to generate ISO date strings for today, yesterday, and older dates
//offsetDays: 0 for today, -1 for yesterday, -n for n days ago
//time is in HH:MM:SS format, defaulting to "10:30:00"
const getDateString = (offsetDays = 0, time = "10:30:00") => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}T${time}Z`;
};
//literally mock entire mnessage stuff
describe("MessageBubble Component", () => {
    const baseMessage: MessageInput = {
    messageId: "msg1",
    conversationId: "conv1", //mock convo id
    senderId: "user1",//mock sender id 
    content: "Hello world",
    createdAt: getDateString(0), // Today
    read: false,
    };

  test("renders a received message with correct styling", () => {
    render(<MessageBubble msg={baseMessage} isSent={false} />);
    
    const messageElement = screen.getByText("Hello world");
    expect(messageElement).toBeInTheDocument();

    //received messages should NOT have the check icon
    expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument();

    //check that correct background color is applied
    expect(messageElement.className).toContain("bg-gray-600");
  });

  test("renders a sent message with correct styling and check icon", () => {
    render(<MessageBubble msg={baseMessage} isSent={true} />);

    const messageElement = screen.getByText("Hello world");
    expect(messageElement).toBeInTheDocument();

    //sent messages should have the check icon
    const checkIcon = screen.getByTestId("check-icon");
    expect(checkIcon).toBeInTheDocument();

    //check that correct background color is applied
    expect(messageElement.className).toContain("bg-green-700");
  });

  test("renders check icon with green color when message is read", () => {
    const readMessage = { ...baseMessage, read: true };
    render(<MessageBubble msg={readMessage} isSent={true} />);

    const checkIcon = screen.getByTestId("check-icon");
    expect(checkIcon).toBeInTheDocument();
    expect(checkIcon.classList.contains("text-green-400")).toBe(true);// read color
  });

  test("renders check icon with gray color when message is unread", () => {
    render(<MessageBubble msg={baseMessage} isSent={true} />);
    
    const checkIcon = screen.getByTestId("check-icon");
    expect(checkIcon.classList.contains("text-gray-400")).toBe(true); // unread color
  });

  test("displays 'Today' when the message was sent today", () => {
    render(<MessageBubble msg={baseMessage} isSent={false} />);
    
    const timestamp = screen.getByText(/Today, \d{2}:\d{2}/);
    expect(timestamp).toBeInTheDocument();
  });

  test("displays 'Yesterday' when the message was sent yesterday", () => {
    const yesterdayMessage = { ...baseMessage, createdAt: getDateString(-1) };
    render(<MessageBubble msg={yesterdayMessage} isSent={false} />);
    
    const timestamp = screen.getByText(/Yesterday, \d{2}:\d{2}/);
    expect(timestamp).toBeInTheDocument();
  });

  test("displays full date for messages older than yesterday", () => {
    const oldMessage = { ...baseMessage, createdAt: getDateString(-3) }; //3 days ago
    render(<MessageBubble msg={oldMessage} isSent={false} />);

    const regex = /\w{3} \d{2}, \d{2}:\d{2}/; //ie like "Sep 25, 10:30"
    const timestamp = screen.getByText(regex);
    expect(timestamp).toBeInTheDocument();
  });

  test("handles very long message content gracefully", () => {
    const longContent = "A".repeat(500);
    const longMessage = { ...baseMessage, content: longContent };
    
    render(<MessageBubble msg={longMessage} isSent={false} />);
    expect(screen.getByText(longContent)).toBeInTheDocument();
  });
});
