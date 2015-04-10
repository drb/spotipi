# Spotipi
Spotify player for distributed Raspberry Pi devices.

### Installation

*Assumption: You are using a Raspberry Pi 2 running the latest RaspianOS (Debian). This is my setup & it works. Anything else you're on your own.*

### Pull down code

`git clone https://github.com/drb/spotipi.git <target_dir>`

### [Optional] Install Node.js if not already installed

`sudo apt-get install curl`

`sudo curl -sL https://deb.nodesource.com/setup | sudo bash -`

`apt-get install -y nodejs`

`apt-get install -y build-essential`

[There is a better guide for this process here.]( https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager#debian-and-ubuntu-based-linux-distributions)

### Install packages

This loads all the prerequisites from `package.json`

`cd <target_dir>`

`sudo npm install`

### Run Spotipi

`node index.js`

Once the code initializes it will output a path you can connect to with a mobile device or browser. The default port is 3000.

### Keep alive in background

There are a few ways to do this - forever is an NPM module that will spawn an instance of the server in the background and restart it when the process inevitably crashes.

Install the module globally

`sudo npm install -g forever`

Start instance

`forever start index.js`

Check instance is alive

`forever list` - this will output the process.

