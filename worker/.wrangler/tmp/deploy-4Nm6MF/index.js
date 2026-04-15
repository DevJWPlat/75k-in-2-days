var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      ...extraHeaders
    }
  });
}
__name(json, "json");
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }
    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({ ok: true });
    }
    if (url.pathname === "/api/location" && request.method === "POST") {
      try {
        const body = await request.json();
        const { latitude, longitude, accuracy } = body;
        if (typeof latitude !== "number" || typeof longitude !== "number") {
          return json({ ok: false, error: "Invalid latitude or longitude" }, 400);
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        await env.DB.prepare(
          `
          INSERT INTO locations (latitude, longitude, accuracy, created_at)
          VALUES (?1, ?2, ?3, ?4)
          `
        ).bind(latitude, longitude, accuracy ?? null, now).run();
        await env.DB.prepare(
          `
          INSERT INTO latest_location (id, latitude, longitude, accuracy, updated_at, is_visible)
          VALUES (1, ?1, ?2, ?3, ?4, 1)
          ON CONFLICT(id) DO UPDATE SET
            latitude = excluded.latitude,
            longitude = excluded.longitude,
            accuracy = excluded.accuracy,
            updated_at = excluded.updated_at
          `
        ).bind(latitude, longitude, accuracy ?? null, now).run();
        return json({ ok: true, updatedAt: now });
      } catch (error) {
        return json({ ok: false, error: "Failed to save location" }, 500);
      }
    }
    if (url.pathname === "/api/location/latest" && request.method === "GET") {
      try {
        const result = await env.DB.prepare(
          `
          SELECT id, latitude, longitude, accuracy, updated_at, is_visible
          FROM latest_location
          WHERE id = 1
          `
        ).first();
        return json({
          ok: true,
          location: result ?? null
        });
      } catch (error) {
        return json({ ok: false, error: "Failed to fetch location" }, 500);
      }
    }
    if (url.pathname === "/api/location/visibility" && request.method === "POST") {
      try {
        const body = await request.json();
        const visible = body?.visible ? 1 : 0;
        const now = (/* @__PURE__ */ new Date()).toISOString();
        await env.DB.prepare(
          `
          INSERT INTO latest_location (id, latitude, longitude, accuracy, updated_at, is_visible)
          VALUES (1, 0, 0, NULL, ?1, ?2)
          ON CONFLICT(id) DO UPDATE SET
            is_visible = excluded.is_visible,
            updated_at = excluded.updated_at
          `
        ).bind(now, visible).run();
        return json({
          ok: true,
          isVisible: Boolean(visible),
          updatedAt: now
        });
      } catch (error) {
        return json({ ok: false, error: "Failed to update pointer visibility" }, 500);
      }
    }
    return json({ ok: false, error: "Not found" }, 404);
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
