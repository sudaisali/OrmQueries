const {DataTypes}  = require('sequelize')
const {sequelize} = require('../config/database')
const {ProductLine} = require('../models/productLines')

const Product = sequelize.define('Product',{
    productCode: {
        type: DataTypes.STRING(15),
        primaryKey: true,
        allowNull: false
      },
      productName: {
        type: DataTypes.STRING(70),
        allowNull: false
      },
      productScale: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      productVendor: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      productDescription: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      quantityInStock: {
        type: DataTypes.SMALLINT,
        allowNull: false
      },
      buyPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      MSRP: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      }

},{
    tableName:'products',
    timestamps:false
})

Product.belongsTo(ProductLine,{
    foreignKey: 'productLine',
})
ProductLine.hasMany(Product,{
  foreignKey: 'productLine',
})

module.exports={Product}