const mongoose = require('mongoose'),
Schema = mongoose.Schema

const guildAdresses = new Schema({
  servId:{
    type: String,
    required: true,
    validate: /[0-9]/,
    unique: true
  },
  servName: {
    type: String,
    required: true
  }
},
{
  versionKey: false,
  collection: 'botServerList',
  timestamps: true
})

const checkGuildAdresses = new Schema({
  servId:{
    type: String,
    required: true,
    validate: /[0-9]/
  }
},
{
  versionKey: false,
  collection: 'botServerList',
  timestamps: true
})

const guildAdressesModel = mongoose.model('AdressList', guildAdresses),
checkGuildAdressesModel = mongoose.model('checkGuildAdresses', checkGuildAdresses)

module.exports = { guildAdressesModel, checkGuildAdressesModel }