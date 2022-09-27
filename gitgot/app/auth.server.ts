import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/session.server";
import { expect } from "~/utils";
import { GitHubStrategy } from "remix-auth-github";
import { findOrCreateUser } from "~/models/user.server";

interface User {
  id: string;
  accessToken: string;
  profile: {
    displayName: string;
    _json: {
      id: number;
      email: string;
    };
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
      scope: "repo,read:org",
    },
    async ({ accessToken, profile }) => {
      try {
        const user = await findOrCreateUser(
          profile._json.id,
          profile._json.email,
          profile.displayName
        );
        console.log("DONE");
        return { accessToken, profile, id: user.id };
      } catch (e) {
        console.error(e);
        throw e;
      }
    }
  ),
  "github"
);

export function decodeBase64(data: string) {
  const buffer = new Buffer(data, "base64");
  return buffer.toString("ascii");
}
