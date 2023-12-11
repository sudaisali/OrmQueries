const {DataTypes} = require('sequelize')
const {sequelize} = require('../config/database')

const Log = sequelize.define('Log',{
    method: {
        type: DataTypes.STRING,
      },
      url: {
        type: DataTypes.STRING,
      },
      headers: {
        type: DataTypes.JSON,
      },
      payload: {
        type: DataTypes.JSON,
      },
      statusCode: {
        type: DataTypes.INTEGER,
      },
},{
    tablename:'logs',
    timestamps:true
})


module.exports ={Log}