import type { User } from "@prisma/client";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
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

export async function getRecentlyVisitedRepositories(
  id: User["id"]
): Promise<string[]> {
  const user = await getUserById(id);

  if (!user || user.recentlyVisitedRepositories === "") {
    return [];
  }

  return user.recentlyVisitedRepositories.split(" ");
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
