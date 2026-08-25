// TicketList uses TicketCard to display each ticket.

import TicketCard from "./TicketCard";
import type { Ticket } from "../types/ticket";

interface TicketListProps{
  tickets: Ticket[];
}
function TicketList({tickets}:TicketListProps){
   // Always handle the empty state. What does the user see
  // before data loads? A blank screen is confusing.

  if (tickets.length === 0 ){
    return<p>No tickets found.</p>;
  }
 // map() turns the array of ticket objects into an array of
 return (
    <div>
        {tickets.map ((ticket)=>(
        // React uses key to track which item is which when the list
        // updates. Without key, React re-renders everything.
        // With key, it only updates what changed. Always use a unique ID.
            <TicketCard key ={ticket.id} ticket={ticket}/>
        ))}
    </div>
 );
}
export default TicketList;