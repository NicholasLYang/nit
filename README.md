Refactor CLI
=================

A CLI for refactoring code. Right now this is mostly used
for the refactor GitHub action, but in the future, it 
will be useful on its own.

## Languages Supported

- Rust

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/refactor-cli)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/refactor-cli)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json)

## `refactor rename OLDNAME NEWNAME`

Rename a symbol

```
USAGE
  $ refactor rename [OLDNAME] [NEWNAME] --file <value> --line <value> [--repoPath <value>]

FLAGS
  --file=<value>      (required) File that contains symbol
  --line=<value>      (required) Line that contains symbol
  --repoPath=<value>  Repository

DESCRIPTION
  Rename a symbol

EXAMPLES
  $ refactor rename Input FileInput --file test.js --line 10
```

_See code: [dist/commands/rename.ts](https://github.com/NicholasLYang/refactor-cli/blob/v0.0.2/dist/commands/rename.ts)_

