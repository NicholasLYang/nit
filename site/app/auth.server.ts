import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/session.server";
import { expect } from "~/utils";
import { GitHubStrategy } from "remix-auth-github";

interface User {}

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
      callbackURL: "http://localhost:3000/auth/github/callback",
    },
    async ({ accessToken, extraParams, profile }) => {
      return accessToken;
    }
  ),
  "github"
);
