const path = require('path')
const express = require('express')
const app = express()
const port = 3001

const SurveySheet = require("./models/SurveySheet")

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
	let {email, subject, stars, note} = req.query

	if ( !email) {return res.json({"status": "`email` is required"})}
	if ( !subject) {return res.json({"status": "`subject` is required"})}
	if ( !stars) {return res.json({"status": "`stars` is required"})}

	const ss = new SurveySheet()
	ss.createOrUpdated({email, subject, stars, note})

  return res.sendFile(path.join(__dirname + '/../client/build/index.html'));
})

app.use(express.static(path.join(__dirname + '/../client/build')))

app.listen(port, () => {
	console.log(`App listening on port ${port}!`)
})