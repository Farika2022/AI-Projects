// SmartDesk — ticket utilities
// All the core logic for creating, reading, and filtering
// tickets lives here. This keeps the logic in one place.
// When React needs to display tickets, it imports from here.
// When the .NET backend sends data back, this file processes it.
// ============================================================

import type { Ticket, TicketStats } from "./src/types/ticket";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5056";
// --- VARIABLES ---
// CAPITALS = a global rule for the whole app.
const URGENCY_LEVELS = ["LOW", "MEDIUM", "HIGH"];

// WHY store this as a constant?
// The same limit is used in three places:
//   1. The React form (stops the user typing too much)
//   2. The .NET API (validates before saving)
//   3. The dashboard (truncates long subjects in the list)
// One number, defined once, used everywhere.
const MAX_SUBJECT_LENGTH = 100;

// ── SAMPLE DATA — array of ticket objects ───────────────────
 
// WHY an array of objects?
// A variable holds ONE thing. An array holds MANY things.
// Each item in this array is a ticket object —
// exactly the shape the .NET backend will send back later.
// When we connect to the real database, we replace this
// array with a fetch() call. The rest of the code stays the same.
 
const tickets: Ticket[] = [
  {
    id: 10001,
    customer: "Lars Nielsen",
    email: "lars@example.com",
    subject: "Front wheel is making a grinding noise",
    status: "open",
    urgency: "HIGH",
    createdAt: "2026-07-10T08:23:00.000Z",
  },
  {
    id: 10002,
    customer: "Sofia Berg",
    email: "sofia@example.com",
    subject: "Invoice shows wrong VAT amount",
    status: "open",
    urgency: "LOW",
    createdAt: "2026-07-11T10:05:00.000Z",
  },
  {
    id: 10003,
    customer: "Mikkel Holm",
    email: "mikkel@example.com",
    subject: "Battery not charging past 40 percent",
    status: "resolved",
    urgency: "MEDIUM",
    createdAt: "2026-07-12T14:30:00.000Z",
  },
  {
    id: 10004,
    customer: "Anna Dahl",
    email: "anna@example.com",
    subject: "App crashes on startup after update",
    status: "open",
    urgency: "HIGH",
    createdAt: "2026-07-13T09:15:00.000Z",
  },
  {
    id: 10005,
    customer: "Jonas Lund",
    email: "jonas@example.com",
    subject: "Armrest cushion is coming loose",
    status: "open",
    urgency: "LOW",
    createdAt: "2026-07-14T11:45:00.000Z",
  },
];
 
// --- FUNCTIONS ---
 
function createTicket(customerName: string, email: string, subject: string): Ticket{

// new Date() = right now as a Date object.
// .toISOString() = "2026-07-17T10:30:00.000Z"
// WHY ISO? PostgreSQL stores timestamps in this exact format.
// Using ISO from the start means zero conversion needed later
const ticketId = Math.floor(Math.random()* 90000)+10000;
const createdAt= new Date().toISOString() ;
return{
    id:ticketId,
    customer: customerName,
    email: email,
    subject: subject,
    status: "open",
    urgency: "MEDIUM",
    createdAt: createdAt,
};
}


// Python AI service sends ticket to Claude API.
const getUrgencyLevel = (score: number): "LOW" | "MEDIUM" | "HIGH" =>{
    if (score >80)return "HIGH";
    if (score >40) return "MEDIUM";
    return "LOW";
};

// browser tab title, admin CSV export.
const formatTicketLabel =(ticket: Ticket): string =>{
    return "[" + ticket.urgency + "#" + ticket.id +"-"+ ticket.subject + "]";

};

// ── ARRAY METHODS ────────────────────────────────────────────
// These functions USE the tickets array.
// React components will import these to power the dashboard.
 
// Dashboard default view = open tickets only.
// Resolved tickets go to the archive view.
const getOpenTickets = (ticketArray: Ticket[]): Ticket[] => {
    return ticketArray.filter((ticket)=> ticket.status === "open");
};

// Dashboard filter buttons (HIGH / MEDIUM / LOW) call this.
const getTicketsByUrgency = (ticketArray: Ticket[], urgencyLevel: string): Ticket[] =>{
    return ticketArray.filter((ticket)=>ticket.urgency===urgencyLevel);
};

