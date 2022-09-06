import { Authenticator } from "remix-auth";
import { getSession, logout, sessionStorage } from "~/session.server";
import { expect } from "~/utils";
import { GitHubStrategy } from "remix-auth-github";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import { Params } from "react-router";
import { createSession } from "@remix-run/server-runtime";

interface User {
  accessToken: string;
  installations: Array<{
    id: string;
    account: {
      login: string;
    };
    token: string;
    expiresAt: string;
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
    getUserInstallations
  ),
  "github"
);

function decodeBase64(data: string) {
  const buffer = new Buffer(data, "base64");
  return buffer.toString("ascii");
}

let PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY && process.env.PRIVATE_KEY_64) {
  PRIVATE_KEY = decodeBase64(process.env.PRIVATE_KEY_64);
}

expect(
  PRIVATE_KEY,
  "Expected one of PRIVATE_KEY or PRIVATE_KEY_64 environment variables"
);

export const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: expect(process.env.APP_ID, "Expected APP_ID environment variable"),
    privateKey: PRIVATE_KEY,
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

async function getUserInstallations({ accessToken, ...rest }) {
  console.log("--------------");
  console.log("GOT ACCESS TOKEN" + accessToken);
  console.log(rest);
  const response = await fetch("https://api.github.com/user/installations", {
    headers: {
      Authorization: `token ${accessToken}`,
    },
  });

  const userInstallations = await response.json();
  console.log("USER INSTALLATIONS");

  const auth = createAppAuth({
    appId: expect(process.env.APP_ID, "Expected APP_ID environment variable"),
    privateKey: PRIVATE_KEY,
    clientId: expect(
      process.env.CLIENT_ID,
      "Expected CLIENT_ID environment variable"
    ),
    clientSecret: expect(
      process.env.CLIENT_SECRET,
      "Expected CLIENT_SECRET environment variable"
    ),
  });

  let installKeys;
  try {
    installKeys = await Promise.all(
      userInstallations.installations.map((install) =>
        auth({
          type: "installation",
          installationId: install.id,
        })
      )
    );
  } catch (e) {
    console.error(e);
    console.log(e);
    throw e;
  }

  console.log(installKeys);
  const installations = userInstallations.installations.map((i, index) => ({
    id: i.id,
    account: i.account,
    token: installKeys[index].token,
    expiresAt: installKeys[index].expiresAt,
  }));
  console.log("--------------");
  return { accessToken, installations };
}

export async function getInstallationToken(request: Request, params: Params) {
  const { installations } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const installation = installations.find(
    (i) => i.account.login === params.owner
  );

  if (!installation) {
    return { error: "Cannot access repository, invalid permissions" };
  }

  // TODO: Instead of logging out, just reauthenticate the installations
  if (new Date() > new Date(installation.expiresAt)) {
    return { logout: logout(request) };
  }

  return { token: installation.token };
}
