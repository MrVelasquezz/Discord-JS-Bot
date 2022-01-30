const ds = require("discord.js")
const mongoose = require('mongoose')
const client = new ds.Client({ intents: [ds.Intents.FLAGS.GUILDS, ds.Intents.FLAGS.GUILD_MESSAGES,
    ds.Intents.FLAGS.GUILD_MESSAGE_REACTIONS] })  //без "GUILD_MESSAGES" не будет работать ивент, связанНый с сообщениямил первый же элемент разрешает все, кроме последнего.

const updComms = require('./commands/updateCommands')
const {
  guildAdressesModel,
  checkGuildAdressesModel
} = require('./schemas/Schema')

//function, that adds commands for all servers
async function getAllCommands() {
  try {
    const getCommands = await checkGuildAdressesModel.find({})
    if (getCommands.length == 0) {
      console.log('Its no servers in database')
    }
    else if (getCommands.length > 0) {
      for (let i = 0; i < getCommands.length; i++) {
        updComms(getCommands[i].servId)
      }
    }
  }
  catch (err) {
    console.error(err)
  }

}

//database connection
mongoose.connect(process.env['DB_URL'] + process.env['DB_NAME'])
  .then(() => {
    console.log('Database was successfully connected. \nStarting bot connection..')
    client.once("ready", async () => {
      console.log('Logged in as ' + client.user.tag + ". Startting command update.")
      getAllCommands()
    })
    client.login(process.env['TOKEN'])
  })
  .catch((err) => {
    console.error(err)
    return
  })

client.on('messageCreate', async mess => {
  let check = mess.content.toLowerCase().trim()
  if (check.slice(0, 1) === ':') {
    check = check.slice(1, check.length)
    if(check === 'react test'){
try {
      mess.react('🐗') //ставит реакцию под каждым написанНым пользователем сообщением
      console.log('Successfully reacted')
    }
    catch (e) {
      console.error(e)
    }
    const collMess = await mess.reply('Hey, i can see you. React me!') //отвечает на сообщение

    const filter = (reaction) => reaction.emoji.name !== ''  //чисто для приличия фильтр. можно сделать фильтрацию эмоджи и пользовтелей

    const collector = collMess.createReactionCollector({filter})
    collector.on('collect', async r => {    // как только кто то ставит реакцию, сразу же срабатывает данНый наблюдатель
      const embdMsg = new ds.MessageEmbed({
        title: 'You reacted my message!',
        description: `Thank you, my friend ${r.message.mentions.repliedUser.username} for reaction "${r.emoji.name}"`, //первое берет из массива имя пользователя, который поставил реакцию. r - это массив со всей инфой о реакции. 
        color: '#ffffff',
        image: {
          url: "https://i.yapx.ru/Gynv5.gif",
          height: 5,
          width: 5
        },
        footer: {
          text: "Bot was created by Velasquezz#9291",
          iconURL: "https://cdn.icon-icons.com/icons2/3178/PNG/512/coding_computer_pc_screen_code_icon_193925.png"
        }
      })
      const findGuild = await client.guilds.cache.find(item => item.id === r.message.reference.guildId) //берет весь список серверов и ищет в нем нужный
      const findChannel = await findGuild.channels.cache.find(item => item.id === r.message.reference.channelId) //берет весь список каналов на найденном сервере и ищет нежный
      if(findChannel.type === 'GUILD_TEXT' && findChannel.permissionsFor(findGuild.me).has('SEND_MESSAGES')){ //проверяет тип канала и права
        findChannel.send({embeds: [embdMsg]})
      }
      console.log('Created an emoji' + r.emoji.name)
    })
    collector.on('end', (coll, reason) => {  //если в фильтре установлен лимит max или подобный, то по его привышению, сработает этот обработчик
      if(reason == 'limit'){
        console.log('We ended collection')
      }
    })
  }
    }
})

//message and another interaction's catcher
client.on('interactionCreate', async intr => {
  //console.log(intr)
  if (!intr.isCommand()) {
    return
  }
  if (intr.commandName === 'ping') {
    await intr.reply('Hi, ' + intr.user.username)
  }
  else if (intr.commandName === 'start') {
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
    //end of embed
    await intr.reply({
      embeds: [msgEmbed],
      fetchReply: true
    })
  }
  else {
    await intr.reply('I dont know')
  }
})

//starts, when bot was added to server
client.on('guildCreate', async guild => {
  const hiChannel = guild.channels.cache.find(item => item.id == guild.systemChannelId)
  if (typeof hiChannel === 'object') {
    if (hiChannel.type === 'GUILD_TEXT' && hiChannel.permissionsFor(guild.me).has('SEND_MESSAGES')) {
      hiChannel.send('Hello my new friends! Type "start", to see all my commands!)')
    }
  }
  const guildData = {
    guildId: guild.id,
    guildName: guild.name
  }
  try {
    const checkAdress = await checkGuildAdressesModel.find({ servId: guildData.guildId })
    if (checkAdress.length != 0) {
      console.log('This server is already in database!')
    }
    else if (checkAdress.length == 0) {
      console.log('Adding this server to database!')
      try {
        const addServer = await guildAdressesModel.create({ servId: guildData.guildId, servName: guildData.guildName })
        console.log('Server was added')
        try {
          updComms(guildData.guildId)
          console.log('Commands were added to the server')
        }
        catch (err) {
          console.error(err)
        }
      }
      catch (err) {
        console.error(err)
      }
    }
  }
  catch (err) {
    console.error(err)
  }
})

//starts, when bot was deleted from the server
client.on('guildDelete', async guild => {
  const guildData = {
    guildId: guild.id,
    guildName: guild.name
  }
  try {
    const checkServer = await checkGuildAdressesModel.find({ servId: guildData.guildId })
    if (checkServer.length == 0) {
      console.log('This server is not exists')
    }
    else if (checkServer.length == 1) {
      try {
        const deleteServer = await checkGuildAdressesModel.deleteOne({ servId: guildData.guildId })
        console.log("Server was successfully deleted")
      }
      catch (e) {
        console.erroe(e)
      }
    }
    else {
      console.error('Its more, than one server in database. Check this for errors.')
    }
  }
  catch (err) {
    console.error(err)
  }
})