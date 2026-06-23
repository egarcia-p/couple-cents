# Telegram Bot - User Setup Guide

This guide explains how to add new users to the Telegram bot integration and contains copy-pasteable instructions to send to users.

---

## 1. Administrator Setup (Registering a New User)

To authorize a new user, you must map their Telegram Chat ID to their `couple-cents` Application User ID.

### Step 1: Retrieve IDs
1. **Telegram Chat ID:** Ask the user to send you their Chat ID (see instructions below).
2. **App User ID:** Look up the user's ID in the `couple_cents` database:
   * Run Drizzle Studio:
     ```bash
     npx drizzle-kit studio
     ```
   * Open `http://localhost:4983` in your browser.
   * Go to the `user` table and find the user's record to copy their `id` field.

### Step 2: Update Mappings
1. Open your `.env.local` (or production environment configuration).
2. Find the `TELEGRAM_USER_MAPPINGS` variable.
3. Append the new mapping in the format `telegram_chat_id:app_user_id` separated by a comma.
   
   **Example:**
   ```env
   TELEGRAM_USER_MAPPINGS="111111:user_id_1,222222:user_id_2"
   ```

### Step 3: Restart Server
* Restart your local server (or redeploy) for the environment variables to take effect.

---

## 2. Instructions to Send to the User

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
