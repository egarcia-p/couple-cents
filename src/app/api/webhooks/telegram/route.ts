import { db } from "@/app/lib/db";
import { transactions } from "../../../../../drizzle/schema";
import { encrypt } from "@/app/lib/crypto";
import { revalidatePath } from "next/cache";
import categories from "@/app/lib/data/categories.json";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function sendTelegramMessage(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN is not defined in environment variables");
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }

  const sendMessageUrl = `https://api.telegram.org/bot${token}/sendMessage`;
  const response = await fetch(sendMessageUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Telegram API error: ${response.status} - ${errorBody}`);
    throw new Error(`Failed to send message: ${response.statusText}`);
  }
}

export async function GET() {
  return Response.json({ status: "running" });
}

export async function POST(req: Request) {
  // 0. Verify secret token if configured
  const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secretToken) {
    const headerToken = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
    if (headerToken !== secretToken) {
      return Response.json(
        { success: false, error: "Unauthorized origin" },
        { status: 403 },
      );
    }
  }

  let chatId = "";
  try {
    const payload = await req.json().catch(() => null);
    if (!payload || !payload.message || typeof payload.message.chat?.id === "undefined") {
      return Response.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    chatId = String(payload.message.chat.id);

    // 1. Check authorization
    const mappingsStr = process.env.TELEGRAM_USER_MAPPINGS || "";
    const mappings = new Map<string, string>();
    mappingsStr.split(",").forEach((pair) => {
      const [cId, uId] = pair.split(":");
      if (cId && uId) {
        mappings.set(cId.trim(), uId.trim());
      }
    });

    const userId = mappings.get(chatId);
    if (!userId) {
      const unauthorizedMessage = `❌ <b>Unauthorized Account</b>\n\nYour Telegram Chat ID (<code>${chatId}</code>) is not mapped to any user in <code>couple-cents</code>. Please add it to your environment mappings.`;
      await sendTelegramMessage(chatId, unauthorizedMessage);
      return Response.json({ success: false, error: "Unauthorized chat ID" }, { status: 200 });
    }

    // 2. Validate text presence
    if (!payload.message.text) {
      const unsupportedMessage = `⚠️ <b>Unsupported message type</b>\n\nPlease send a text command. Example:\n<code>/spend 14.50 GRO Walmart</code>`;
      await sendTelegramMessage(chatId, unsupportedMessage);
      return Response.json({ success: false, error: "Missing message text" }, { status: 200 });
    }

    const text = payload.message.text.trim();
    const isSpendOrGasto = /^\/(spend|gasto)\b/i.test(text);
    const isCategoriesCommand = /^\/(categories|categorias)\b/i.test(text);

    // Handle /categories command
    if (isCategoriesCommand) {
      const categoryList = Object.entries(categories)
        .map(([key, name]) => `• <b>${key}</b>: ${name}`)
        .join("\n");
      const categoriesMessage = `📋 <b>Available Categories</b>\n\nUse the code or the full name when logging a transaction:\n\n${categoryList}\n\n<b>Example:</b>\n<code>/spend 14.50 GRO Walmart</code>\n<code>/spend 14.50 Groceries Walmart</code>`;
      await sendTelegramMessage(chatId, categoriesMessage);
      return Response.json({ success: true, message: "Categories list sent" }, { status: 200 });
    }

    if (!isSpendOrGasto) {
      const helpMessage = `👋 <b>Welcome to couple-cents!</b>\n\nYou can log transactions directly from here.\n\n<b>Commands:</b>\n• <code>/spend &lt;amount&gt; &lt;category&gt; &lt;establishment&gt; [note]</code>\n• <code>/categories</code> — list all category codes\n\n<b>Example:</b>\n<code>/spend 14.50 GRO Walmart weekly groceries</code>`;
      await sendTelegramMessage(chatId, helpMessage);
      return Response.json({ success: true, message: "Help message sent" }, { status: 200 });
    }

    // 3. Parse command arguments
    const match = text.match(/^\/(spend|gasto)\s+(\d+(?:\.\d+)?)\s+(\S+)\s+(\S+)(?:\s+(.+))?$/i);
    if (!match) {
      const formatErrorMessage = `⚠️ <b>Invalid Command Format</b>\n\nPlease use the following format:\n<code>/spend &lt;amount&gt; &lt;category&gt; &lt;establishment&gt; [note]</code>\n\n<b>Example:</b>\n<code>/spend 14.50 GRO Walmart weekly groceries</code>`;
      await sendTelegramMessage(chatId, formatErrorMessage);
      return Response.json({ success: false, error: "Invalid command format" }, { status: 200 });
    }

    const [, , amountStr, categoryStr, establishmentStr, noteStr] = match;

    const amountVal = parseFloat(amountStr);
    const amountInCents = Math.round(amountVal * 100);

    // 4. Map category
    const inputCategoryLower = categoryStr.toLowerCase();
    let matchedKey: string | null = null;

    // Check direct keys (case-insensitive)
    for (const key of Object.keys(categories)) {
      if (key.toLowerCase() === inputCategoryLower) {
        matchedKey = key;
        break;
      }
    }

    // Check category names (case-insensitive)
    if (!matchedKey) {
      for (const [key, name] of Object.entries(categories)) {
        if (name.toLowerCase() === inputCategoryLower) {
          matchedKey = key;
          break;
        }
      }
    }

    if (!matchedKey) {
      const categoryList = Object.entries(categories)
        .map(([key, name]) => `• <b>${key}</b>: ${name}`)
        .join("\n");
      const invalidCategoryMessage = `⚠️ <b>Invalid Category:</b> "${escapeHtml(categoryStr)}"\n\nPlease use one of the valid category keys or names below:\n\n${categoryList}`;
      await sendTelegramMessage(chatId, invalidCategoryMessage);
      return Response.json({ success: false, error: "Invalid category" }, { status: 200 });
    }

    // 5. Encrypt and insert transaction
    const newTransaction = {
      isExpense: true,
      amount: encrypt(amountInCents.toString()),
      note: noteStr ? noteStr.trim() : null,
      establishment: encrypt(establishmentStr.trim()),
      category: matchedKey,
      isEssential: false,
      userId: userId,
      transactionDate: new Date(),
    };

    await db.insert(transactions).values(newTransaction);

    // Revalidate Next.js cache
    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard");

    // 6. Send confirmation message
    const formattedAmount = (amountInCents / 100).toFixed(2);
    const categoryName = (categories as any)[matchedKey];
    const successMessage = `✅ <b>Transaction Logged!</b>\n\n<b>Amount:</b> $${formattedAmount}\n<b>Category:</b> ${categoryName} (${matchedKey})\n<b>Establishment:</b> ${escapeHtml(establishmentStr.trim())}${noteStr ? `\n<b>Note:</b> ${escapeHtml(noteStr.trim())}` : ""}`;
    
    await sendTelegramMessage(chatId, successMessage);

    return Response.json({ success: true, message: "Transaction logged" }, { status: 200 });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    if (chatId) {
      try {
        const errorMessage = `❌ <b>System Error</b>\n\nAn unexpected error occurred while logging your transaction. Please try again later.`;
        await sendTelegramMessage(chatId, errorMessage);
      } catch (tgError) {
        console.error("Failed to send error message to Telegram:", tgError);
      }
    }
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
