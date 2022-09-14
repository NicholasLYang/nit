import { SubmitFunction } from "@remix-run/react";

export function addGlobalKeyCommands(element: HTMLElement, submit: SubmitFunction) {
  element.addEventListener("keydown", (e) => {
    if (e.metaKey && e.key === "i") {
      submit(null, { method: "get", action: "/" });
    }
    if (e.metaKey && e.key === "b") {
      submit(null, { method: "get", action: "/logout" });
    }
    if (e.metaKey && e.key === "u") {
      submit(null, { method: "get", action: "/feedback" });
    }
    if (e.metaKey && e.key === "/") {
      window.location.href = `https://github.com/${window.location.pathname}`;
    }
  });
}
