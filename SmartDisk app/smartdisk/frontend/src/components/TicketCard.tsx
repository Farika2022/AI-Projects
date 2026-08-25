// TicketCards to display 

import type { Ticket } from "../types/ticket";

interface TicketCardProps {
  ticket: Ticket;
}
// That is all a React component is — a function that returns UI.
  // React calls this function every time the ticket data changes.
function TicketCard({ticket}: TicketCardProps){
return (
    <div style = {{border:"1px solid #ccc", padding: "12px", marginBottom:"8px",borderRadius:"8px"}}>
        {/* {} - we are putting JS inside HTML
            ticket.urgency is JS. The {} tells JSX: evaluate this. */}
   <span style = {{fontWeight:"bold",color:ticket.urgency === "HIGH"? "red":ticket.urgency === "MEDIUM"? "orange":"green" }}>
    [{ticket.urgency}]
   </span>
   <h3 style ={{margin:"4px 0"}}>{ticket.subject}</h3>
   <p style={{color :"#666, fontSize:14px"}}>
    {ticket.customer}. #{ticket.id}
   </p>
    </div>
)
}

export default TicketCard;