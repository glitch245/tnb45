
export default async (req) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405 }
    );
  }

  try {
    const { message } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400 }
      );
    }

    const apiKey = Netlify.env.get("OPENAI_API_KEY");

    if (!apiKey) {
      throw new Error("AI key is not configured");
    }

    const result = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          instructions: "You are Fred AI, a helpful, intelligent futuristic virtual assistant. Answer clearly and naturally.",
          input: message
        })
      }
    );

    const data = await result.json();

    if (!result.ok) {
      throw new Error(data.error?.message || "AI request failed");
    }

    const reply = data.output
      ?.flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n") || "I couldn't generate a response.";

    return new Response(
      JSON.stringify({ reply }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

export const config = {
  path: "/.netlify/functions/chat"
};
