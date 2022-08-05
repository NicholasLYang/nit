Nit Worker
=================

A worker for refactoring code. For ease of use we have it as a CLI

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