// map() loops through every item and TRANSFORMS it into
// something new. Returns a NEW array. Original unchanged.
// React calls this to turn ticket objects into label strings
const formatAllTickets= (ticketArray: Ticket[]): string[]=> {
    return ticketArray.map ((ticket)=>formatTicketLabel(ticket));
    // Each ticket object → becomes a formatted string label
};

// Dashboard header shows: Total | HIGH | MEDIUM | LOW | Open.
// All five numbers calculated in one call, returned as one object.
const getTicketStats=(ticketArray: Ticket[]): TicketStats=>{
    return{
        total: ticketArray.length,
        high: ticketArray.filter((t)=>t.urgency==="HIGH").length,
        medium: ticketArray.filter((t) => t.urgency === "MEDIUM").length,
        low:    ticketArray.filter((t) => t.urgency === "LOW").length,
        open:   ticketArray.filter((t) => t.status === "open").length,

    };
};

// --- ---------- TEST. -------------
console.log("── createTicket ──────────────────────────");
const myTicket = createTicket("Farika","Farika@test.com","Walker wheelchair broken");
console.log(myTicket);

console.log("\n── getUrgencyLevel ───────────────────────");
console.log(getUrgencyLevel(90));  // HIGH
console.log(getUrgencyLevel(60));  // MEDIUM
console.log(getUrgencyLevel(20));  // LOW
 
console.log("\n── formatTicketLabel ─────────────────────");
console.log(formatTicketLabel(tickets[0]));
 
console.log("\n── getOpenTickets ────────────────────────");
const open = getOpenTickets(tickets);
console.log("Open:", open.length, "of", tickets.length);
 
console.log("\n── getTicketsByUrgency ───────────────────");
const highOnly = getTicketsByUrgency(tickets, "HIGH");
console.log("HIGH tickets:", highOnly.length);
highOnly.forEach((t) => console.log(" →", t.customer));
 
console.log("\n── formatAllTickets ──────────────────────");
formatAllTickets(tickets).forEach((label) => console.log(label));
 
console.log("\n── getTicketStats ────────────────────────");
console.log(getTicketStats(tickets));

// ------------- ASYNC Functions - talking to .NET backend -------------

//fetchTickets()
// async marks this functions as one that does something slow.
// must mark a function async before using await inside it 
// Without async , JS throws : "await is only valid in async functions"

const fetchTickets = async (token: string) : Promise<Ticket[]>  => {
  try {
    const response = await fetch("http://localhost:5056/api/tickets", {
  headers: { "Authorization": `Bearer ${token}` }
});
    
    if (!response.ok){
      throw new Error ("Server error:" + response.status);
    }
    const tickets = await response.json();
    return tickets;
  }
  catch (error){
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to fetch tickets:", message);
    return[];
  }

}

// fetchTicketsById()
// Clicking a ticket on the dashboard opens the detail view.
// We only need ONE ticket — not all of them.
// The .NET backend has a GET /api/tickets/:id endpoint for this.
const fetchTicketById = async (ticketId: number) => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5056";
    const response = await fetch(`${API_URL}/api/tickets/${ticketId}`);

    if (!response.ok) {
      throw new Error("Ticket not found: " + ticketId);
    }

    const ticket = await response.json();
    return ticket;

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to fetch ticket:", message);
    return null;
  }
};

//submitTicket
// GET = fetch data FROM the server (read only, no body).
// POST = send data TO the server (creates something new).
// The customer portal form calls this when submitted.
// It sends the ticket data to the .NET backend.
// The backend saves it to PostgreSQL and returns the saved ticket with a database ID.
const submitTicket = async (customerName: string, email: string, subject: string)=>{
  try{

    const ticketData = createTicket (customerName,email,subject);
    const response = await fetch ("http://localhost:5056/api/tickets",{
       
      // Default fetch method is GET. Must explicitly set POST.
      method:"POST",
     
      //  Content-Type header: Tells the server- the body is JSON, not a form or plain text.
      // Without this header, the .NET backend cannot read the body.
      headers:{
        "Content-Type":"application/json",
      },
      // fetch() cannot send a JavaScript object directly over the network.
      // JSON.stringify converts { id: 1, customer: "Farika" }
      // into the string '{"id":1,"customer":"Farika"}'.
      // The server reads the string and converts it back to an object.
      body:JSON.stringify(ticketData),
    });

    if (!response.ok){
      throw new Error ("Submit failed:"+ response.status);
    }
     // The backend assigns a database ID (not our random one).
    // The frontend uses this real ID to show the confirmation screen:
    // "Your ticket #10042 has been submitted."
      const savedTicket  =await response.json();
      return savedTicket;
    }
    catch(error){
      const message = error instanceof Error ? error.message : String(error);
      console.error("Failed to submit ticket:", message);
      return null;
    }
  };

