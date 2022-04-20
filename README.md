# Simple password manager

This repository is part of an assignment for bachelor's thesis.

## Description
The project demonstrates an implementation of password manager 
in [electron](https://www.electronjs.org) and [reactjs](https://reactjs.org).

This repository contains client's application.
Default server is running on: [https://password-manager-mysql.herokuapp.com](https://password-manager-mysql.herokuapp.com).

## Related projects
Chromium based browser extension is accessible on: [github.com/hader00/password-manager-extension-dev](https://github.com/hader00/password-manager-extension-dev).

Server is accessible on: [github.com/hader00/password-manager-app-server](https://github.com/hader00/password-manager-app-server).

## How to install
Visit [Github Release](https://github.com/hader00/password-manager-dev/releases) and download the latest installer for your operating system.

Additionally, you can download [Chrome extension](https://github.com/hader00/password-manager-extension-dev/releases) and build [custom server](https://github.com/hader00/password-manager-app-server/).

## Local installation

### Required dependencies
- [node](https://nodejs.org/en/download/),
- [yarn](https://classic.yarnpkg.com/en/).

Other dependencies will be automatically installed using:

`yarn install`

in the project folder.

### How to build and start locally
1. Clone the repository,
2. Install required dependencies,
3. Run `yarn install`,
4. Run `yarn start`,
5. Follow the guide on [how to set up custom server](https://github.com/hader00/password-manager-app-server/blob/main/README.md), or use the default server,
6. Additionally, download or build [Chrome extension](https://github.com/hader00/password-manager-extension-dev).


### Available Scripts

Run the app in the development mode: `yarn start`

Create installation packages for all operating systems to the **dist** folder: `yarn dist`

Create installation package project for macOS to the **dist** folder: `yarn dist-mac`

Create installation package project for Windows to the **dist** folder: `yarn dist-win`

Create installation package project for Linux to the **dist** folder: `yarn dist-linux`

## Node dependencies update

Install npm-check-updates: `npm install -g npm-check-updates`, if not installed

Display new dependencies: `ncu`

Upgrade all versions in package.json: `ncu -u`

Install new versions in package.json: `yarn install`

After dependencies update you may need to use `electron-rebuild -f` to rebuild electron packages if you face errors after update.