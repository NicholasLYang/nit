import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/session.server";
import { expect } from "~/utils";
import { GitHubStrategy } from "remix-auth-github";

interface User {
  accessToken: string;
  profile: {
    displayName: string;
  };
}

export let authenticator = new Authenticator<User>(sessionStorage, {
  sessionKey: "accessToken",
});

authenticator.use(
  new GitHubStrategy(
    {
      clientID: expect(
        process.env.CLIENT_ID,
        "Expected CLIENT_ID environment variable"
      ),
      clientSecret: expect(
        process.env.CLIENT_SECRET,
        "Expected CLIENT_SECRET environment variable"
      ),
      callbackURL: expect(
        process.env.CALLBACK_URL,
        "Expected CALLBACK_URL environment variable"
      ),
      scope: "repo",
    },
    async ({ accessToken, profile }) => {
      return { accessToken, profile };
    }
  ),
  "github"
);

export function decodeBase64(data: string) {
  const buffer = new Buffer(data, "base64");
  return buffer.toString("ascii");
}
