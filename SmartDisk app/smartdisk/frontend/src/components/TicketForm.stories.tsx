import type {Meta, StoryObj} from "@storybook/react";
import TicketForm from "./TicketForm";

const meta : Meta <typeof TicketForm>={
    title: "SmartDesk/TicketForm",
    component: TicketForm,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TicketForm>;

export const Default: Story = {
    args:{
        // TicketForm requires an onSubmit prop.
        onSubmit:(ticket)=> console.log ("Submitted",ticket),
    },
};