const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const express = require('express')
const QRCode = require('qrcode')
const P = require('pino')

const app = express()
const PORT = process.env.PORT || 3000
let qrCodeData = ''
let isConnected = false

const KNOWLEDGE = {
  greeting: `Welcome to Ncth AI bot how may help you please\n\nType:\n- mess timing\n- menu\n- laundry\n- campboss number\n- room boy`,
  mess: `The mess hall time is as follow:\n\nBreakfast (4:30am till 7:30am)\nLunch (10:30am till 1:30pm)\nDinner (4:30pm till 7:30pm)\n\nPlease ensure when coming to the mess dirty coveralls and short above the knees are not allowed, Avoid tops that reveals the armpits.`,
  laundry: `Laundry timing:\n\nPicks at 10am, 11am and returns at 10am, 11am.\nPicks at 3pm, 4pm and returns 8pm.\n\nFor any doubt please contact the campboss\n0567974819 / 0569162484`,
  campboss: `Campboss numbers:\n0567974819\n0569162484\nYou can reach him through whatsapp as well on the second number.`,
  roomBoy: `Thanks for contacting, please specify your room number and the campboss will be notified immediately\n\nExample: Room 105 need cleaning`,
  menuWeek: `*WEEKLY MENU - NCTH CAMP*\n\nSunday: Chicken Lasooni + Rice + Dal\nMonday: Chicken Dum Briyani\nTuesday - BBQ NIGHT: Shawarma, Kofta, Grilled Prawns\nWednesday: Chicken 65 + Rice\nThursday: Chicken Fried Rice\nFriday: Chicken Biryani Special\nSaturday: Chicken Curry + Dal\n\nType "today menu" for today's menu`
}

function getTodayMenu(){
  const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const today=days[new Date().getDay()]
  const menus={
    'Sunday':'Today (Sunday): Chicken Lasooni / Dinner: Chicken Curry',
    'Monday':'Today (Monday): Chicken Dum Biryani / Egg Curry',
    'Tuesday':'Today is TUESDAY - BBQ NIGHT! Shawarma, Kofta, Prawns',
    'Wednesday':'Today (Wednesday): Chicken 65 / Mutton Curry',
    'Thursday':'Today (Thursday): Chicken Fried Rice / Fish Curry',
    'Friday':'Today (Friday): Chicken Biryani Special',
    'Saturday':'Today (Saturday): Chicken Curry + Dal / Mutton Biryani'
  }
  return menus[today]+"\n\n"+KNOWLEDGE.menuWeek
}

function matchIntent(text){
  const t=text.toLowerCase().trim()
  if(/^(hi|hello|hey|salam)/i.test(t) || t.length<4) return 'greeting'
  if(/(mess|mes+|mash|breakfast|lunch|dinner|mess hall)/i.test(t)) return 'mess'
  if(/(laundry|londry|landry|laundary|cloth|washing|kapda)/i.test(t)) return 'laundry'
  if(/(campboss|camp boss|boss number|manager)/i.test(t)) return 'campboss'
  if(/(room boy|room service|clean.*room|room.*clean)/i.test(t)) return 'roomBoy'
  if(/(menu|today.*food|food.*today|khana|bbq)/i.test(t)) return 'menu'
  if(/room\s*\d+/i.test(t)) return 'roomBoyWithNumber'
  return 'unknown'
}

async function startBot(){
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')
  const sock = makeWASocket({ auth: state, logger: P({ level: 'silent' }), printQRInTerminal:false, browser:['NCTH','Chrome','1.0'] })
  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', async (update)=>{
    const { connection, lastDisconnect, qr } = update
    if(qr){ qrCodeData=qr }
    if(connection==='close'){
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut
      if(shouldReconnect) startBot()
      else isConnected=false
    } else if(connection==='open'){ isConnected=true; qrCodeData='' }
  })
  sock.ev.on('messages.upsert', async ({ messages })=>{
    for(const msg of messages){
      if(!msg.message || msg.key.fromMe) continue
      const from=msg.key.remoteJid
      const text=msg.message.conversation || msg.message.extendedTextMessage?.text || ''
      if(!text) continue
      const intent=matchIntent(text)
      let reply=''
      if(intent==='greeting') reply=KNOWLEDGE.greeting
      else if(intent==='mess') reply=KNOWLEDGE.mess
      else if(intent==='laundry') reply=KNOWLEDGE.laundry
      else if(intent==='campboss') reply=KNOWLEDGE.campboss
      else if(intent==='roomBoy') reply=KNOWLEDGE.roomBoy
      else if(intent==='roomBoyWithNumber') reply=`Noted! ${text}\nCampboss notified. Boy will come.\n${KNOWLEDGE.campboss}`
      else if(intent==='menu') reply=/today/i.test(text)?getTodayMenu():KNOWLEDGE.menuWeek
      else reply=`Sorry, I didn't understand.\nI can help with:\n- Mess timing\n- Today's menu\n- Laundry timing\n- Campboss number\n- Room boy\n\n${KNOWLEDGE.campboss}`
      await sock.sendMessage(from, { text: reply })
    }
  })
}
startBot()

app.get('/', async (req,res)=>{
  if(isConnected){ res.send('<h1>✅ NCTH Bot LIVE on 0569162484</h1>') }
  else if(qrCodeData){
    const qrImage=await QRCode.toDataURL(qrCodeData)
    res.send(`<html><body style="text-align:center;font-family:Arial;padding:20px"><h1>NCTH Camp Bot - Scan with 0569162484</h1><p>WhatsApp > Linked Devices > Link a Device > Scan</p><img src="${qrImage}" style="width:300px"/><p>Refresh if QR expires</p></body></html>`)
  } else { res.send('<h1>Starting... Refresh 5 sec</h1><script>setTimeout(()=>location.reload(),5000)</script>') }
})
app.listen(PORT, ()=>console.log('Server '+PORT))
