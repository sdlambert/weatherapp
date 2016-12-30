// WeatherApp v0.0.1
// =================
// Simple API to grab and parse weather data on request 
// and secure the key

const http   = require('http');
const dotenv = require('dotenv');
const url    = require('url');
const concat = require('concat-stream');

dotenv.config();

console.log("Testing Weather Underground API");

const server = http.createServer((req, res) => {
	// respond to GET 
	if(req.method === "GET") {
		
		const urlObj = url.parse(req.url, true);

		if (urlObj.pathname === "/api/forecast") {
			if("link" in urlObj.query) {
				res.writeHead(200, {"Content-Type": "application/json"});
				let forecast = getForecast(urlObj.query.link);
				//console.log(forecast);
				res.write(JSON.stringify(forecast));
			} //else return HTML error code
		} else if (urlObj.pathname === "/api/city") {
			//console.log("citysearch!");
			let cityResults = getCities(urlObj.query.search);
			//console.log("Got cities!");
			res.writeHead(200, {"Content-Type": "application/json"});
			//console.log(JSON.stringify(cityResults));
			res.write(JSON.stringify(cityResults, null, '\t'));
		} // else return HTML error code 
		res.end();
	} // return HTTP error code
});

function getForecast(link) {
	const url = "http://api.wunderground.com/api/" + process.env.API_KEY + 
	            "/forecast" + link + ".json";

	let results = {};

	http.get(url, (res) => {
		res.setEncoding("utf8");
		res.pipe(concat((data) => {
			results = JSON.parse(data);

		}));
		res.on("error", console.error);
	}).on("error", console.error);

	//console.log(JSON.stringify(results));

	return results;
}

function getCities(search) {
	const url = "http://autocomplete.wunderground.com/aq?query=" + encodeURIComponent(search);
	let results = {};

	http.get(url, (res) => {
		res.setEncoding("utf8");
		res.pipe(concat((data) => {
			results = parseCityData(JSON.parse(data));
			console.log(JSON.stringify(results));
		}));
		res.on("error", console.error);
	}).on("error", console.error);

	return results;
}

function parseCityData(data) {
	let cityList = [];

	data.RESULTS.forEach((city) => {
		cityList.push({name: city.name, link: city.l});
	});

	//console.log(JSON.stringify({cityList: cityList}));

	return {cityList: cityList};
}

// function parseForecastData(data) {

// }

server.listen(7979);

// API call example
// 
// server/projects/weatherapp/api/getforecast/XX/YYYYYYYYY.json
// 
// XX = state (AK, NY, HI, MO, CA, IA, FL, etc.)
// YYYYYYYYYY = City with underscores (i.e. San_Francisco)