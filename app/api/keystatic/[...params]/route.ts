import { makeRouteHandler } from "@keystatic/next/route-handler";

import config from "../../../../keystatic.config";

const productionReady =
  process.env.NODE_ENV !== "production" ||
  Boolean(
    process.env.KEYSTATIC_GITHUB_CLIENT_ID &&
      process.env.KEYSTATIC_GITHUB_CLIENT_SECRET &&
      process.env.KEYSTATIC_SECRET &&
      process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG,
  );

const unavailable = () =>
  Response.json(
    {
      error:
        "The content studio is unavailable until its GitHub App is configured.",
    },
    { status: 503 },
  );

const handlers = productionReady
  ? makeRouteHandler({ config })
  : { GET: unavailable, POST: unavailable };

export const { GET, POST } = handlers;
