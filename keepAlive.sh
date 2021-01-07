#!/bin/sh

alive () {
	node ./bot.js
	alive
}

alive