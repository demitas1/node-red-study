import { NodeAPI, Node, NodeDef, NodeMessage } from 'node-red';

interface WeatherFormatterNodeDef extends NodeDef {}

interface WeatherInput {
  location?: any;
  current?: {
    time?: string;
    temperature?: number;
    humidity?: number;
    weatherCode?: number;
    weatherDescription?: string;
    windSpeed?: number;
    windDirection?: number;
  };
  fetchedAt?: string;
}

interface WeatherOutput {
  time: string;
  date: string;
  weather_info_text: string;
}

// Weather code to Japanese mapping
const WEATHER_CODE_JP: { [key: number]: string } = {
  0: '快晴',
  1: '晴れ',
  2: '薄曇り',
  3: '曇り',
  45: '霧',
  48: '霧',
  51: '霧雨',
  53: '霧雨',
  55: '霧雨',
  61: '雨',
  63: '雨',
  65: '雨',
  71: '雪',
  73: '雪',
  75: '雪',
  95: '雷雨',
};

function getWeatherJapanese(code: number): string {
  return WEATHER_CODE_JP[code] || '不明';
}

function formatTime(isoTime: string): string {
  // Extract time from ISO format (e.g., "2025-11-16T19:30" -> "19:30")
  const match = isoTime.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : isoTime;
}

function formatDate(isoTime: string): string {
  // Parse ISO date and format as Japanese (e.g., "2025年11月16日")
  const match = isoTime.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = match[1];
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    return `${year}年${month}月${day}日`;
  }
  return isoTime;
}

module.exports = function (RED: NodeAPI) {
  function WeatherFormatterNode(this: Node, config: WeatherFormatterNodeDef) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.status({ fill: 'grey', shape: 'ring', text: 'Ready' });

    node.on('input', (msg: NodeMessage) => {
      try {
        const payload = msg.payload as WeatherInput;

        // Validate input
        if (!payload || !payload.current) {
          throw new Error('Invalid input: expected tokyo-weather node output');
        }

        const current = payload.current;

        // Check required fields
        if (
          current.time === undefined ||
          current.temperature === undefined ||
          current.humidity === undefined ||
          current.weatherCode === undefined
        ) {
          throw new Error('Missing required fields in input');
        }

        // Extract and format data
        const time = formatTime(current.time);
        const date = formatDate(current.time);
        const weatherJP = getWeatherJapanese(current.weatherCode);

        // Create formatted output
        const output: WeatherOutput = {
          time: time,
          date: date,
          weather_info_text: `気温: ${current.temperature}°C、湿度: ${current.humidity}%、天気: ${weatherJP}`,
        };

        // Send output
        msg.payload = output;
        node.send(msg);

        node.status({ fill: 'green', shape: 'dot', text: 'Formatted' });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        node.error(`Failed to format weather data: ${errorMessage}`);
        node.status({ fill: 'red', shape: 'ring', text: 'Error' });
      }
    });
  }

  RED.nodes.registerType('weather-formatter', WeatherFormatterNode);
};
