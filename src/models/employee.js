const {DataTypes} = require('sequelize')
const {sequelize} = require('../config/database')
const {Office} = require('../models/office')


const Employee = sequelize.define('Employee',{ 
    employeeNumber: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      lastName: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      firstName: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      extension: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      jobTitle: {
        type: DataTypes.STRING(50),
        allowNull: false
      }
},{
    tableName:'employees',
    timestamps:false
});

Employee.belongsTo(Employee,{
    foreignKey: 'reportsTo',
   
})

Employee.belongsTo(Office,{
  foreignKey:'officeCode'
})



Office.hasMany(Employee,{
    foreignKey: 'officeCode',
})



module.exports = {Employee}