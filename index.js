const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;


const staffList = `📋 *AD-187 NCTH - 21 STAFF*
1. MICHAEL CAMP BOSS - 056 9162484
2. SUMAN - 056-1680364
3. PROBIR - 056-2952464
4. Waqas LAUNDRY - 056-2242925
5. AMIT SAHU - 054 2430326
6. ABHIJT GHOSH - 054-3958105
7. GURPREET - 050 8816454
8. GANGA PRASAD - 054-5791554
9. AHMED YASEER - 050-1080691
10. PALASH DEY - 056 2836897
11. SAWKAT ALAM - 054 3614150
12. BIRENDA - 056 642 0164
13. MAHENDRA SINGH - 052 4673416
14. Umesh Gurung - 056 8960721
15. AKASH SYNAGBO - 052 7484269
16. MD NOOR ALAM - 055-1274120
17. SHYMAL - 056-6428187
18. BHUMAIAH - 050-9790529
19. SHAHZAIB - 056-8281782
20. LIL BAHADUR - 054-3007422
21. MAN BAHADUR - 054 5954697

FIRE DAY: MICHAEL 056-9162484, DHEREJ 054-7540978, AHMED 050-1080691
FIRE NIGHT: AMIT 054-2430326, PROBIR 056-2952464, GURPREET 050 8816454`;

const contractFull = `📄 *AD-187 FULL ADNOC CONTRACT*
BRANDS (Page167): Rice Basmati 1121 Sinnara India Gate Zeeba Al Aseel Al Hakim XXL Flour Grand Mills Pills Burry Al Baker Jenan Milk Al Ain Al Marai Lacnor Al Rawabi All HALAL UAE ICV H-11-B2
MANNING (Page240 Annexure11): Contractor Manning Proposals Framework Personnel mobilization Badges medical safety Uniform white 2x daily PPE Camp Boss 24/7 056 9162484 21 staff
RULES (Page90): Clean after meal After hours with SITE REP approval NO extra VIP NO extra Halal White uniform 2x PPE Table Setup Knife Fork Spoon Dessert Spoon/Fork Soup Spoon Water glass Napkin holders Placemats Cruet set salt pepper oil vinegar toothpick 2-ply napkins mint toothpicks 4 weekly menus 2 weeks advance
SAMPLE BREAKFAST (Page137): Contractor A 1 Juice Hot&Cold Milk 1 Cereal+Oats Full&Low fat Yoghurt Honey Jam Butter 3 Bakery White/Brown Arabic+extra 2 Veg Cut 2 Cheese+Labneh Main 2 Arabic Foul FalaFel+1 Asian Sambar/Chutney+1 Continental+Boiled/Scrambled/Fried Eggs+Steamed Rice 3 Condiments Tea/Coffee/Horlicks`;

