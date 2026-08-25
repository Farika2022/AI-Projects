import { useState , useEffect} from "react";
import {createTicket} from "../../ticket-utils"
import type { Ticket } from "../types/ticket";

// The parent (App.jsx) knows — it adds it to the tickets list.
// So TicketForm creates the ticket and hands it UP to the parent.

interface TicketFormProps {
  // onSubmit is a function that receives a Ticket and returns nothing.
 
  onSubmit: (ticket: Ticket) => void;
}
function TicketForm ({onSubmit}: TicketFormProps){
    const [name, setName]=useState ("");
    const [email, setEmail]=useState ("");
    const [subject, setSubject]=useState ("");
    const [error, setError]=useState ("");
    const [submitted, setSubmitted]=useState (false);
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
            if (!submitted) return;
            const interval = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
            setTimeout(() => clearInterval(interval), 10000);
            return () => clearInterval(interval);
            }, [submitted]);

    const handleSubmit = () => {
        // This runs in the browser 
        if (!name.trim ()|| !email.trim() || !subject.trim()){
            setError ("Please fill in all fields");
            return;
        }
        if (!email.includes("@")){
            setError ("Please enter a valid email address");
            return;
        }
        if (subject.length > 100){
            setError("Subject must be under 100 characters");
            return;
        }
        setError("");
        // We reuse the createTicket() function from ticket-utils.js.
        const newTicket = createTicket(name.trim(), email.trim(), subject.trim());

         // Hand the new ticket UP to App.jsx via the onSubmit prop.
         // App.jsx will add it to the tickets array.
         onSubmit(newTicket);
         setSubmitted(true);
         setName("");
         setEmail("");
         setSubject("");

         setTimeout(() => {
         setSubmitted(false);
        }, 10000); // 10000 milliseconds = 10 seconds
    };
    // Successfully form submission message

    if (submitted){
        return (
            <div style ={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:"8px", padding: "20px", textAlign:"center"}}>
                <h3 style={{color:"#15803d"}}>Ticket Submitted Successfully</h3>
                <p style ={{color:"#166534"}}>We will get back to you shortly</p>
                
                <p style={{ color: "#9ca3af", fontSize: "13px" }}>
                    Returning to dashboard in {countdown} seconds...
                    </p>
              <button
                 onClick={()=>setSubmitted(false)}
                 style= {{marginTop:"12px", padding:"8px 16px", borderRadius:"8px", border:"1px solid #86efac", background:"white",cursor:"pointer"}}
                 >
                    Submit another ticket
                 </button>

                 
            </div>
            
        );
    }
    return (
        <div style ={{background:"#f8fafc", border:"1px solid #e228f0", borderRadius:"12px", padding:"20px", marginBottom:"24px"}}>
            <h2 style = {{marginBottom:"16px", fontSize:"18px"}}>Submit a support ticket</h2>
         {error &&(
            <div style ={{background:"#fef2f2",border: "1px solid #fca5a5", borderRadius:"8px",padding: "10px 14px", marginBottom:"12px", color:"#b91c1c",fontSize:"14px"}}>
               {error}
                </div>
         )}
         <div style ={{marginBottom:"12px"}}>
            <label style ={{display:"block", fontSize:"13px", fontWeight:"500",marginBottom:"4px", color :"#374151"}}>
                Your name
            </label>
            <input type ="text" value={name}
            onChange= {(e)=>setName(e.target.value)}
            placeholder ="eg: Lars "
            style ={{width: "100%",padding:"8px 12px", borderRadius:"8px", border:"1px solid #d1d5db", fontSize:"14px", boxSizing:"border-box"}}
           /> 
         </div>
         
         <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "4px", color: "#374151" }}>
          Email address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. lars@example.com"
          style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", boxSizing: "border-box" }}
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "4px", color: "#374151" }}>
          Describe your issue
        </label>
        <textarea
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. My front wheel is making a grinding noise"
          rows={3}
          style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", boxSizing: "border-box", resize: "vertical" }}
        />
        {/* Show character count */}
        <div style={{ fontSize: "12px", color: subject.length > 100 ? "#b91c1c" : "#9ca3af", textAlign: "right", marginTop: "4px" }}>
          {subject.length}/100
        </div>
      </div>

      <button
        onClick={handleSubmit}
        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", background: "#1d4ed8", color: "white", fontSize: "15px", fontWeight: "500", cursor: "pointer" }}
      >
        Submit ticket
      </button>
        </div>
    );
}
export default TicketForm;