// updateTicketStatus()
// POST creates something new.
// PATCH updates part of an existing record — just the status field.
// PUT would replace the whole ticket. PATCH only touches what changed.

const updateTicketStatus = async (ticketId: number, newStatus: string)=>{
  try{
    const response= await fetch (`http://localhost:5056/api/tickets/${ticketId}`, {
    method :"PATCH",
     headers:{
        "Content-Type":"application/json",
      },
      body:JSON.stringify({status:newStatus}),
  });
  if (!response.ok){
    throw new Error("Update failed:" + response.status);
  }
  const updated = await response.json();
  return updated ;
}
  catch(error){
       const message = error instanceof Error ? error.message : String(error);
       console.log("Failed to update ticket:",message);
       return null;
  }
};
 
// ── TEST ASYNC FUNCTIONS ─────────────────────────────────────
// These will fail until the .NET backend is running.
// That is expected. The functions are correct.
// Uncomment and run once the backend is live on localhost:5000.
 
// console.log("── fetchTickets ──────────────────────────");
// fetchTickets().then(tickets => console.log("Fetched:", tickets.length));
 
// console.log("── submitTicket ──────────────────────────");
// submitTicket("Farika", "farika@test.com", "Test ticket")
//   .then(saved => console.log("Saved:", saved));

// -------------- SORTING --------------------
// BY URGENCY LEVEL
const urgencyOrder: Record<string, number> = {HIGH:0, MEDIUM:1, LOW:2};
const sortByUrgency= (ticketArray:Ticket[]):Ticket[]=>{
return [...ticketArray].sort(
  (a,b) => urgencyOrder[a.urgency]- urgencyOrder[b.urgency]
);
};

//BY DATE
const sortByDate = (ticketArray: Ticket[]):Ticket[]=>{
  return [...ticketArray].sort(
    (a,b)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

// By STATUS
const sortByStatus= (ticketArray: Ticket[]):Ticket[]=>{
  return[...ticketArray].sort((a,b)=>{
    if (a.status==="open" && b.status==="resolved")return -1;
    if (a.status==="resolved" && b.status==="open")return -1;
    return 0
  });
};

// ------------------ SEARCHING ---------------------
const searchTickets = (ticketArray: Ticket[],query:string): Ticket[]=>{
  //trim(): Remove accidental spaces the user typed.
  //toLowerCase(): Make search case-insensitive.
  const q = query.toLowerCase().trim();
  if (q==="") return ticketArray;
  return ticketArray.filter((ticket)=>
  ticket.customer.toLowerCase().includes(q) ||
  ticket.subject.toLowerCase().includes(q) ||
  ticket.id.toString().includes(q)
  );
};

// ------------- QUEUE AI TRIAGE PROCESSING -----------------
class TicketQueue{
  // private means only methods inside this class can touch queue.
  // External code cannot randomly push or splice items.
  private queue: Ticket[]=[];
  enqueue (ticket:Ticket):void{
    this.queue.push(ticket);
    console.log(`Ticket #${ticket.id} joined the queue. Position: ${this.queue.length}`);
  }
  dequeue ():Ticket | undefined{
    if (this.isEmpty()){
      console.log("Queue is empty - nothing to process.");
      return undefined;
    }
    const ticket = this.queue.shift();
    console.log (`processing ticket #${ticket?.id}- ${ticket?.subject}`);
    return ticket;
  }
  // peek() — look at the next ticket WITHOUT removing it
  peek():Ticket| undefined{
    return this.queue[0];
  }
  // isEmpty() — check if there is anything to process
  isEmpty(): boolean {
    return this.queue.length===0;
  } 
  // size — how many tickets are waiting
  get size(): number{
    return this.queue.length;
  }
  getAll():Ticket[]{
    return [...this.queue];
  }
}
export { tickets, createTicket, getOpenTickets, getTicketStats,
         formatAllTickets, getTicketsByUrgency,
         sortByUrgency, sortByDate, sortByStatus,
         searchTickets, TicketQueue,
         fetchTickets, submitTicket, updateTicketStatus };