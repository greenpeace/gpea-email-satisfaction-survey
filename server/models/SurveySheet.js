const config = require('../config')
const {google} = require('googleapis');
const moment = require('moment');

class	SurveySheet {
	constructor () {
		this.spreadsheetId = config.spreadsheetId
		this.sheetName = config.sheetName

		this.auth()
	}

	auth () {
		const auth = new google.auth.GoogleAuth({
		  scopes: ['https://www.googleapis.com/auth/spreadsheets']
		});

		const sheets = google.sheets({version: 'v4', auth});

		this.sheets = sheets
	}

	/**
	 * Map from column name to its index
	 */
	async getHeaderNameToIdx () {
		if (this.headerNameToIdx) {
			return this.headerNameToIdx
		}

		let response = await this.sheets.spreadsheets.values.get({
		  spreadsheetId: this.spreadsheetId,
		  range: `${this.sheetName}!A1:Z1`
		});
		let headers = response.data.values[0]

		this.headerNameToIdx = {}
		headers.forEach((v, i) => {
			this.headerNameToIdx[v] = i
		})

		return this.headerNameToIdx
	}

	/**
	 * Insert a row into the sheet
	 * @param  {Object} options
	 *         options.email {string}
	 *         options.subject {string}
	 *         options.stars {string}
	 *         options.note {string}
	 */
	async vote (args = {email, subject, stars, note}) {
		let kvs = Object.assign({
			email: "",
			subject: "",
			stars: "",
			note: "",
		}, args)

		let map = await this.getHeaderNameToIdx()

		// collect cell values into array
		let inserts = new Array(map.length)
		Object.keys(kvs).forEach((k) => {
			if (k in map) {
				inserts[map[k]] = kvs[k]
			}

			// use server timestamp
			inserts[map["created_at"]] = moment().format('YYYY/MM/DD hh:mm:ss')
			inserts[map["updated_at"]] = moment().format('YYYY/MM/DD hh:mm:ss')
		})

		await this.sheets.spreadsheets.values.append({
		  spreadsheetId: this.spreadsheetId,
		  range: `${this.sheetName}`,
		  valueInputOption: "RAW",
		  resource: {
		  	values: [inserts]
		  },
		})
	}

	async createOrUpdated (args = {email, subject, stars, note}) {
		let kvs = Object.assign({
			email: "",
			subject: "",
			stars: "",
			note: "",
		}, args)

		let map = await this.getHeaderNameToIdx()

		// find the email and subject
		let columnIdAZ = String.fromCharCode(65+map["email"])
		let response = await this.sheets.spreadsheets.values.get({
		  spreadsheetId: this.spreadsheetId,
		  range: `${this.sheetName}!${columnIdAZ}:${columnIdAZ}`
		});
		let emails = response.data.values.map( r => r[0])

		columnIdAZ = String.fromCharCode(65+map["subject"])
		response = await this.sheets.spreadsheets.values.get({
		  spreadsheetId: this.spreadsheetId,
		  range: `${this.sheetName}!${columnIdAZ}:${columnIdAZ}`
		});
		let subjects = response.data.values.map( r => r[0])

		let foundRowIdx = null
		for (var i=emails.length-1; i>=0; i--) {
			if (emails[i]===kvs.email && subjects[i]===kvs.subject ) {
				foundRowIdx = i+1
				break;
			}
		}

		// prepare the row to insert
		let range = `${this.sheetName}`
		let inserts
		let f
		if (foundRowIdx) {
			response = await this.sheets.spreadsheets.values.get({
			  spreadsheetId: this.spreadsheetId,
			  range: `${this.sheetName}!A${foundRowIdx}:Z${foundRowIdx}`
			});
			inserts = response.data.values[0]
			inserts.length = Object.keys(kvs).length // makesure the length is long enough

			Object.keys(kvs).forEach((k) => {
				if (k in map) {
					inserts[map[k]] = kvs[k]
				}

				// update th updated time stamp
				inserts[map["updated_at"]] = moment().format('YYYY/MM/DD hh:mm:ss')
			})

			range = `${this.sheetName}!A${foundRowIdx}:${String.fromCharCode(65+inserts.length)}${foundRowIdx}`
			f = "update"
		} else {
			// collect cell values into array
			inserts = new Array(map.length)
			Object.keys(kvs).forEach((k) => {
				if (k in map) {
					inserts[map[k]] = kvs[k]
				}

				// use server timestamp
				inserts[map["created_at"]] = moment().format('YYYY/MM/DD hh:mm:ss')
				inserts[map["updated_at"]] = moment().format('YYYY/MM/DD hh:mm:ss')
			})

			range = `${this.sheetName}`
			f = "append"
		}

		console.log(f, inserts)
		await this.sheets.spreadsheets.values[f]({
		  spreadsheetId: this.spreadsheetId,
		  range: range,
		  valueInputOption: "RAW",
		  resource: {
		  	values: [inserts]
		  },
		})
	}
}

module.exports = SurveySheet