// WeatherApp v0.3.0
// =================
// Simple REST API to return city autocomplete and weather data 
// from the Weather Underground API: 
// https://www.wunderground.com/weather/api/d/docs
// 
// Usage:
//
//   City Autocomplete
//   /api/city?search=[STRING]
//
//   Forecast 
//   /api/forecast?link=[LINK]


const http   = require('http');
const dotenv = require('dotenv');
const url    = require('url');
const concat = require('concat-stream');

dotenv.config();

console.log("Testing Weather Underground API");

const server = http.createServer((req, res) => {

	req.on("error", (error) => {
		console.error(error);
	});

	// respond to GET 
	if(req.method === "GET") {
		
		const urlObj = url.parse(req.url, true);

		// Forecast request
		if (urlObj.pathname === "/api/forecast" && "link" in urlObj.query) {
			res.writeHead(200, {"Content-Type": "application/json"});

			getForecast(urlObj.query.link)
				.then((data) => parseForecastData(data))
				.then((data) => {
					res.write(JSON.stringify(data, null, "\t"));
					res.end();
				})
				.catch((error) => {
					console.error(error);
				});				
		}
		else if (urlObj.pathname === "/api/city" && "search" in urlObj.query) {
			res.writeHead(200, {"Content-Type": "application/json"});

			getCities(urlObj.query.search)
				.then((data) => {
					return parseCityData(data);
				})
				.then((data) => {
					res.write(JSON.stringify(data));
					res.end();
				})
				.catch((error) => {
					console.error(error);
				});
		} else {
			const d = new Date();
			console.error("INVALID REQUEST\n" +
				            "===============\n" +
			              "HOST:       " + req.headers.host          + "\n" +
			              "USER AGENT: " + req.headers["user-agent"] + "\n" +
			              "TIME:       " + d.toString()              + "\n" +
			              "PATH:       " + urlObj.pathname           + "\n" + 
			              "QUERY:      " + urlObj.search  + "\n");
			res.writeHead(400, {'Content-Type': 'text/plain'});
			res.end("Invalid request, please try again.");
		}
	}
});

function getForecast(link) {
	return new Promise((resolve, reject) => {
		const url = "http://api.wunderground.com/api/" + process.env.API_KEY + 
		            "/forecast" + link + ".json";

		http.get(url, (res) => {
			res.setEncoding("utf8");
			res.pipe(concat((data) => {
				resolve(JSON.parse(data));
			}));
			res.on("error", reject);
		}).on("error", reject);
	});
}

function getCities(search) {
	return new Promise((resolve, reject) => {
		const url = "http://autocomplete.wunderground.com/aq?query=" + encodeURIComponent(search);

		http.get(url, (res) => {
			res.setEncoding("utf8");
			res.pipe(concat((data) => {
				resolve(JSON.parse(data));
			}));
			res.on("error", reject);
		}).on("error", reject);
	});
}


/**
 * parseCityData(data)
 *   returns a list of city names with corresponding links
 * @param  {Object} data - Weather Underground AutoComplete data
 * @return {Object}      - list of cities and links
 */
function parseCityData(data) {
	let cityList = [];

	data.RESULTS.forEach((city) => {
		cityList.push({name: city.name, link: city.l});
	});

	return {cityList: cityList};
}


/**
 * parseForecastData(data)
 *   returns relevant forecast data
 * @param  {Object} data - Weather Underground Forecast data
 * @return {Object}      - relevant forecast data
 */
function parseForecastData(data) {
	const daysArr = data.forecast.simpleforecast.forecastday;
	let forecast = {};

	forecast.days = daysArr.map((day) => {
		return {
			day:        day.date.weekday_short,
			month:      day.date.monthname_short,
			conditions: day.conditions,
			high:       day.high.fahrenheit,
			low:        day.low.fahrenheit
		};
	});

	return forecast;
}

server.listen(7979);