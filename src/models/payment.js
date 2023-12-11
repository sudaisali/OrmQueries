const { DataTypes, HasMany } = require('sequelize')
const { sequelize } = require('../config/database')
const { Customer } = require('../models/customer')

const Payment = sequelize.define('Payment', {
  customerNumber: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: Customer,
      key: 'customerNumber'
    }
  },
  checkNumber: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'payments',
  timestamps: false
})
Payment.belongsTo(Customer, {
  foreignKey: 'customerNumber'
})
Customer.hasMany(Payment,{
   foreignKey: 'customerNumber'
  });

module.exports = { Payment }