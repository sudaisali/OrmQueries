const {DataTypes}  = require('sequelize')
const {sequelize} = require('../config/database')
const {Order} = require('../models/order')
const {Product} = require('../models/product')

const OrderDetail = sequelize.define('OrderDetail',{
    orderNumber: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: Order,
          key: 'orderNumber'
        }
      },
      productCode: {
        type: DataTypes.STRING(15),
        primaryKey: true,
        allowNull: false,
        references: {
          model: Product,
          key: 'productCode'
        }
      },
      quantityOrdered: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      priceEach: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      orderLineNumber: {
        type: DataTypes.SMALLINT,
        allowNull: false
      }
},{
    tableName:'orderdetails',
    timestamps:false
})


OrderDetail.belongsTo(Order,{
    foreignKey: 'orderNumber'
})
Order.hasMany(OrderDetail,{
  foreignKey: 'orderNumber'
})
OrderDetail.belongsTo(Product,{
    foreignKey:'productCode'
})
Product.hasMany(OrderDetail,{
  foreignKey:'productCode'
})


module.exports = {OrderDetail}