const menu = {
  saturday: { breakfast: "Grape Fruit Juice HOT&COLD MILK Oats/Corn Flakes Yoghurt Honey jam butter Bread White&Brown Arabic Tomato Onion Cucumber THREE CHEESE Foul FalaFel Mixed Sabji Moong dal Sambar Chutney Boiled/scrambled/fried egg Steamed Rice French Toast Baked Beans Grilled Veg Hasbrow", lunch: "ASSORTED SALADS Olives Pickles Papadum arabic salona GRILLED FISH CHICKEN ZURBIAN Beef Stew Butter Chicken Hyderabadi Baingan Moong Dal Fry Motta Rice/Dahi Curry Steamed Rice THREE SWEETS Chapati Fruits Juices", dinner: "sweet corn soup beef mortdella Tomato Wedge Cucumber Lettuce etc Hammous Fusli Olive Tabula arabic rice BEEF STROGOFF fish fry chicken korma Veg Jalfraizee Masour dal Mota Rice White Rice" },
  sunday: { breakfast: "Cocktail Foul Mudammas FalaFel Mix Bhaji Channa Masala Chicken Liver Masala Spicy Red Chutney Boiled Eggs Steamed Rice French Toast Baked Beans Grilled Veg Hasbrow", lunch: "chicken mulukhiya LAMB MANDI gulash Adobo Chicken Kerala Mackerel Fish Aloo Bindi Chana Dal Motta Rice/Rasam", dinner: "chickpeas soup luncheon meat MAJBOUS RICE BEEF STEW CHICKEN FINGER Keema mutter/parotho Veg Kolhapuri Dal Fry" },
  monday: { breakfast: "Guava Foul Mudammas FalaFel Veg Kurma/Mutton Keema Mutter Tomato Chutney Hot & Spicy Sauce Boiled Eggs Steamed Rice", lunch: "spinach salona chicken sumac vermicelli rice BEEF PAKSIW Fish Biryani Kabuli Chana Dal Maharani Motta Rice/Sambar", dinner: "broccoli soup salami saffron rice CHICKEN ZATER CHICKEN CASSAROLE FISH CURRY Red Pumpkin Chana Dal" },
  tuesday: { breakfast: "Apple Foul Mudammas FalaFel Dosa Aloo Mutter Sambar Chutney Boiled Eggs Steamed Rice", lunch: "okra salona jasheed Arabic Rice beef vegetable chicken achari Cabbage Thoran Moong Dal Fry Motta Rice/Dahi", dinner: "lentil soup chicken mandi foul falafel fish masturd sauce beef do pyaza aloo bhigon channa dal" },
  wednesday: { breakfast: "Grape Fruit Foul Mudammas FalaFel Dal Kichadi White Channa Masala Grilled sausage Masala Spicy tomato Chutney", lunch: "cut beans salona Chicken Maqlouba macaroni baschamel CHICKEN NASHIF Andhra Sardine Fish Coconut White Pumpkin Panchratan Dal Tadka Motta Rice/Rasam", dinner: "beef gulash soup chicken kabsa Beef Shakriya pizza Fish Masala Aloo Palak Mix Dal" },
  thursday: { breakfast: "Cocktail Foul Mudammas FalaFel Veg Kichadi Moong Whole Masala Sambar Spicy Chutney", lunch: "Black Beans salona Sea Food tajin chicken Kabsa Beef Roast Garlic chicken fri indian style Black Chana Masala Toor Dal Tadka Motta Rice", dinner: "moroccan lamb lentil soup mujaidra rice Chicken Escalope lahm nashif chicken KHURMA Snake Gourd Dal Fry" },
  friday: { breakfast: "Guava Foul Mudammas FalaFel Rava Upma Dal Mix Bhaji Chicken Masala Spicy Tomato Chutney", lunch: "Potato Salona moroccan chicken dollma CHICKEN FINGER chicken biryani/veg biryani Yam Black Beans Masala Dal Masala Fry Motta Rice", dinner: "shilfish soup leeks turmeric chicken mortdella Veg Rice chicken roast Fresh Veg Fish mashwai CHICKEN ACHARI Tapioka Green Moong Dal" }
};

