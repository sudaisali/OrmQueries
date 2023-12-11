const {DataTypes} = require('sequelize')
const {sequelize} = require('../config/database')
const {Customer} = require('../models/customer')


const Order = sequelize.define('Order',{
    orderNumber: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      orderDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      requiredDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      shippedDate: {
        type: DataTypes.DATE,
        defaultValue: null
      },
      status: {
        type: DataTypes.STRING(15),
        allowNull: false
      },
      comments: {
        type: DataTypes.TEXT,
        defaultValue: null
      }

},{
    tableName:'orders',
    timestamps:false
})

Order.belongsTo(Customer,{
    foreignKey: 'customerNumber',

})

Customer.hasMany(Order,{
  foreignKey: 'customerNumber',
})


module.exports = {Order}