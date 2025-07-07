export async function POST(request: Request) {
  const { body } = await request.json();

  console.log("body", body);

  return new Response("OK", { status: 200 });
}
