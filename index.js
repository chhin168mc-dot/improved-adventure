const TelegramBot = require('node-telegram-bot-api');

// 👉 TOKEN
const token = "8769311385:AAHUkyDAUsmD5nw7_jpMqpCVsJfNDCgyeHg";

// 👉 GROUP ID (optional)
const allowedChatId = "-1003766640321";

const bot = new TelegramBot(token, { polling: true });

// 👉 Warn system
let warnings = {};

// 👉 Regex link
const linkRegex = /(https?:\/\/|t\.me\/|www\.)\S+/gi;

bot.on('message', async (msg) => {
    try {
        const chatId = msg.chat.id;
        const chatType = msg.chat.type;
        const userId = msg.from.id;

        // ❌ skip channel
        if (chatType === "channel") return;

        // 👉 restrict group
        if (allowedChatId && chatId.toString() !== allowedChatId.toString()) return;

        if (!msg.text) return;

        // 🔍 detect link
        if (linkRegex.test(msg.text)) {

            // 🗑 delete message
            await bot.deleteMessage(chatId, msg.message_id);

            // 👉 init warn
            if (!warnings[userId]) warnings[userId] = 0;

            warnings[userId]++;

            // ⚠️ send warn
            await bot.sendMessage(chatId,
                `⚠️ @${msg.from.username || "user"} កុំផ្ញើ link!\nWarn: ${warnings[userId]}/3`,
                { reply_to_message_id: msg.message_id }
            );

            console.log(`Warn ${warnings[userId]} | User: ${userId}`);

            // 🔨 ban after 3 warns
            if (warnings[userId] >= 3) {
                await bot.banChatMember(chatId, userId);

                await bot.sendMessage(chatId,
                    `🚫 User @${msg.from.username || userId} ត្រូវបាន ban ព្រោះ spam link`
                );

                console.log(`BANNED: ${userId}`);

                // reset warn
                delete warnings[userId];
            }
        }

    } catch (err) {
        console.log("Error:", err.message);
    }
});
