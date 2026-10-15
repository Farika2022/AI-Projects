// WHY a separate types file?
// Every component needs to know what a Ticket looks like.
// Define the shape once here — import it everywhere.
// If the shape ever changes, update ONE file.

export interface Ticket {
  id: number;
  customer: string;
  email: string;
  subject: string;
  status: "open" | "resolved";        // only these two values allowed
  urgency: "LOW" | "MEDIUM" | "HIGH"; // only these three values allowed
  createdAt: string;
}

export interface TicketStats {
  total: number;
  high: number;
  medium: number;
  low: number;
  open: number;
}