import { SubmitFunction } from "@remix-run/react";

export function addGlobalKeyCommands(
  element: HTMLElement,
  submit: SubmitFunction
) {
  element.addEventListener("keydown", (e) => {
    if (e.metaKey && e.key === "i") {
      e.preventDefault();
      submit(null, { method: "get", action: "/" });
    }
    if (e.metaKey && e.key === "b") {
      e.preventDefault();
      submit(null, { method: "get", action: "/logout" });
    }
    if (e.metaKey && e.key === "u") {
      e.preventDefault();
      submit(null, { method: "get", action: "/feedback" });
    }
    if (e.metaKey && e.key === "/") {
      e.preventDefault();
      window.location.href = `https://github.com/${window.location.pathname}`;
    }
  });
}
