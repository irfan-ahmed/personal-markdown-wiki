personal-markdown-wiki
======================

A simple angular-js and node based personal inline-editable wiki.

##Why?
Just needed a personal simple wiki like web application where small snippets of information can be stored. The idea is to store information that may not be available publicly on a blog or somewhere. Also since the wiki can do inline editing for only the section, it makes it very easy to update and store the data on the go. 

The sections are editable with markdown and hence makes the edits very simple. Also a simple help is shown when one is editing the sections. Currently each section is stored as a separate file on the server. 

##Getting Started
###Prerequisites
The application requires node and angular-js along with various other dependencies to work. Hence you need `node` and the `node package manager (npm)` installed. You can get them from [nodejs.org](http://nodejs.org)

The client side dependencies are installed using `bower`. Make sure after installing `node`, you install `bower`.
```
npm install -s bower
```

###Installation
Clone the repository
``` 
git clone https://github.com/irfan-ahmed/personal-markdown-wiki
cd personal-markdown-wiki
```
Install dependencies using `npm`. The `package.json` script will install the node modules and is configured to automatically call `bower install` to install the bower components. This is based on the [angular-seed](https://github.com/angular/angular-seed) project.
```
npm install
```

### Run the application
Just start the application using node and the `main.js` script.
```
node main.js
```
This will start the node server. The application will be available on port `9090`

###License
[MIT](https://github.com/irfan-ahmed/personal-markdown-wiki/blob/master/LICENSE)
