import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

let router: ReturnType<typeof createRouter> | undefined;

export function getRouter() {
  router ??= createRouter({
    routeTree,
    scrollRestoration: true,
  });
  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
