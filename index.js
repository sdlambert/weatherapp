// WeatherApp v0.0.1
// =================
// Simple API to grab and parse weather data on request 
// and secure the key

const http = require('http');
const dotenv = require('dotenv');
const url = require('url');
const concat = require('concat-stream');

dotenv.config();

console.log("Testing Weather Underground API");

const server = http.createServer((req, res) => {
	// respond to GET 
	if(req.method === "GET") {
		
		const urlObj = url.parse(req.url, true);

		if (urlObj.pathname === "/api/forecast") {
			if("city" in urlObj.query && "state" in urlObj.query) {
				// WE HAVE A WINNER
				res.writeHead(200, {"Content-Type": "application/json"});
				let forecast = getForecast(urlObj.query.city);
				res.write(JSON.stringify(forecast));
			} //else return HTML error code
		} else if (urlObj.pathname === "/api/city") {
			// WE HAVE A WINNER
			console.log("citysearch!");

			let cityResults = getCities(urlObj.query.search);

			res.writeHead(200, {"Content-Type": "application/json"});
			res.write(JSON.stringify(cityResults) || "");
			
		} // else return HTML error code

	}
	res.end();
});

function getForecast(city, state) {
	const url = "http://api.wunderground.com/api/" + process.env.API_KEY + 
	            "forecast/q/" + state + "/" + city + ".json";

	console.log(url);

	// return awesomeforecast;
}

function getCities(search) {
	const url = "http://autocomplete.wunderground.com/aq?query=" + encodeURIComponent(search);
	let results = {};

	http.get(url, (res) => {
		console.log("hello!");
		res.setEncoding("utf8");
		res.pipe(concat((data) => {
			results = parseCityData(JSON.parse(data));
		}));
		res.on("error", console.error);
	}).on("error", console.error);
}

function parseCityData(data) {
	let cityList = [];

	data.RESULTS.forEach((city) => {
		cityList.push({name: city.name, link: city.l});
	});
	return cityList;
}

server.listen(7979);

// API call example
// 
// server/projects/weatherapp/api/getforecast/XX/YYYYYYYYY.json
// 
// XX = state (AK, NY, HI, MO, CA, IA, FL, etc.)
// YYYYYYYYYY = City with underscores (i.e. San_Francisco)
// 
// 