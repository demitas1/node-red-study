import { NodeAPI, Node, NodeDef } from 'node-red';
import { exec } from 'child_process';

interface TokyoWeatherNodeDef extends NodeDef {
  interval: number;
}

interface WeatherData {
  location: {
    city: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  current: {
    time: string;
    temperature: number;
    humidity: number;
    weatherCode: number;
    weatherDescription: string;
    windSpeed: number;
    windDirection: number;
  };
  fetchedAt: string;
}

// Weather code mapping based on WMO Weather interpretation codes
const WEATHER_CODE_MAP: { [key: number]: string } = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  95: 'Thunderstorm',
};

function getWeatherDescription(code: number): string {
  return WEATHER_CODE_MAP[code] || `Unknown (${code})`;
}

module.exports = function (RED: NodeAPI) {
  function TokyoWeatherNode(this: Node, config: TokyoWeatherNodeDef) {
    RED.nodes.createNode(this, config);
    const node = this;

    const interval = (config.interval || 10) * 1000; // Convert to milliseconds
    let timer: NodeJS.Timeout | null = null;

    const TOKYO_LAT = 35.6895;
    const TOKYO_LON = 139.6917;
    const TIMEZONE = 'Asia/Tokyo';

    // Function to fetch weather data using curl
    const fetchWeather = () => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${TOKYO_LAT}&longitude=${TOKYO_LON}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&timezone=${TIMEZONE}`;

      node.status({ fill: 'yellow', shape: 'ring', text: 'Fetching...' });

      exec(`curl -s --max-time 10 "${url}"`, (error, stdout, stderr) => {
        if (error) {
          node.error(`Failed to fetch weather data: ${error.message}`);
          node.status({ fill: 'red', shape: 'ring', text: 'Error' });
          return;
        }

        if (stderr) {
          node.error(`Curl error: ${stderr}`);
          node.status({ fill: 'red', shape: 'ring', text: 'Error' });
          return;
        }

        try {
          const response = JSON.parse(stdout);

          if (!response.current) {
            throw new Error('Invalid response from Open-Meteo API');
          }

          const weatherData: WeatherData = {
            location: {
              city: 'Tokyo',
              latitude: TOKYO_LAT,
              longitude: TOKYO_LON,
              timezone: TIMEZONE,
            },
            current: {
              time: response.current.time,
              temperature: response.current.temperature_2m,
              humidity: response.current.relative_humidity_2m,
              weatherCode: response.current.weather_code,
              weatherDescription: getWeatherDescription(
                response.current.weather_code
              ),
              windSpeed: response.current.wind_speed_10m,
              windDirection: response.current.wind_direction_10m,
            },
            fetchedAt: new Date().toISOString(),
          };

          node.send({
            payload: weatherData,
            topic: 'weather/tokyo/current',
          });

          // Update status with temperature
          node.status({
            fill: 'green',
            shape: 'dot',
            text: `${weatherData.current.temperature}°C / ${weatherData.current.humidity}%`,
          });
        } catch (parseError) {
          node.error(`Failed to parse weather data: ${parseError}`);
          node.status({ fill: 'red', shape: 'ring', text: 'Parse error' });
        }
      });
    };

    // Initial fetch
    fetchWeather();

    // Set up interval
    timer = setInterval(fetchWeather, interval);

    // Cleanup on node removal
    node.on('close', () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      node.status({});
    });
  }

  RED.nodes.registerType('tokyo-weather', TokyoWeatherNode);
};
