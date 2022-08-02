Refactor CLI
=================

A CLI for refactoring code. Right now this is mostly used
for its GitHub action, but in the future, it will be useful on its own.

## Languages Supported

- Rust


## `refactor rename OLDNAME NEWNAME`

Rename a symbol

```
USAGE
  $ refactor rename [OLDNAME] [NEWNAME] --file <value> --line <value> [--repoPath <value>]

FLAGS
  --file=<value>      (required) File that contains symbol
  --line=<value>      (required) Line that contains symbol
  --repoPath=<value>  Repository
  --language=<value>  Programming language 

DESCRIPTION
  Rename a symbol

EXAMPLES
  $ refactor rename Input FileInput --file test.js --line 10
```

_See code: [dist/commands/rename.ts](https://github.com/NicholasLYang/refactor-cli/blob/v0.0.2/dist/commands/rename.ts)_

