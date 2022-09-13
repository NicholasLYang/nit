import type { User } from "@prisma/client";

import { prisma } from "~/db.server";
import { getUser } from "~/session.server";
import { HomePageRepositories } from "~/types";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(email: User["email"]) {
  return prisma.user.create({
    data: {
      email,
    },
  });
}

export async function findOrCreateUser(
  githubId: User["githubId"],
  email: User["email"],
  githubLogin: User["githubLogin"]
) {
  return prisma.user.upsert({
    where: { githubId },
    update: {},
    create: { email, githubLogin, githubId },
  });
}

export async function getHomePageRepositories(
  id: User["id"]
): Promise<HomePageRepositories | undefined> {
  const user = await getUserById(id);
  if (!user) {
    return undefined;
  }
  if (
    user.recentlyVisitedRepositories === "" &&
    user.pinnedRepositories === ""
  ) {
    return undefined;
  }

  const recentlyVisitedRepositories =
    user.recentlyVisitedRepositories !== ""
      ? user.recentlyVisitedRepositories.split(" ")
      : [];

  const pinnedRepositories =
    user.pinnedRepositories !== "" ? user.pinnedRepositories.split(" ") : [];

  return {
    recentlyVisited: recentlyVisitedRepositories,
    pinned: pinnedRepositories,
  };
}

export async function addVisitedRepository(id: User["id"], repoName: string) {
  const user = await getUserById(id);
  // If the user doesn't exist, well that shouldn't happen
  // but it's not a big deal, we just don't add anything
  if (!user) {
    return;
  }

  // If there are no recently visited repositories, we just add the one repo
  if (user.recentlyVisitedRepositories === "") {
    await prisma.user.update({
      where: { id },
      data: { recentlyVisitedRepositories: repoName },
    });
    return;
  }

  let recentlyVisitedRepositories = user.recentlyVisitedRepositories
    .split(" ")
    // If we've seen the repo already, we filter it out
    .filter((repo) => repo !== repoName);

  // We only keep the last 4 repositories. Since we're adding one, we slice to
  // just 3 repositories. This could change later.
  if (recentlyVisitedRepositories.length > 4) {
    recentlyVisitedRepositories = recentlyVisitedRepositories.slice(0, 4);
  }

  await prisma.user.update({
    where: { id },
    data: {
      recentlyVisitedRepositories: [
        repoName,
        ...recentlyVisitedRepositories,
      ].join(" "),
    },
  });

  return;
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}
