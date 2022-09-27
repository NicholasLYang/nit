/*
  Warnings:

  - You are about to drop the column `pinnedRepositories` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "githubLogin" TEXT NOT NULL,
    "githubId" INTEGER NOT NULL,
    "recentlyVisitedRepositories" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "githubId", "githubLogin", "id", "recentlyVisitedRepositories", "updatedAt") SELECT "createdAt", "email", "githubId", "githubLogin", "id", "recentlyVisitedRepositories", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
