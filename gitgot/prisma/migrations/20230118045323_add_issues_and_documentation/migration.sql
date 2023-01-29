-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repositoryId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "key" BLOB NOT NULL,
    "iv" BLOB NOT NULL,
    CONSTRAINT "Issue_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IssueMembership" (
    "issueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    PRIMARY KEY ("issueId", "userId"),
    CONSTRAINT "IssueMembership_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "IssueMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameWithOwner" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "RepositoryDocumentation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repositoryId" INTEGER NOT NULL,
    "documentationId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Documentation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Repository_nameWithOwner_key" ON "Repository"("nameWithOwner");

-- CreateIndex
CREATE UNIQUE INDEX "Documentation_url_key" ON "Documentation"("url");
