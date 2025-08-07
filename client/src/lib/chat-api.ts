// Configuration for webhook URL
const CONFIG = {
  webhookUrl: import.meta.env.VITE_WEBHOOK_URL || "https://hook.eu1.make.com/86ajsr2ii8aleud1otm35xyke5ufvr4k",
  apiKey: import.meta.env.VITE_MAKE_API_KEY || "123dddasd"
};

export interface WebhookResponse {
  reply: string;
}

export async function sendMessageToWebhook(message: string): Promise<string> {
  try {
    const response = await fetch(CONFIG.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-make-apikey": CONFIG.apiKey,
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      console.error("HTTP error:", response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    console.log("Webhook response:", responseText);
    
    // Handle specific Make.com responses
    if (responseText.trim() === "Accepted") {
      return "I received your message! Please note: Your Make.com scenario needs to be configured to execute immediately on data arrival to provide real-time responses. Currently, it's only accepting the webhook but not processing it synchronously.";
    }

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.log("Response is not JSON, treating as plain text");
      return responseText || "I received your message, but got an empty response.";
    }

    // Handle different response formats
    if (data.reply) {
      return data.reply;
    } else if (data.response) {
      return data.response;
    } else if (data.message) {
      return data.message;
    } else if (typeof data === 'string') {
      return data;
    } else {
      console.log("Unknown response format:", data);
      return JSON.stringify(data);
    }
  } catch (error) {
    console.error("Webhook error:", error);
    throw new Error("Something went wrong. Please try again later.");
  }
}
