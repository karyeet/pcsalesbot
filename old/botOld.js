var request = require('request')
var discord = require('discord.js')
var last
var channel
var fs = require('fs')
var notifylist = JSON.parse(fs.readFileSync('./notify.json'))
var Prefix = '~'

function getPrice(str){
  str = str.replace(/\(.*\)/g,'')
  str = str.match(/\$\d+\.*\d*/)
  if (!str){return 'Unable to find.'}
  return str
}

function getData(){
request('https://www.reddit.com/r/buildapcsales/new.json?sort=new',cb1)
function cb1(_,b){
  var data=JSON.parse(b.body).data.children['0'].data
  //console.log(data)
  if (last!=data.id){
    last=data.id
    console.log(data.link_flair_text)
    var mention = generateNotifyList(data.link_flair_text)
    if (data.thumbnail=='default'){data.thumbnail='https://cdn.discordapp.com/avatars/598034462638604298/e0f6694d9e2d68a0ab847a5e02f771e0.png?size=128'}
    channel.send(mention,{"embed":{
      "title":"New **"+data.link_flair_text+"** Entry",
      "description":'['+data.title+']('+data.url+')',
      "timestamp": new Date(),
      "color": 13065308,
      "thumbnail":{"url":data.thumbnail},
      "fields":[
        {
          "name":"Price",
          "value":getPrice(data.link_flair_text)
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

function generateNotifyList(flair){
  var string= ''
  if (flair){
    if (notifylist[flair.toUpperCase()]){
      notifylist[flair.toUpperCase()].forEach(function(id){
        string=string+'<@'+id+'>'
      })
    }
  }
  return string
}

var client = new discord.Client()

//client.login(process.env.token)

client.on('ready',()=>{
  console.log('ready')
  channel=client.channels.get('624438503178240001')
  setInterval(function(){getData()},5000)
  client.user.setActivity('for lit deals', { type: 'WATCHING' })
          })

function commandCheck(command, message){
	var command = command.toLowerCase();
	var content = message.content.toLowerCase();
	return content.startsWith(Prefix + command);
}



client.on('message',(message)=>{
  var args = message.content.slice(Prefix.length).trim().split(/ +/g);
  var query=args.slice(1).join(' ')
  if (commandCheck('notify',message)){
    if (query){
      if(notifylist[query.toUpperCase()]){
        notifylist[query.toUpperCase()].push(message.author.id)
        message.reply('I will now notify you for this flair.')
        fs.writeFileSync('notify.json',JSON.stringify(notifylist))
      }else{message.reply('Unknown flair, check pinned messages!')}
    }else{
      message.reply('Check pinned messages!')
    }
  }
  if (commandCheck('unnotify',message)){
    if (query){
      if(notifylist[query.toUpperCase()]){
        if (notifylist[query.toUpperCase()].findIndex(function(element){return element==message.author.id})>-1){
          notifylist[query.toUpperCase()].splice(notifylist[query.toUpperCase()].findIndex(function(element){return element==message.author.id}),1)
          message.reply('Will no longer notify you for this flair.')
          fs.writeFileSync('notify.json',JSON.stringify(notifylist))
        }else{message.reply("You're not in that list.")}
      }else{message.reply('Unknown flair, check pinned messages!')}
    }else{
      message.reply('Check pinned messages!')
    }
      }
})