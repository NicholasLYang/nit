// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import Parser from "tree-sitter";
import Rust from "tree-sitter-rust";

type Data = {
  tree: object;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const parser = new Parser();
  parser.setLanguage(Rust);
  const tree = parser.parse("let x = 1");
  res.status(200).json({ tree });
}
