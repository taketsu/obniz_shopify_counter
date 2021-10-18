const APIKEY = "WEATHER_API_KEY_HERE";

const RED_WEATHERS = [
  "Rain",
  "Snow",
  "Thunderstorm",
  "Drizzle",
  "Fog",
  "Squall"
];
const YELLOW_WEATHERS = [
  "Clouds",
  "Mist",
  "Smoke",
  "Dust",
  "Haze",
  "Sand",
  "Ash",
  "Tornado"
];
const GREEN_WEATHERS = ["Clear"];

let obniz = new Obniz("OBNIZ_ID_HERE");
obniz.onconnect = async () => {
  let light = obniz.wired("Keyestudio_TrafficLight", {
    gnd: 0,
    green: 1,
    yellow: 2,
    red: 3
  });

  obniz.repeat(async () => {
    //現在の天気データ呼び出し
    let data = await (await fetch(
      `http://api.openweathermap.org/data/2.5/weather?q=Tokyo,jp&appid=${APIKEY}`
    )).json();
    console.log(data);

    let currentWeather = data.weather[0].main;

    if (currentWeather === undefined || currentWeather === null) {
      light.red.off();
      light.yellow.off();
      light.green.off();
      console.log("no data");
      return;
    }

    if (await isMatched(RED_WEATHERS, currentWeather)) {
      light.single("red");
    } else if (await isMatched(YELLOW_WEATHERS, currentWeather)) {
      light.single("yellow");
    } else if (await isMatched(GREEN_WEATHERS, currentWeather)) {
      light.single("green");
    } else {
      light.red.off();
      light.yellow.off();
      light.green.off();
      console.log("no data");
    }
  }, 30000);
};

async function isMatched(array, _currentWeather) {
  for await (let weatherName of array) {
    if (_currentWeather === weatherName) {
      return true;
    }
  }
  return false;
}
