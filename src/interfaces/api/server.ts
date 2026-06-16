import { serve } from "@hono/node-server";
import { createAppDependencies } from "./composition-root.js";
import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 3000);
const deps = createAppDependencies();
const app = createApp(deps);

console.log(`Trading Apprentice API listening on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
