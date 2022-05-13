require('dotenv').config()

const pg = require('pg')

module.exports = new pg.Pool({
	user: process.env.USER,
	password: process.env.PASSWORD,
	host: process.env.HOST,
	port: process.env.PORT,
	database: process.env.DATABASE
})
