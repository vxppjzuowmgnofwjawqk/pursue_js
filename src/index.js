require('dotenv').config()

const request = require('request')

const db = require('./db/index.js')

class Pursuer {

	static queue = [+process.env.INITIAL]

	static found = []

	static getVictim(victimId) {
		const url =
			`${process.env.URL}/users.get?access_token=${process.env.TOKEN}&v=${process.env.V}&user_ids=${victimId}&fields=${process.env.FIELDS}`
		return new Promise((resolve, reject) => {
			request(url, (err, { body }) => {
				if (!err) {
					body = JSON.parse(body)
					try {
						if (body.error) {

							// TODO ДОБАВИТЬ ЗАДЕРЖУ

						} else {
							resolve(body.response[0])
						}
					} catch {
						console.log(body)
					}
				}
			})
		})
	}

	static getNeighbors(victimId) {
		const url =
			`${process.env.URL}/friends.get?access_token=${process.env.TOKEN}&v=${process.env.V}&user_id=${victimId}`
		return new Promise((resolve, reject) => {
			request(url, (err, { body }) => {
				if (!err) {
					body = JSON.parse(body)
					try {
						if (body.error) {

							// TODO ДОБАВИТЬ ЗАДЕРЖУ

						} else {
							resolve(body.response.items)
						}
					} catch {
						console.log(body)
					}
				}
			})
		})
	}

}

(async function start() {
	try {
		const victimId = Pursuer.queue.shift()
		if (!victimId) {
			return
		}
		if (Pursuer.found.includes(victimId)) {
			return setTimeout(start, +process.env.MILLISECONDS)
		}
		const {
			id,
			deactivated,
			first_name,
			last_name,
			is_closed,
			sex,
			bdate,
			city
		} = await Pursuer.getVictim(victimId)
		if (!is_closed && !deactivated) {
			const neighbors = await Pursuer.getNeighbors(victimId)
			Pursuer.queue.push(...neighbors)
			if (sex === 1) {
				const full_name = `${first_name} ${last_name}`
				await db.query(
					`insert into victim (id, full_name, birthday, city) values ($1, $2, $3, $4)`,
					[id, full_name, bdate || null, city?.title || null]
				)
			}
		}
		Pursuer.found.push(victimId)
		return setTimeout(start, +process.env.MILLISECONDS)
	} catch (e) {
		console.log(e)
	}
})()
