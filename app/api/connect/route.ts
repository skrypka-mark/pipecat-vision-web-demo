// [POST] /api/connect
export async function POST(request: Request) {
  const { body } = await request.json();

  if (!process.env.PIPECAT_PUBLIC_API_KEY || !process.env.PIPECAT_AGENT_NAME) {
    return new Response(`Pipecat API key or agent name not configured`, {
      status: 400,
    });
  }

  const payload = {
    createDailyRoom: true,
    dailyRoomProperties: {
      // Room properties - recording will be controlled via Pipecat
      enable_recording: "cloud",
      // enable_transcription_storage: true,
    },
    body: {
      // Custom data that will be accessible in your bot.py file
      ...body,
      // enableRecording: true, // Signal to bot to start recording
    },
  };

  const req = await fetch(
    `https://api.pipecat.daily.co/v1/public/${process.env.PIPECAT_AGENT_NAME}/start`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PIPECAT_PUBLIC_API_KEY}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const res = await req.json();

  if (req.status !== 200) {
    return Response.json(res, { status: req.status });
  }

  const roomName = res.roomName || extractRoomName(res.dailyRoom);

  // Convert Pipecat Cloud response format to RTVI format
  const rtviResponse = {
    room_url: res.dailyRoom,
    token: res.dailyToken,
    room_name: roomName,
  };

  return Response.json(rtviResponse);
}

function extractRoomName(roomUrl: string): string {
  try {
    const url = new URL(roomUrl);
    return url.pathname.split("/").pop() || "unknown";
  } catch {
    return "unknown";
  }
}
