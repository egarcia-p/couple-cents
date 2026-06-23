# Telegram Bot - Setup & Production Deployment Guide

This guide explains how to configure and deploy the Telegram bot integration in development and production environments, along with copy-pasteable instructions for end users.

---

## 1. Administrator Setup (Registering a New User)

To authorize a new user, you must map their Telegram Chat ID to their `couple-cents` Application User ID.

### Step 1: Retrieve IDs
1. **Telegram Chat ID:** Ask the user to send you their Chat ID (see instructions in Section 3).
2. **App User ID:** Look up the user's ID in the `couple_cents` database:
   * Run Drizzle Studio:
     ```bash
     npx drizzle-kit studio
     ```
   * Open `http://localhost:4983` in your browser.
   * Go to the `user` table and find the user's record to copy their `id` field.

### Step 2: Update Mappings
1. Open your `.env.local` (or production dashboard).
2. Find the `TELEGRAM_USER_MAPPINGS` variable.
3. Append the new mapping in the format `telegram_chat_id:app_user_id` separated by a comma.
   
   **Example:**
   ```env
   TELEGRAM_USER_MAPPINGS="111111:user_id_1,222222:user_id_2"
   ```

### Step 3: Restart Server
* Restart your local server (or redeploy) for the environment variables to take effect.

---

## 2. Production Deployment Guide

When deploying the bot to production, follow these steps to secure the integration and set up the production bot.

### Step 1: Create a Production Telegram Bot
1. Open Telegram and start a chat with **[BotFather](https://t.me/BotFather)**.
2. Send `/newbot` and create your production bot (e.g. `couple_cents_prod_bot`).
3. Save the **HTTP API Token** generated for your production bot.

### Step 2: Generate a Webhook Secret Token
To prevent unauthorized requests from invoking your webhook endpoint, we use a secret token shared between Telegram and your application server. Telegram will include this secret in the `X-Telegram-Bot-Api-Secret-Token` header.

Generate a strong random alphanumeric string (characters `A-Z`, `a-z`, `0-9`, `_`, and `-` up to 256 bytes):
```bash
# Example generating a secure string
openssl rand -base64 32 | tr -dc 'a-zA-Z0-9_-'
```
*Example Secret:* `Z6y7X7w1V7u3T4s5R6q7P8o9N0m1L2k3`

### Step 3: Configure Production Environment Variables
Set the following keys in your hosting platform's dashboard (e.g. Vercel, Railway, Render):

| Environment Variable | Description |
| :--- | :--- |
| `TELEGRAM_BOT_TOKEN` | The production API token retrieved from `@BotFather`. |
| `TELEGRAM_USER_MAPPINGS` | Comma-separated list of Telegram Chat IDs to App User IDs (`id:user_123,id:user_456`). |
| `TELEGRAM_WEBHOOK_SECRET` | The secure secret token generated in Step 2. |

### Step 4: Register the Webhook with Telegram
Make a POST request to Telegram's API to bind the webhook URL to your production server and configure the secret token.

Run this `curl` command (replace `<PROD_DOMAIN>`, `<TELEGRAM_WEBHOOK_SECRET>`, and `<TELEGRAM_BOT_TOKEN>` with your values):

```bash
curl -F "url=https://<PROD_DOMAIN>/api/webhooks/telegram" \
     -F "secret_token=<TELEGRAM_WEBHOOK_SECRET>" \
     https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook
```

*Verify that the response returns `{"ok":true,"result":true,"description":"Webhook was set"}`.*

### Step 5: Verify Webhook Security
You can verify the security setup is working by sending a manual test request to your production endpoint without the secret header. It should return a `403 Forbidden`:

```bash
curl -X POST https://<PROD_DOMAIN>/api/webhooks/telegram \
     -H "Content-Type: application/json" \
     -d '{"message": {"chat": {"id": 12345}}}'
```
*(Expected response: `{"success":false,"error":"Unauthorized origin"}`)*

---

## 3. Instructions to Send to the User

*Copy and send the text below directly to the new user:*

***

### 🤖 How to set up and use the Transaction Bot

You can now log expenses directly to `couple-cents` from your phone using Telegram! Here is how to get started:

#### A. One-Time Setup
1. Open Telegram and search for our bot: **@[Insert your Bot Username here]** (click **Start**).
2. To authorize your account, we need your Telegram Chat ID:
   * Message the official **@userinfobot** (https://t.me/userinfobot) on Telegram.
   * It will respond with your **Id** (a number like `987654321`).
   * **Copy and send that number to me** so I can link it to your account.
3. I will let you know once it's linked!

---

#### B. How to Log Expenses
Once authorized, open our bot's chat and send transactions using this format:

```text
/spend <amount> <category> <establishment> [optional note]
```
*(You can also use `/gasto` instead of `/spend`)*

**Examples:**
* `/spend 14.50 GRO Walmart weekly groceries`
* `/spend 120.00 UTI Electric bill`
* `/spend 4.50 DIN Starbucks morning coffee`
* `/spend 50 ENT Cinema ticket`

---

#### C. Valid Category Shortcuts
When logging, you can type either the **3-letter category code** or the **full name** (case-insensitive):

* 🧸 **CHI** or `childcare` - Childcare
* 🍽️ **DIN** or `dining out` - Dining Out
* 🎓 **EDU** or `education` - Education
* 🍿 **ENT** or `entertainment` - Entertainment
* ⚽ **FIT** or `fitness and sports` - Fitness and Sports
* 🎁 **GIF** or `gifts and donations` - Gifts and Donations
* 🛒 **GRO** or `groceries` - Groceries
* 🏥 **HEA** or `healthcare` - Healthcare
* 🏠 **HOU** or `housing` - Housing
* 🛡️ **INS** or `insurance` - Insurance
* 💇 **PER** or `personal care` - Personal Care
* 🐾 **PET** or `pets` - Pets
* 📈 **SAV** or `savings and investments` - Savings & Investments
* 🛠️ **SER** or `services` - Services
* 🛍️ **SHO** or `shopping` - Shopping
* 🚗 **TRA** or `transportation` - Transportation
* 💡 **UTI** or `utilities` - Utilities
* ✈️ **VAC** or `vacations` - Vacations
