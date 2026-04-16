export async function onRequest(context) {
  const { request, env } = context;
  
  // 1. 存数据
  if (request.method === "POST") {
    const newData = await request.json();
    await env.DB.put("GLOBAL_LOG", JSON.stringify(newData));
    return new Response("同步成功", { status: 200 });
  }

  // 2. 取数据
  const allData = await env.DB.get("GLOBAL_LOG");
  return new Response(allData || "[]", { headers: { "Content-Type": "application/json" } });
}
