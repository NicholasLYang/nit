import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/session.server";
import { expect } from "~/utils";
import { GitHubStrategy } from "remix-auth-github";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";

interface User {
  accessToken: string;
  installations: Array<{
    id: string;
    account: object;
  }>;
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
    },
    async ({ accessToken }) => {
      const response = await fetch(
        "https://api.github.com/user/installations",
        {
          headers: {
            Authorization: `token ${accessToken}`,
          },
        }
      );

      const userInstallations = await response.json();
      console.log(userInstallations.installations[0].account);
      const installations = userInstallations.installations.map((i) => ({
        id: i.id,
        account: i.account,
      }));

      return { accessToken, installations };
    }
  ),
  "github"
);

export const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: expect(process.env.APP_ID, "Expected APP_ID environment variable"),
    privateKey: expect(
      process.env.PRIVATE_KEY,
      "Expected PRIVATE_KEY environment variable"
    ),
    clientId: expect(
      process.env.CLIENT_ID,
      "Expected CLIENT_ID environment variable"
    ),
    clientSecret: expect(
      process.env.CLIENT_SECRET,
      "Expected CLIENT_SECRET environment variable"
    ),
  },
});
