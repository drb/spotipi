# Spotipi
Spotify player for distributed Raspberry Pi devices.

### Installation

*Assumption: You are using a Raspberry Pi 2 running the latest RaspianOS (Debian). This is my setup & it works. Anything else you're on your own.*

### Pull down code

`git clone https://github.com/drb/spotipi.git <target_dir>`

### Install Node.js if not already installed

`sudo apt-get install curl`

`sudo curl -sL https://deb.nodesource.com/setup | sudo bash -`

`apt-get install -y nodejs`

`apt-get install -y build-essential`

[There is a better guide for this process here.]( https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager#debian-and-ubuntu-based-linux-distributions)

### [optional... but important] Debian/Ubuntu needs alsa.h header file (ALSA backend is default option).

`sudo apt-get install libasound2-dev`

### Install NPM packages

This loads all the prerequisites from `package.json`

`cd <target_dir>`

`sudo npm install`

### Run Spotipi

`node spotipi.js`

Once the code initializes it will output a path you can connect to with a mobile device or browser. The default port is 3000.

### Keep alive in background & starting/stopping

There are a few ways to do this - forever is an NPM module that will spawn an instance of the server in the background and restart it when the process inevitably crashes.

#### Install the module globally:

`sudo npm install -g forever`

#### Start instance:

*Note: If you started the process earlier using `node spotipi.js`, kill it now; otherwise you won't be able to start it using forever.*

`forever start spotipi.js`

#### Check instance is alive:

`forever list` - this will output the process - take a note of the pid's index that is listed between [parens] i.e. [0] spotipi.js

#### Kill instance:

`forever stop <pid_index>`

