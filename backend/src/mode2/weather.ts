export async function getWeather(lat: number, lon: number) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );

    const data = await response.json();

    return {
      temperature_c: data.current_weather.temperature,
      weather_code: data.current_weather.weathercode
    };
  } catch {
    return {
      temperature_c: null,
      weather_code: null
    };
  }
}
