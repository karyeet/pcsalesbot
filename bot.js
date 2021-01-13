/** 
 * This script depends on a set of JSON files in order to operate and store data. I was not sure how to or even if I should turn these in due to the fact that they aren't code.
 *  ./blacklist.json  -   A table organized by user id containing blacklisted terms.
 *  ./last.json       -   An array containing the ids of last 20 deals sent.
 *  ./notify.json     -   A table organized by flair containing which users want to be notified for what.
 *  ./salestax.json   -   A table of state taxes in the U.S for use in calculating tax
 * 
 * This script also requires:
 *  - A Discord Server
 *  - A Discord Bot API key
 * 
 * The Discord API key will not be provided in order maintain integrity & to secure the privacy of any servers the bot may be in, but one may be obtained from https://discord.com/developers/applications
 * This bot has been hosted by glitch.com and thus requires an http server to operate properly. If privately hosted, that portion of the code can be removed.
 * This script, with exceptions to wherever noted, was written entirely by myself.
*/

require('dotenv').config()
//Initialize http server to work with glitch.com
const http = require('http'); //Built-in http API.
http.createServer(function (req, res) {
  res.write('This string was omitted to comply with AP guidelines.');
  res.end();
}).listen(process.env.PORT);
console.log('Your app is listening on port '+process.env.PORT)
//

const sessionData ={
  successfulPolls:0,
  failedPolls:0,
  posts:0,
  upSince: new Date()
}

const request = require('request') // Request is a npm module which simplifies http requests https://github.com/request/request
const discord = require('discord.js') //discord.js is a npm module which provides a library for communicating with the Discord API https://github.com/discordjs/discord.js
const fs = require('fs') //Built-in filesystem API.


const salestax = JSON.parse(fs.readFileSync('./salestax.json'))
let last = JSON.parse(fs.readFileSync('./last.json','utf8'))
let blacklist = JSON.parse(fs.readFileSync('./blacklist.json','utf8'))

function saveLast(){
  if(last.length>20){last.shift()}
  fs.writeFileSync('./last.json',JSON.stringify(last))
}

function saveBlacklist(){
  fs.writeFileSync('./blacklist.json',JSON.stringify(blacklist))
}

var channel
let notifylist = JSON.parse(fs.readFileSync('./notify.json'))
const Prefix = '~'

function priceMethod1(title){
  title = title.replace(/\([^)]*\)/g,'')
  title = title.replace(/\[.*\]/g,'')
  title = title.replace(/\$\d+\.*\d*\s*-\$\d+\.*\d*\s*/,'')
  title = title.match(/\$\d+,?\d+\.*\d*/)
  return title
}

function priceMethod2(title){
  if (title.match(/\(\$?\d+\.*\d*\s*(-\$?\d+\.*\d*)?\)/)){
    title = title.match(/\(\$?\d+\.*\d*\s*(-\$?\d+\.*\d*)?\)/)
    title = title[0].replace(/\(|\)/g,'')
    if(title.match('-')){
      title = title.replace(/\$/g,'')
      title = title.match(/(\d+\.?\d*)-(\d+\.?\d*)/)
      title = '$'+(Number(title[1])-Number(title[2])).toString()
      title = title.match(/\$?\d+.?\d?\d?/)
    }
    return title
  }
}

function priceMethod3(title){ //catch the retards
	let normalGeneric = title.match(/\$\d+\.?\d+/)
	if(normalGeneric){return normalGeneric[0]}

	let retardGeneric = title.match(/\d+\.?\d+\$/)
	if(retardGeneric){return ('$'+retardGeneric[0].replace('$',''))}

	let symbolphobe = title.match(/\s\d+\.?\d+($|\s)/)
	if(symbolphobe){return '$'+symbolphobe[0].replace(/ /g,'')}
}

function getPrice(title){
  title = title.replace(/,/g,'')
	
  let method1 = priceMethod1(title)
  if(method1 && method1[0]){return method1[0]}

  let method2 = priceMethod2(title)
  if(method2){return method2}

  let method3 = priceMethod3(title)
  if(method3){return method3+' (Unsure)'}

  return 'Unable to Find Price'
}

const doNotsendIfMoreThan15MinOld = false

function isJson(str) {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}

