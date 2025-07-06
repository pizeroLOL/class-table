/* @refresh reload */
import { RouteDefinition, Router } from "@solidjs/router";
import { lazy } from "solid-js";
import { render } from "solid-js/web";

const route = [
  {
    path: "/bar",
    component: lazy(() => import("./views/Bar.tsx")),
  },
  {
    path: "/settings",
    component: lazy(() => import("./views/Settings.tsx")),
  },
] as RouteDefinition;

render(
  () => <Router>{route}</Router>,
  document.getElementById("root") as HTMLElement,
);
