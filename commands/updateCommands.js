const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')

const commands = require('./commands.json')

const rest = new REST({ version: '9' }).setToken(process.env['TOKEN'])

module.exports = async (guildID) => {
  try{
    console.log('Refreshing was started.')
    await rest.put(
      Routes.applicationGuildCommands(process.env['USER_ID'], guildID),
      {body: commands}
    )
    console.log('Refreshing was ended successfully.')
  }
  catch(err){
    console.error(err)
  }
}