# Simple password manager

This repository is part of an assignment for bachelor's thesis.

## Description
The project demonstrates an implementation of password manager 
in [electron](https://www.electronjs.org) and [reactjs](https://reactjs.org).

This repository contains client's application.

## Other parts
Chromium based browser extension is accessible on: [github.com/hader00/password-manager-extension-dev](https://github.com/hader00/password-manager-extension-dev)

Serve is accessible on: [github.com/hader00/password-manager-app-server](https://github.com/hader00/password-manager-app-server)


## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.

### `yarn build`

Builds the app for production to the `build` folder.

### `yarn dist`

Create installation packages for all operating systems to the `dist` folder.

### `yarn dist-mac`

Create installation package project for macOS to the `dist` folder.

### `yarn dist-win`

Create installation package project for Windows to the `dist` folder.

### `yarn dist-linux`

Create installation package project for Linux to the `dist` folder.

## Node dependencies update

Install npm-check-updates:

`npm install -g npm-check-updates`

Display new dependencies:

`ncu`

Upgrade all versions in package.json:

`ncu -u`

Download new versions in package.json:

`npm update`


Install new versions in package.json:

`npm install`

After dependencies update you may need to use 

`electron-rebuild -f` to rebuild electron packages