function getTodayMenu(){const days=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];const today=days[new Date().getDay()];const m=menu[today];return `🍽️ *TODAY ${today.toUpperCase()} - 4th WEEK SEPT 2026*\\n${m.breakfast}\\n\\nLUNCH: ${m.lunch}\\n\\nDINNER: ${m.dinner}`;}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

  const sock = makeWASocket({
    auth: state,
    browser: ["AD-187 NCTH BOT", "Chrome", "1.0.0"],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if(qr) {
      console.log("QR CODE FOUND - Scan with WhatsApp:");
    
      console.log("Or link with Pairing Code - Wait...");
      // Request pairing code after 5 seconds
      setTimeout(async () => {
        try {
          if(!state.creds.registered) {
            const code = await sock.requestPairingCode("971569162484"); // 971 + 56 9162484 (without 0)
            console.log(`🔢 PAIRING CODE FOR 0569162484: ${code}`);
            console.log("Go to WhatsApp > Linked Devices > Link with phone number > Enter this code");
          }
        } catch(e){ console.log("Pairing code error", e.message); }
      }, 5000);
    }

    if(connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut;
      console.log('Connection closed, reconnecting:', shouldReconnect, lastDisconnect?.error);
      if(shouldReconnect) startBot();
      else console.log("Logged out - need new QR/pairing");
    } else if(connection === 'open') {
      console.log('✅ BOT CONNECTED - AD-187 LIVE');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if(!msg.message || msg.key.fromMe) return;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const lower = text.toLowerCase().trim();
    const from = msg.key.remoteJid;
    let reply = "";
    if(['hi','hello','hey','salam'].includes(lower) || lower.startsWith('hi ') || lower.startsWith('hello')) {
      reply = `👋 *AD-187 NCTH BOT LIVE*\\n🍽️ *today menu*\\n📅 *week menu*\\n👷 *staff list*\\n📄 *contract*\\n🏷️ *food brands*\\n📋 *adnoc rules*\\n🔥 *fire team*\\n🏕️ *campboss* 056 9162484`;
    } else if(lower.includes('today')) reply = getTodayMenu();
    else if(lower.includes('staff') || lower.includes('contact')) reply = staffList;
    else if(lower.includes('contract')) reply = contractFull;
    else if(lower.includes('food brand')) reply = `🏷️ Rice Basmati 1121 Sinnara India Gate Zeeba Al Aseel Al Hakim XXL Flour Grand Mills Pills Burry Al Baker Jenan Milk Al Ain Al Marai Lacnor Al Rawabi HALAL UAE ICV`;
    else if(lower.includes('adnoc') || lower.includes('restaurant') || lower.includes('mess rule')) reply = `📋 Clean after meal After hours SITE REP approval NO extra VIP NO extra Halal White uniform 2x PPE Table Knife Fork Spoon Dessert Spoon/Fork Soup Spoon Water glass Napkin holders Placemats Cruet set 2-ply napkins mint toothpicks 4 weekly menus 2 weeks advance`;
    else if(lower.includes('manning')) reply = `👨‍🍳 Manning Annexure11 Personnel mobilization Badges medical safety Uniform white 2x PPE Boss 24/7 056 9162484 21 staff`;
    else if(lower.includes('fire')) reply = `🔥 DAY: MICHAEL 056-9162484 DHEREJ 054-7540978 AHMED 050-1080691 NIGHT: AMIT 054-2430326 PROBIR 056-2952464 GURPREET 050 8816454`;
    else if(lower.includes('campboss')) reply = `🏕️ CAMP BOSS MICHAEL - 056 9162484`;
    else if(lower.includes('week menu') || lower==='menu') reply = `📅 4th WEEK SEPT Send *today menu* *saturday breakfast* *sunday lunch* *monday dinner* etc *staff list* *contract*`;
    else {
      const days=['saturday','sunday','monday','tuesday','wednesday','thursday','friday'];
      const meals=['breakfast','lunch','dinner'];
      let d=days.find(x=>lower.includes(x)); let m=meals.find(x=>lower.includes(x));
      if(d && m && menu[d]) reply=`🍽️ *${d.toUpperCase()} ${m.toUpperCase()}*\\n${menu[d][m]}`;
      else if(d && menu[d]) reply=`🍽️ *${d.toUpperCase()} FULL*\\nBREAKFAST: ${menu[d].breakfast}\\nLUNCH: ${menu[d].lunch}\\nDINNER: ${menu[d].dinner}`;
      else reply=`🤔 Try *today menu* or *staff list* or *contract*`;
    }
    if(reply) await sock.sendMessage(from, { text: reply });
  });
}

app.get('/', (req,res)=>res.send('<h1>AD-187 BOT LIVE FIXED ✅</h1><p>Logs will show QR + Pairing Code</p><p>Bot: 0569162484</p>'));
app.listen(PORT, ()=>console.log('Server',PORT));
startBot();
