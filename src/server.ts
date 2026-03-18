import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";

const fetch = createStartHandler(defaultStreamHandler);

const serverEntry = Object.assign(fetch, { fetch });

export default serverEntry;
