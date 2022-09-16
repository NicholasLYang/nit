/*
  Warnings:

  - Added the required column `githubId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `githubLogin` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "githubLogin" TEXT NOT NULL,
    "githubId" INTEGER NOT NULL,
    "pinnedRepositories" TEXT NOT NULL DEFAULT '',
    "recentlyVisitedRepositories" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "updatedAt") SELECT "createdAt", "email", "id", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
