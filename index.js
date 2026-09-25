const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const express = require('express');
const QRCode = require('qrcode');
const app = express();
const PORT = process.env.PORT || 10000;

let qrImageUrl = null;
let isConnected = false;

const staffList = `📋 AD-187 NCTH - 21 STAFF
1. MICHAEL CAMP BOSS 056 9162484
2. SUMAN 056-1680364
3. PROBIR 056-2952464
4. Waqas 056-2242925
5. AMIT 054 2430326
6. ABHIJT 054-3958105
7. GURPREET 050 8816454
8. GANGA 054-5791554
9. AHMED 050-1080691
10. PALASH 056 2836897
11. SAWKAT 054 3614150
12. BIRENDA 056 642 0164
13. MAHENDRA 052 4673416
14. Umesh 056 8960721
15. AKASH 052 7484269
16. MD NOOR 055-1274120
17. SHYMAL 056-6428187
18. BHUMAIAH 050-9790529
19. SHAHZAIB 056-8281782
20. LIL BAHADUR 054-3007422
21. MAN BAHADUR 054 5954697`;

const contractFull = `📄 AD-187 FULL CONTRACT BRANDS: Basmati 1121 Sinnara India Gate Zeeba Al Aseel XXL Flour Grand Mills Al Baker Jenan Milk Al Ain Al Marai HALAL UAE ICV MANNING: 21 staff Boss 24/7 056 9162484 RULES: Clean after meal SITE REP approval White uniform 2x`;

const menu = {
saturday: { b: "Grape Fruit Juice MILK Oats Yoghurt Bread Foul FalaFel Sabji Moong dal Sambar Egg Rice Toast Beans", l: "SALADS Olives Papadum salona GRILLED FISH CHICKEN ZURBIAN Beef Stew Butter Chicken Baingan Dal Fry Motta Rice Steamed Rice SWEETS", d: "sweet corn soup mortdella Tabula arabic rice BEEF STROGOFF fish fry chicken korma Veg Jalfraizee dal" },
sunday: { b: "Cocktail Foul FalaFel Mix Bhaji Channa Chicken Liver Chutney Egg Rice Toast Beans", l: "chicken mulukhiya LAMB MANDI gulash Adobo Chicken Mackerel Fish Aloo Bindi Dal Rice Rasam", d: "chickpeas soup luncheon MAJBOUS RICE BEEF STEW CHICKEN FINGER Keema parotho Veg Kolhapuri Dal" },
monday: { b: "Guava Foul FalaFel Veg Kurma Keema Mutter Chutney Egg Rice", l: "spinach salona chicken sumac vermicelli BEEF PAKSIW Fish Biryani Chana Dal Motta Sambar", d: "broccoli soup salami saffron CHICKEN ZATER CASSAROLE FISH CURRY Pumpkin Chana Dal" },
tuesday: { b: "Apple Foul FalaFel Dosa Aloo Mutter Sambar Egg Rice", l: "okra salona jasheed Arabic Rice beef veg chicken achari Cabbage Thoran Dal Dahi", d: "lentil soup chicken mandi foul falafel fish mustard beef do pyaza dal" },
wednesday: { b: "Grape Fruit Foul FalaFel Dal Kichadi White Channa sausage Chutney", l: "cut beans salona Chicken Maqlouba macaroni baschamel NASHIF Sardine Fish Coconut Pumpkin Panchratan Dal Rasam", d: "beef gulash soup chicken kabsa Beef Shakriya pizza Fish Masala Aloo Palak Mix Dal" },
thursday: { b: "Cocktail Foul FalaFel Veg Kichadi Moong Masala Sambar", l: "Black Beans salona Sea Food tajin Kabsa Beef Roast Garlic chicken Black Chana Toor Dal Motta", d: "moroccan lamb soup mujaidra Chicken Escalope lahm nashif KHURMA Snake Gourd Dal" },
friday: { b: "Guava Foul FalaFel Rava Upma Dal Mix Bhaji Chicken Masala", l: "Potato Salona moroccan dollma CHICKEN FINGER biryani Yam Black Beans Dal Masala Motta", d: "shilfish soup leeks mortdella Veg Rice chicken roast Fish mashwai ACHARI Tapioka Moong Dal" }
};
function getTodayMenu(){const days=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];const t=days[new Date().getDay()];const m=menu[t];return `🍽️ TODAY ${t.toUpperCase()}\\nBFAST: ${m.b}\\nLUNCH: ${m.l}\\nDINNER: ${m.d}`;}

