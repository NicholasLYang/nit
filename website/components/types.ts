export interface File {
  name: string;
  type: string;
  object: { text: string };
}

export interface Repository {
  object: { entries: File[] };
}
