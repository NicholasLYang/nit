import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/session.server";
import { expect } from "~/utils";
import { GitHubStrategy } from "remix-auth-github";
import { createUser, User } from "./models/user.server";

interface User {}

export let authenticator = new Authenticator<User>(sessionStorage);

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
      return createUser(profile.emails[0].value);
    }
  ),
  "github"
);
