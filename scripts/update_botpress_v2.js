const fs = require("fs");
const path = require("path");

const dir = "C:/Users/usuario/Downloads/Kavari1.4/Kavariwebsite";
const files = fs.readdirSync(dir).filter(f => f.endsWith(".html"));

const newBotpressScripts = `
<!-- Botpress Webchat -->
<script src="https://cdn.botpress.cloud/webchat/v3.7/inject.js"></script>
<script src="https://files.bpcontent.cloud/2026/08/28/15/20260828152119-PPLK2M38.js" defer></script>
`;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, "utf8");

    // Remove any previous Botpress related blocks (both the inline ones and the js/chatbot.js ones)
    content = content.replace(/<!-- Botpress Webchat -->[\s\S]*?<\/script>/g, "");
    content = content.replace(/<script src="js\/chatbot\.js"><\/script>/g, "");
    
    // Ensure any leftover debug buttons are gone
    content = content.replace(/<button id="manual-bot-btn"[\s\S]*?<\/script>/g, "");

    // Insert the new script block before </body>
    content = content.replace("</body>", newBotpressScripts + "</body>");

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file} with new Botpress scripts`);
});
