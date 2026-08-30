const fs = require("fs");
const path = require("path");

const dir = "C:/Users/usuario/Downloads/Kavari1.4/Kavariwebsite";
const files = fs.readdirSync(dir).filter(f => f.endsWith(".html"));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, "utf8");

    // 1. Remove debug button
    content = content.replace(/<button id="manual-bot-btn"[\s\S]*?<\/script>/g, "");

    // 2. Remove existing Botpress inline block
    content = content.replace(/<!-- Botpress Webchat -->\s*<script src="https:\/\/cdn\.botpress\.cloud\/webchat\/v3\.7\/inject\.js"><\/script>\s*<script[\s\S]*?<\/script>/g, "");

    // 3. Add clean implementation
    const botpressHtml = `\n<!-- Botpress Webchat -->\n<script src="https://cdn.botpress.cloud/webchat/v3.7/inject.js"></script>\n<script src="js/chatbot.js"></script>\n`;
    content = content.replace("</body>", botpressHtml + "</body>");

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
