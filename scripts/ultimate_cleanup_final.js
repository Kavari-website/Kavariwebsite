const fs = require("fs");
const path = require("path");

const dir = "C:/Users/usuario/Downloads/Kavari1.4/Kavariwebsite";
const files = fs.readdirSync(dir).filter(f => f.endsWith(".html"));

const polishedStyle = `
<style>
  #bp-webchat-container, .bp-webchat-container {
    z-index: 999999 !important;
  }
  .bp-webchat-trigger, .botpress-webchat-button {
    transform: scale(1.4) !important; 
    transform-origin: bottom right !important;
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3)) !important;
    transition: transform 0.3s ease !important;
  }
  .bp-webchat-trigger:hover, .botpress-webchat-button:hover {
    transform: scale(1.5) !important;
  }
</style>
`;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, "utf8");

    // REMOVE DEBUG BUTTONS
    content = content.replace(/<button id=["\']manual-bot-btn["\'][\s\S]*?<\/script>/g, "");
    content = content.replace(/<button id=["\']manual-bot-btn["\'].*?<\/button>/g, "");

    // ADD Polished Style
    if (content.includes("</head>")) {
        content = content.replace(/<style>[\s\S]*?\.bp-webchat-trigger[\s\S]*?<\/style>/g, "");
        content = content.replace("</head>", polishedStyle + "\n</head>");
    }

    fs.writeFileSync(filePath, content);
    console.log("Fixed: " + file);
});
