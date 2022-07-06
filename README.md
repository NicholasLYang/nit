Refactor CLI
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g refactor-cli
$ refactor COMMAND
running command...
$ refactor (--version)
refactor-cli/0.0.1 darwin-arm64 node-v18.3.0
$ refactor --help [COMMAND]
USAGE
  $ refactor COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`refactor help [COMMAND]`](#refactor-help-command)
* [`refactor plugins`](#refactor-plugins)
* [`refactor plugins:install PLUGIN...`](#refactor-pluginsinstall-plugin)
* [`refactor plugins:inspect PLUGIN...`](#refactor-pluginsinspect-plugin)
* [`refactor plugins:install PLUGIN...`](#refactor-pluginsinstall-plugin-1)
* [`refactor plugins:link PLUGIN`](#refactor-pluginslink-plugin)
* [`refactor plugins:uninstall PLUGIN...`](#refactor-pluginsuninstall-plugin)
* [`refactor plugins:uninstall PLUGIN...`](#refactor-pluginsuninstall-plugin-1)
* [`refactor plugins:uninstall PLUGIN...`](#refactor-pluginsuninstall-plugin-2)
* [`refactor plugins update`](#refactor-plugins-update)
* [`refactor rename OLDNAME NEWNAME`](#refactor-rename-oldname-newname)

## `refactor help [COMMAND]`

Display help for refactor.

```
USAGE
  $ refactor help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for refactor.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.12/src/commands/help.ts)_

## `refactor plugins`

List installed plugins.

```
USAGE
  $ refactor plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ refactor plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.0.11/src/commands/plugins/index.ts)_

## `refactor plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ refactor plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ refactor plugins add

EXAMPLES
  $ refactor plugins:install myplugin 

  $ refactor plugins:install https://github.com/someuser/someplugin

  $ refactor plugins:install someuser/someplugin
```

## `refactor plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ refactor plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ refactor plugins:inspect myplugin
```

## `refactor plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ refactor plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ refactor plugins add

EXAMPLES
  $ refactor plugins:install myplugin 

  $ refactor plugins:install https://github.com/someuser/someplugin

  $ refactor plugins:install someuser/someplugin
```

## `refactor plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ refactor plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLES
  $ refactor plugins:link myplugin
```

## `refactor plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ refactor plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ refactor plugins unlink
  $ refactor plugins remove
```

## `refactor plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ refactor plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ refactor plugins unlink
  $ refactor plugins remove
```

## `refactor plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ refactor plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ refactor plugins unlink
  $ refactor plugins remove
```

## `refactor plugins update`

Update installed plugins.

```
USAGE
  $ refactor plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

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

_See code: [dist/commands/rename.ts](https://github.com/NicholasLYang/refactor-cli/blob/v0.0.1/dist/commands/rename.ts)_
<!-- commandsstop -->
