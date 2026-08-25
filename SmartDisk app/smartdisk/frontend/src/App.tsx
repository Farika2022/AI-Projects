import { useState,useRef,useEffect} from 'react'
import TicketList from './components/TicketList'
import TicketForm from './components/TicketForm'
import {
  getTicketStats, fetchTickets, submitTicket,
  sortByUrgency, sortByDate, sortByStatus,
  searchTickets, TicketQueue
} from "../ticket-utils";
import type { Ticket } from "./types/ticket";
import LoginPage from "./components/LoginPage";

// useState triggers a re-render every time it changes.
// useRef holds a value between renders WITHOUT causing re-renders.
function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
const [loading, setLoading] = useState<boolean>(true);
const [token, setToken] = useState<string>("");
const [apiError, setApiError] = useState<string>("");
  const [filter,setFilter] = useState ("ALL");
  const [view, setView] = useState("dashboard");
  const [sort, setSort]=useState<"urgency"| "date"|"status">("urgency");
  const [query, setQuery] = useState<string>("");
  const triageQueue = useRef(new TicketQueue());
  const [ queueSize, setQueueSize]=useState<number> (0);
  const [ lastProcessed, setLastProcessed]= useState<Ticket | null>(null);
  
  const handleLogin = (newToken: string) => {
  setToken(newToken);
};


  // Every time filter changes, React re-renders App.
  // visible recalculates automatically — no manual DOM updates needed.

  useEffect(() => {

  const loadTickets = async () => {
  try {
    setLoading(true);
    const data = await fetchTickets(token); // pass token here
    setTickets(data);
  } catch (error) {
    setApiError("Could not connect to server.");
  } finally {
    setLoading(false);
  }
};

  loadTickets();
}, []); // [] = run once when component first appears


// Sorting
const getSorted= (ticketArray:Ticket[]):Ticket[]=>{
  if (sort ==="urgency")return sortByUrgency (ticketArray);
  if (sort ==="date")return sortByDate (ticketArray);
  if (sort ==="status")return sortByStatus (ticketArray);
  return ticketArray;
};
const searched =searchTickets(tickets,query);
const filtered= filter === "ALL" ? searched : searched.filter(t => t.urgency === filter);
const visible = getSorted(
  filtered
);

  const stats = getTicketStats(tickets);

  // TicketForm calls onSubmit(newTicket) when submitted.
  // This function receives that ticket and adds it to the array.

  const handleNewTicket = async(newTicket:Ticket) => {
    try {
   
    // submitTicket() sends the ticket to POST /api/tickets.
    // The .NET backend saves it and returns it with a real server ID.
    // We use the saved ticket (with real ID) not the local one.
    const saved = await submitTicket(
      newTicket.customer,
      newTicket.email,
      newTicket.subject
    );

    if (saved) {
      
      // Add the server-returned ticket (with real ID) to the list.
      // This keeps React state in sync with the database.
      setTickets([...tickets, saved]);
    }
  } catch (error) {
    console.error("Failed to submit ticket:", error);
  }

  setTimeout(() => setView("dashboard"), 10000);
  };

  
  // Add ticket to AI triage queue
  const addToQueue = (ticket:Ticket)=>{
    triageQueue.current.enqueue(ticket);
    setQueueSize(triageQueue.current.size);
  };
  // Process next ticket from queue (simulate AI triage)
  const processNext=() =>{
    const ticket = triageQueue.current.dequeue();
    if(ticket){
      setLastProcessed(ticket);
      setQueueSize(triageQueue.current.size)
    }
  };

  //if (!token) {
  //return <LoginPage onLogin={handleLogin} />;
