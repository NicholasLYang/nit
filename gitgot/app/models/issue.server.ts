import * as crypto from "crypto";
import { prisma } from "~/db.server";
import client from "~/apollo-client";
import { gql } from "@apollo/client";
import { DecryptionStatus } from "~/types";

const algorithm = "aes-192-cbc";

const IV_SIZE = 16;
const KEY_SIZE = 24;

async function encrypt(plaintext: string, key: Buffer, iv: Buffer) {
  const buffer = Buffer.from(plaintext);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  cipher.update(buffer);
  return cipher.final("base64");
}

async function decrypt(ciphertext: string, iv: Buffer, key: Buffer) {
  const buffer = Buffer.from(ciphertext, "base64");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.update(buffer);
  return decipher.final("utf8");
}

export async function decryptIssue({
  encryptedTitle,
  encryptedBody,
  number,
  repositoryOwner,
  repositoryName,
  userId,
}) {
  const nameWithOwner = `${repositoryOwner}/${repositoryName}`;
  const issues = await prisma.issue.findMany({
    where: { number, repository: { nameWithOwner } },
    select: { key: true, iv: true, members: true },
  });

  if (issues.length === 0) {
    return { status: DecryptionStatus.Open };
  }
  if (issues.length > 1) {
    console.error(
      `INTERNAL ERROR: multiple issues found for ${nameWithOwner}#${number}`
    );
  }

  const { key, iv, members } = issues[0];
  if (members.find((m) => m.userId === userId)) {
    const title = await decrypt(encryptedTitle, iv, key);
    const body = await decrypt(encryptedBody, iv, key);
    return { status: DecryptionStatus.MySecret, title, body };
  }

  return { status: DecryptionStatus.NotMySecret };
}

export async function encryptIssue({ title, body }) {
  const key = new Buffer(crypto.randomBytes(KEY_SIZE));
  const iv = new Buffer(crypto.randomBytes(IV_SIZE));
  const encryptedTitle = await encrypt(title, key, iv);
  const encryptedBody = await encrypt(body, key, iv);
  return { encryptedTitle, encryptedBody, key, iv };
}

export async function createIssue({
  repositoryOwner,
  repositoryName,
  iv,
  key,
  number,
  userId,
}) {
  const nameWithOwner = `${repositoryOwner}/${repositoryName}`;
  return prisma.issue.create({
    data: {
      repository: {
        connectOrCreate: {
          where: { nameWithOwner },
          create: { nameWithOwner },
        },
      },
      iv,
      key,
      number,
      members: {
        create: [
          {
            user: {
              connect: { id: userId },
            },
            role: "OWNER",
          },
        ],
      },
    },
  });
}

export async function uploadIssueToGitHub({
  accessToken,
  repositoryOwner,
  repositoryName,
  encryptedTitle,
  encryptedBody,
}) {
  const {
    data: { repository },
  } = await client.query({
    query: gql`
      query Repository($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          id
        }
      }
    `,
    context: { headers: { Authorization: `bearer ${accessToken}` } },
    variables: { owner: repositoryOwner, name: repositoryName },
  });

  const { data } = await client.mutate({
    mutation: gql`
      mutation CreateIssue(
        $title: String!
        $body: String!
        $repositoryId: ID!
      ) {
        createIssue(
          input: { title: $title, body: $body, repositoryId: $repositoryId }
        ) {
          issue {
            id
            number
          }
        }
      }
    `,
    variables: {
      title: encryptedTitle,
      body: encryptedBody,
      repositoryId: repository.id,
    },
    context: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const issueNumber = data.createIssue.issue.number;
  const issueId = data.createIssue.issue.id;

  await client.mutate({
    mutation: gql`
      mutation AddCommentToIssue($body: String!, $issueId: ID!) {
        addComment(input: { subjectId: $issueId, body: $body }) {
          clientMutationId
        }
      }
    `,
    variables: {
      body: `This issue is encrypted. To view it, please visit [gitgot](https://gitgot.io/${repositoryOwner}/${repositoryName}/issues/${issueNumber}).`,
      issueId,
    },
    context: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  return {
    issueNumber,
  };
}