function getData(){
request('https://www.reddit.com/r/buildapcsales/new.json?sort=new',cb1)
function cb1(_,b){
  if(!b || !b.body ||!isJson(b.body)){sessionData.failedPolls++; return}
  sessionData.successfulPolls++
  var data=JSON.parse(b.body).data.children['0'].data
  //console.log(data)
  if (last.indexOf(data.id)==-1 /*&& (new Date().getTime()/1000)-data.created<1200*/){
    //console.log(last.indexOf(data.id))
    last.push(data.id)
    saveLast()
    //console.log(data.link_flair_text)
    var mention = generateNotifyList(data.link_flair_text,data.title)
    if (data.thumbnail=='default'||data.thumbnail=='nsfw'){data.thumbnail='https://cdn.discordapp.com/avatars/598034462638604298/e0f6694d9e2d68a0ab847a5e02f771e0.png?size=128'}
    //console.log(data.thumbnail)
    sessionData.posts++
    channel.send(mention,{"embed":{
      "title":"New **"+data.link_flair_text+"** Entry",
      "description":'['+data.title+']('+data.url+')',
      "timestamp": new Date(),
      "color": 13065308,
      "thumbnail":{"url":data.thumbnail},
      "fields":[
        {
          "name":"Price",
          "value":getPrice(data.title)
        },
        {
          "name":"Reddit:",
          "value":"[Open Original](https://www.reddit.com"+data.permalink+")"
        },
      ]
    }})
  }
}
}

function generateNotifyList(flair,title){
  var string= ''
  if (flair){
    if (notifylist[flair.toUpperCase()]){
      notifylist[flair.toUpperCase()].forEach(function(user){
        if((!user.price || user.price>=Number(getPrice(title).replace('$',''))) && (!titleHaveBlacklist(title.toUpperCase(),user.id)))
          string=string+'<@'+user.id+'>'
        })
    }
  }
  return string
}

var client = new discord.Client()

client.login(process.env.token) //DISCORD API KEY HERE

client.on('ready',async ()=>{
  console.log('ready')
  channel=await client.channels.fetch('624438503178240001')//'624438503178240001') //SPECIFY CHANNEL ID TO SEND MESSAGES TO
  setInterval(function(){getData()},5000)
  client.user.setActivity('for lit deals', { type: 'WATCHING' })
          })

function commandCheck(command, message){
	var command = command.toLowerCase();
	var content = message.content.toLowerCase();
	return content.startsWith(Prefix + command);
}

function titleHaveBlacklist(title,id){
  for (let i in (blacklist[id])){
    if(title.match(blacklist[id][i])){return true}
  }
  return false
}

