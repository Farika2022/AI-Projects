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

