const ds = require("discord.js")
const mongoose = require('mongoose')
const client = new ds.Client({ intents: [ds.Intents.FLAGS.GUILDS] })

const updComms = require('./commands/updateCommands')
const {
  guildAdressesModel,
  checkGuildAdressesModel
} = require('./schemas/Schema')

//function, that adds commands for all servers
async function getAllCommands(){
  try{
    const getCommands = await checkGuildAdressesModel.find({})
    if(getCommands.length == 0){
      console.log('Its no servers in database')
    }
    else if(getCommands.length > 0){
      for(let i = 0; i < getCommands.length; i++){
        updComms(getCommands[i].servId)
      }
    }
  }
  catch(err){
    console.error(err)
  }

}

//database connection
mongoose.connect(process.env['DB_URL']+process.env['DB_NAME'])
  .then(()=>{
    console.log('Database was successfully connected. \nStarting bot connection..')
    client.once("ready", async ()=> {
      console.log('Logged in as '+client.user.tag+". Startting command update.")
      getAllCommands()
    })
    client.login(process.env['TOKEN'])
  })
  .catch((err)=>{
    console.error(err)
    return
  })

//message and another interaction's catcher
client.on('interactionCreate', async intr => {
    //console.log(intr)
    if(!intr.isCommand()){
        return
    } 
    if(intr.commandName === 'ping'){
        await intr.reply('Hi, '+ intr.user.username)
    }
    else if(intr.commandName === 'start'){
      //embed msg
      const msgEmbed = new ds.MessageEmbed({
        title: "Start message",
        description: "This is some start message, to test embed.",
        color: "DARK_BLUE",
        fields: [
          {
            name: 'First field',
            value: 'Some normal field',
            inline: false
          },
          {
            name: 'Second field',
            value: 'Some inline field',
            inline: true
          }
        ]
      })
        await intr.reply({
          embeds: [msgEmbed],
          fetchReply: true
        })
    }
    else{
      await intr.reply('I dont know')
    }
})

//starts, when bot was added to server
client.on('guildCreate', async guild => {
  //console.log(guild)
  const guildData = {
    guildId: guild.id,
    guildName: guild.name
  }
  try{
    const checkAdress = await checkGuildAdressesModel.find({servId: guildData.guildId})
    if(checkAdress.length != 0){
      console.log('This server is already in database!')
    }
    else if(checkAdress.length == 0){
      console.log('Adding this server to database!')
      try{
        const addServer = await guildAdressesModel.create({servId: guildData.guildId, servName: guildData.guildName})
        console.log('Server was added')
        try{
          updComms(guildData.guildId)
          console.log('Commands were added to the server')   
        }
        catch(err){
          console.error(err)
        }
      }
      catch(err){
        console.error(err)
      }
    }
  }
  catch(err){
    console.error(err)
  }
})

//starts, when bot was deleted from the server
client.on('guildDelete', async guild => {
  const guildData = {
    guildId: guild.id,
    guildName: guild.name
  }
  try{
    const checkServer = await checkGuildAdressesModel.find({servId: guildData.guildId})
    if(checkServer.length == 0){
      console.log('This server is not exists')
    }
    else if(checkServer.length == 1){
      const deleteServer = await checkGuildAdressesModel.deleteOne({servId: guildData.guildId})
      if(deleteServer.length == 1){
        console.log("Server was successfully deleted")
      }
    }
    else{
      console.error('Its more, than one server in database. Check this for errors.')
    }
  }
  catch(err){
    console.error(err)
  }
})