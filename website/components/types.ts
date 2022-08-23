export interface Blob {
  name: string;
  type: "blob";
  object: { text: string };
}

export interface Tree {
  name: string;
  type: "tree";
  object: { id: string };
}

export interface Directory {
  object: { entries: Blob[] };
}