client.on('message',(message)=>{
  if(!message.guild || message.channel.id == channel.id){return}
  var args = message.content.slice(Prefix.length).trim().split(/ +/g);
  //console.log(args)
  var query=args.slice(1).join(' ').split(' $')

  if (commandCheck('notify',message)){
    if (query[0]){
      if(notifylist[query[0].toUpperCase()]){
        notifylist[query[0].toUpperCase()].push({id:message.author.id,price:query[1]})
        message.reply('I will now notify you for this flair.')
        fs.writeFileSync('notify.json',JSON.stringify(notifylist))
      }else{message.reply('Unknown flair, check pinned messages!')}
    }else{
      message.reply('Check pinned messages!')
    }
  }
  
  if(commandCheck('blacklist',message)){
    if(!blacklist[message.author.id]){
      blacklist[message.author.id]=[]
    }
    
    let messageList = args.slice(1).join(' ').replace(/ ,/g,',').replace(/, /g,',').split(',')
    for (let i in messageList){
      if(messageList[i].length>0 && blacklist[message.author.id].indexOf(messageList[i].toUpperCase())==-1){blacklist[message.author.id].push(messageList[i].toUpperCase())}
    }
    saveBlacklist()
    console.log(blacklist[message.author.id])
    if(blacklist[message.author.id][0]){message.reply('Your blacklisted terms are now: ```'+blacklist[message.author.id]+'```')}else{message.reply('No blacklisted terms.')}
  }
  
  if(commandCheck('unblacklist',message)){
    let messageList = args.slice(1).join(' ').replace(/ ,/g,',').replace(/, /g,',').split(',')
    for (let i in messageList){
      if(blacklist[message.author.id].indexOf(messageList[i].toUpperCase())!=-1){
        blacklist[message.author.id].splice(blacklist[message.author.id].indexOf(messageList[i].toUpperCase()),1)
      }
    }
    saveBlacklist()
    console.log(blacklist[message.author.id])
    if(blacklist[message.author.id][0]){message.reply('Your blacklisted terms are now: ```'+blacklist[message.author.id]+'```')}else{message.reply('No blacklisted terms.')}
  }
  
  if (commandCheck('unnotify',message)){
    if (query){
      query=query[0]
      if(notifylist[query.toUpperCase()]){
        if (notifylist[query.toUpperCase()].findIndex(function(element){return element.id==message.author.id})>-1){
          notifylist[query.toUpperCase()].splice(notifylist[query.toUpperCase()].findIndex(function(element){return element.id==message.author.id}),1)
          message.reply('Will no longer notify you for this flair.')
          fs.writeFileSync('notify.json',JSON.stringify(notifylist))
        }else{message.reply("You're not in that list.")}
      }else{message.reply('Unknown flair, check pinned messages!')}
    }else{
      message.reply('Check pinned messages!')
    }
      }

  if(commandCheck('tax',message)){//~tax california
    if(args[1] && !Number.isNaN(Number(args[2]))){
      if(salestax[args[1]]){
        const tax = (salestax[args[1].toLowerCase()]/100)*args[2]
        const total = tax+Number(args[2])
        message.reply(`\`\`\`Tax: $${tax}
Total: $${total}\`\`\``)
      }
    }
  }

  if(commandCheck("uptime", message) || commandCheck("sessioninfo", message) || commandCheck("sessioninfo", message) || commandCheck("stats", message)){
    message.channel.send({"embed":{ //console.log(new Date().toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3")) https://stackoverflow.com/a/17538193
      "description":'Information about the bot since its boot on '+((sessionData.upSince.getMonth()+1)+"/"+sessionData.upSince.getDate()+"/"+sessionData.upSince.getFullYear()+" "+sessionData.upSince.toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3")),
      "timestamp": new Date(),
      "color": 13065308,
      "fields":[
        {
          "name":"Uptime",
          "value": uptime(process.uptime())
        },
        {
          "name":"Posts (made to #pc-sales):",
          "value": sessionData.posts
        },
        {
          "name":"Successful Polls (made to reddit):",
          "value": sessionData.successfulPolls
        },
        {
          "name":"Failed Polls (made to reddit):",
          "value": sessionData.failedPolls
        }
      ]
    }})
  }

  if(commandCheck('help',message)){
    message.author.send(help)
  }

})
//console.log((salestax['california']/100)*17+17)
const help = `Please send all messages to your servers bot channel. 
Send \`~notify [flair] [max price]\` and the bot will notify you when that type is on sale, omit the max price option for any price.. 
Ex. \`~notify monitor $300\` for a $300 max price or \`~notify\` monitor for any price.
To *stop* receiving notifications, send \`~unnotify [flair]\`

Want to blacklist items you already have? (not case sensitive & supports spaces) 
Send \`~blacklist item,item2\` and the bot will not notify you if a title contains those words.
To unblacklist, send \`~unblacklist item,item2\`
To view your blacklisted words, send just ~blacklist.
Ex. \`~blacklist 1060,intel cpu\` or \`unblacklist 1060,intel cpu\`

To calculate tax:
Send \`~tax [state name] [price] \`

**PROgamerTip:** You can \`ctrl+f\` (find) a flair to find past deals of which some may still be active
Available Flairs are:
\`\`\`
Case
Controller
Cooler
CPU
Expired 
Fan
GPU
HDD
Headphones
Furniture
Keyboard
Meta
MOBO
Mod Post
Monitor
Motherboard
Mouse
Newegg
Networking
OS
Other
Processor
PSU
Router
Sale
Sound
Speakers
SSD
Webcam
Bundle
Flash Drive
Optical Drive
Mic
CPU Cooler
Headset
Mouse Pad
Fan
HTPC
PC
Computer
Discount
Out Of Stock
Prebuilt
VR
RAM
Laptop
Micron/Hynix/Samsung
M.2 SSD
Printer\`\`\``


function uptime(s) { //https://stackoverflow.com/a/50098261

  const d = Math.floor(s / (3600 * 24));

  s  -= d * 3600 * 24;

  const h = Math.floor(s / 3600);

  s  -= h * 3600;

  const m = Math.floor(s / 60);

  s  -= m * 60;

  const tmp = [];

  (d) && tmp.push(d + 'd');

  (d || h) && tmp.push(h + 'h');

  (d || h || m) && tmp.push(m + 'm');

  tmp.push(Math.floor(s) + 's');

  return tmp.join(' ');
}