//}
  return (
    
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
     
      {/* Navigation */}
      <div style ={{display:"flex", justifyContent:"space-around", alignItems:"center",marginBottom:"24px"}}>
        <h1 style={{margin:0}} >SmartDesk</h1>
        <div style={{display:"flex",gap:"8px"}}>
          <button
            onClick={()=>setView("dashboard")}
            style ={{padding:view ==="dashboard" ? "#1d4ed8":"white", color: view==="dashboard"?"white":"#374151",cursor:"pointer"}}
          >
            Dashboard
          </button>
          <button onClick={()=> setView("submit")}
            style={{padding:"6px 14px",borderRadius:"8px",border:"1px solid #d1d5db",
              background:view === "submit" ? "#1d4ed8" :"white",
              color:view ==="submit" ? "white" :"#374151", cursor:"pointer"
            }}>
              Submit ticket
            </button>
        </div>
      </div>
     {view === "submit" && (
        <TicketForm onSubmit={handleNewTicket} />
      )}
     {view === "dashboard" &&(
      <>
      {/* Stats row */}
   <div style = {{display: "flex", gap :"12px", marginBottom:"20px"}}>
    {(["total", "high", "medium", "low"]as const).map(key => (
       <div key={key} style={{ flex: 1, background: "#f1f5f9", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
      <div style = {{fontSize:"22px", fontWeight: "bold"}}>{stats[key]}</div>
      <div style = {{fontSize:"12px", color: "#6b7280"}}>{key.toUpperCase()}</div>
      </div>
       
    ))}
    </div>

    {/*Search bar */}
    <div style={{marginBottom:"16px"}}>
      <input
      type ="text"
      value={query}
      onChange={(e)=>setQuery(e.target.value)}
      placeholder="Search by name,issue, or ticket ID"
      style={{
        width:"100%",
        padding:"10px 14px", 
        borderRadius:"8px", 
        border:"1px solid #d1d5db", 
        fontSize:"14px",
        boxSizing: "border-box" as const,
      }}
/>
{query && (
  <div style ={{fontSize:"12px", color:"#6b7280", marginTop:"6px"}}>
    {visible.length}ticket{visible.length !== 1? "s":""} found for "{query}"
    </div>
)}
    </div>

    {/* Filter buttons */}
    <div style ={{display:"flex", gap :"8px", marginBottom:"16px"}}>
      {["ALL", "HIGH", "MEDIUM", "LOW"]. map(f => (
        <button
          key ={f}
          onClick={()=> setFilter(f)}
          style= {{padding: "6px 14px", borderRadius:"20px", border:"1px solid #ccc",
            background: filter===f? "#1d4ed8":"white", color: filter===f ? "white": "#374151",
          cursor :"pointer"}}
          >
         {f}
        </button>
      ))}
    </div>

     {/*Sort button */}
   <div style={{display:"flex", gap:"8px", marginBottom:"16px",alignItems:"center"}}>
    <span style={{fontSize:"13px", color:"#6b7280"}}>Sort:</span>
    {(["urgency","date","status"]as const).map(s=>(
      <button
      key={s}
      onClick={()=>setSort(s)}
      style={{
        padding:"5px 12px",borderRadius:"20px",
        border:"1px solod #ccc", fontSize:"12px",
        background:sort === s? "#1d4ed8":"white",
        cursor:"pointer"
      }}
      >
      {s ==="urgency"?"By urgency": s === "date"? "By date":"Open first"}

      </button>
    ))}
   </div>

  {/* API error state */}
{apiError && (
  <div style={{ background: "#fef2f2", border: "1px solid #fca5a5",
    borderRadius: "8px", padding: "12px", marginBottom: "16px",
    color: "#b91c1c", fontSize: "14px" }}>
    {apiError}
  </div>
)}

{/* Only show list when not loading */}
{!loading && <TicketList tickets={visible} />}


    {/*Ticket list- passes filtered tickets down as props*/}
    <TicketList tickets={visible}/>
    {/* AI Triage Queue */}
    <div
    style ={{marginTop:"24px", background:"#f8fafc", border:" 1px solid #e2e8f0", borderRadius:"12px", padding:"16px"}}>
    <h3 style={{fontSize:"15px", fontWeight:"600", marginBottom:"12px",color:"#1d44d8"}}>
      AI Triage Queue
    </h3>
    
    <div style={{display:"flex",gap:"8px",marginBottom:"12px", flexWrap:"wrap"}}>
    <button
    onClick={()=>
    {
      const openTickets= tickets.filter (t=>t.status === "open");
      if (openTickets.length >0) addToQueue(openTickets[0]);
    }
    }
    style={{padding:"8px 14px", borderRadius:"8px",border:"1px solid #d1d5db", background:"white",cursor:"pointer",fontSize:"13px"}}
    >
      Add ticket to queue +
    </button>
    
    <button
    onClick={processNext}
    style={{padding:"8px 14px", borderRadius:"8px", border:"none", background:"#1d4ed8", color: "white", cursor:"pointer", fontSize:"13px"}}
    >
      Process next ▶
    </button>
    </div>

    <div style={{fontSize:"13px", color:"#374151"}}>
      <span style={{marginRight:"16px"}}>
        Waiting:<strong>{queueSize}</strong>
      </span>
      {lastProcessed && (
        <span style ={{color:"#15803d"}}>
          Last Processed:<strong>[{lastProcessed.urgency}]#{lastProcessed.id}-{lastProcessed.customer}</strong>
        </span>
      )}
    </div>
    </div>
    </>
    )}
   </div>

  );

  

}


export default App;
