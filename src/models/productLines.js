const {DataTypes}  = require('sequelize')
const {sequelize} = require('../config/database')


const ProductLine = sequelize.define('ProductLine',{
    productLine: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      textDescription: {
        type: DataTypes.STRING(4000),
        allowNull: true
      },
      htmlDescription: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      image: {
        type: DataTypes.BLOB('medium'),
        allowNull: true
      }

},{
    tableName:'productlines',
    timestamps:false
})


module.exports = {ProductLine}