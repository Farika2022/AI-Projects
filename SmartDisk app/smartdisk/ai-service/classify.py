import anthropic
import json
import os
from dotenv import load_dotenv

# Reads the .env file and loads ANTHROPIC_API_KEY
load_dotenv()
# Reads the key from the environment, not from the code.
# If the key is not found, returns None — we check for that.
api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key:
    raise ValueError("ANTHROPIC_API_KEY not found in .env file")
# with the API. All calls go through this client.
client = anthropic.Anthropic(api_key=api_key)

def classify_ticket(customer: str, subject: str) -> dict:
    """
    Send a ticket to Claude API and get back urgency,
    category, and a suggested reply.
    Returns a dict or None if something went wrong.
    """
    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",

            # WHY max_tokens=500?
            # Claude could write a very long response if not limited.
            # Our JSON response needs maybe 100 tokens.
            # 500 is generous but prevents runaway responses.
            max_tokens=500,

            system="""
You are a customer support classifier for a mobility aid company
that makes electric walkers and wheelchairs.

Read the customer ticket and respond ONLY with a valid JSON object.
No explanation, no preamble, no markdown code blocks. Just raw JSON.

The JSON must have exactly these fields:
{
  "urgency": "LOW" or "MEDIUM" or "HIGH",
  "category": "hardware" or "software" or "billing" or "shipping" or "other",
  "suggested_reply": "a short, professional, empathetic reply to the customer (2-3 sentences)"
}

Urgency guide:
- HIGH: safety risk, device unusable, customer cannot move safely
- MEDIUM: device works but with problems, needs attention soon
- LOW: billing, general questions, minor cosmetic issues
            """,

            messages=[
                {
                    "role": "user",
                    "content": f"Customer: {customer}\nSubject: {subject}"
                }
            ]
        )

     
        # Claude returns a list of content blocks.
     
        raw = message.content[0].text

        
        # Claude returns a string that looks like JSON.
        # json.loads() converts it into a real Python dictionary
        # so we can access response["urgency"] etc.
        result = json.loads(raw)
        return result

    except json.JSONDecodeError:
        # Claude returned something that is not valid JSON.
        # This can happen if the prompt is not clear enough.
        print(f"Claude returned invalid JSON: {raw}")
        return None

    except Exception as e:
        print(f"API call failed: {e}")
        return None
    
# ── TEST IT ──────────────────────────────────────────────────

# This costs a tiny amount of API credit — a fraction of a cent.

if __name__ == "__main__":
    result = classify_ticket(
        customer="Lars Nielsen",
        subject="Front wheel is making a grinding noise — feels unsafe"
    )

    if result:
        print("Urgency:", result["urgency"])
        print("Category:", result["category"])
        print("Suggested reply:", result["suggested_reply"])
    else:
        print("Classification failed")