// Story for TicketCard
// Shows the component with different ticket data
import { Component } from "react"
import type {Meta ,StoryObj} from "@storybook/react"
import TicketCard from "./TicketCard"

 // Meta tells Storybook: which component is this, what is its title
 const meta: Meta<typeof TicketCard> ={
         title: "SmartDesk/TicketCard",
         component: TicketCard,
        // To automatically generates a documentation page
         tags: ["autodocs"],
 };

export default meta;
type Story = StoryObj<typeof TicketCard>;

// Each named export = one story = one version of the component
export const HighUrgency: Story ={
    args:{
        ticket:{
            id: 10001,
            customer: "Lars Nielsen",
            email: "lars@example.com",
            subject: "Front wheel is making a grinding noise",
            status: "open",
            urgency: "HIGH",
            createdAt: "2026-07-10T08:23:00.000Z",
        },
    },
};

export const MediumUrgency: Story = {
  args: {
    ticket: {
      id: 10003,
      customer: "Mikkel Holm",
      email: "mikkel@example.com",
      subject: "Battery not charging past 40 percent",
      status: "open",
      urgency: "MEDIUM",
      createdAt: "2026-07-12T14:30:00.000Z",
    },
  },
};

export const LowUrgency: Story={
    args: {
        ticket: {
        id: 10002,
        customer: "Sofia Berg",
        email: "sofia@example.com",
        subject: "Invoice shows wrong VAT amount",
        status: "open",
        urgency: "LOW",
        createdAt: "2026-07-11T10:05:00.000Z",
        },
    },
};
export const Resolved: Story ={
    // TicketCard might look different when status is resolved.
     args: {
        ticket: {
        id: 10003,
        customer: "Mikkel Holm",
        email: "mikkel@example.com",
        subject: "Battery not charging past 40 percent",
        status: "resolved",
        urgency: "MEDIUM",
        createdAt: "2026-07-12T14:30:00.000Z",
        },
  },

};

export const LongSubject: Story = {
  
  // To test  when the subject is very long?
  // Does the card break? Does text overflow?
  
  args: {
    ticket: {
      id: 10005,
      customer: "Jonas Lund",
      email: "jonas@example.com",
      subject: "The left armrest cushion is slowly detaching from the frame and has been getting progressively worse over the past two weeks",
      status: "open",
      urgency: "LOW",
      createdAt: "2026-07-14T11:45:00.000Z",
    },
  },
};