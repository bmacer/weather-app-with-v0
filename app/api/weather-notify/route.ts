import { NextResponse } from "next/server";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const WEBEX_ACCESS_TOKEN = process.env.WEBEX_ACCESS_TOKEN;
const WEBEX_ROOM_ID = process.env.WEBEX_ROOM_ID;

async function getWeather() {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=Weaverville,NC,US&units=imperial&appid=${OPENWEATHER_API_KEY}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }
  return response.json();
}

async function sendWebexNotification(message: string) {
  const response = await fetch("https://webexapis.com/v1/messages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WEBEX_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      roomId: WEBEX_ROOM_ID,
      text: message,
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to send Webex notification");
  }
  return response.json();
}

export async function GET(request: Request) {
  try {
    const weatherData = await getWeather();
    const message = `Current weather in Weaverville, NC:
Temperature: ${weatherData.main.temp}°F
Conditions: ${weatherData.weather[0].description}
Humidity: ${weatherData.main.humidity}%`;

    await sendWebexNotification(message);

    return NextResponse.json({
      success: true,
      message: "Weather notification sent successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send weather notification" },
      { status: 500 }
    );
  }
}
