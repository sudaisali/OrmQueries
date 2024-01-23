const Sequelize = require('sequelize')
const sequelize = new Sequelize('task2', 'root', '', {
    dialect: 'mysql',
    logging: console.log
})
module.exports = { sequelize }