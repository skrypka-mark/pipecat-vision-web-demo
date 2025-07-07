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
      // Add Daily Room properties as needed
    },
    body: {
      // Custom data that will be accessible in your bot.py file
      ...body,
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

  // Convert Pipecat Cloud response format to RTVI format
  const rtviResponse = {
    room_url: res.dailyRoom,
    token: res.dailyToken,
  };

  return Response.json(rtviResponse);
}
