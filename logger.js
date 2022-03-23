'use strict';

const moment = require('moment'); // time date
const fs = require('fs'); // write file

module.exports = class Logger 
{
	constructor() 
	{
		
	}

	info(value) 
	{
		this.writefile('info', value);
	}

	error(value) 
	{
		this.writefile('error', value);
	}

	writefile(prefix, value)
	{
		var content = `[ ${moment().format("YYYY-MM-DD HH:mm:ss")} ] ${value}`;
		var filename = `./logs/${prefix}-` + moment().format("YYYY-MM-DD") + '.txt';
		fs.appendFile(filename, `${content}\n`, err => {
			if (err) console.log('err',err);
		});
	}


}