async function startBot() {
const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys_qr');
const sock = makeWASocket({ auth: state, browser: ["AD-187","Chrome","1.0"] });
sock.ev.on('creds.update', saveCreds);
sock.ev.on('connection.update', async (update) => {
const { connection, lastDisconnect, qr } = update;
if(qr) {
console.log("QR RECEIVED - Generating image...");
qrImageUrl = await QRCode.toDataURL(qr);
isConnected = false;
console.log("QR READY - Open https://ncth-bot.onrender.com to scan");
}
if(connection === 'close') {
const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut;
if(shouldReconnect){ isConnected=false; startBot(); } else { qrImageUrl=null; console.log("Logged out"); }
} else if(connection === 'open') {
isConnected=true; qrImageUrl=null;
console.log('✅ BOT CONNECTED - AD-187 LIVE');
}
});
sock.ev.on('messages.upsert', async ({ messages }) => {
const msg = messages[0]; if(!msg.message || msg.key.fromMe) return;
const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
const lower = text.toLowerCase().trim(); const from = msg.key.remoteJid; let reply="";
if(['hi','hello','hey','salam'].includes(lower)){ reply=`👋 AD-187 BOT LIVE\\n🍽️ today menu\\n👷 staff list\\n📄 contract\\n🔥 fire team\\n🏕️ campboss 056 9162484`; }
else if(lower.includes('today')) reply=getTodayMenu();
else if(lower.includes('staff')) reply=staffList;
else if(lower.includes('contract')) reply=contractFull;
else if(lower.includes('fire')) reply=`🔥 DAY: MICHAEL 056-9162484 DHEREJ 054-7540978 AHMED 050-1080691 NIGHT: AMIT 054-2430326 PROBIR 056-2952464 GURPREET 050 8816454`;
else if(lower.includes('campboss')) reply=`CAMP BOSS MICHAEL 056 9162484`;
else {
const days=['saturday','sunday','monday','tuesday','wednesday','thursday','friday']; const meals=['breakfast','lunch','dinner'];
let d=days.find(x=>lower.includes(x)); let m=meals.find(x=>lower.includes(x));
if(d && m) reply=`${d.toUpperCase()} ${m.toUpperCase()}: ${menu[d][m][0]}`; else if(d) reply=`${d.toUpperCase()} B:${menu[d].b} L:${menu[d].l} D:${menu[d].d}`;
else reply=`Try today menu or staff list`;
}
if(reply) await sock.sendMessage(from, { text: reply });
});
}

app.get('/', async (req,res)=>{
if(isConnected) res.send('<h1>✅ BOT CONNECTED - AD-187 LIVE</h1><p>0569162484 is working!</p>');
else if(qrImageUrl) res.send(`<h1>📱 SCAN QR - AD-187 BOT</h1><p>Open WhatsApp on 0569162484 > Linked Devices > Link a Device > Scan QR</p><img src="${qrImageUrl}" style="width:300px;height:300px"/><p>Refresh page if QR expires (20 sec)</p><script>setTimeout(()=>location.reload(),20000)</script>`);
else res.send('<h1>⏳ Starting bot... Refresh in 5 sec</h1><script>setTimeout(()=>location.reload(),5000)</script>');
});
app.listen(PORT, ()=>console.log('Server',PORT));
startBot();
