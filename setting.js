'use strict';

const fs = require('fs');
const _ = require('lodash');
const moment = require('moment');
const {TweenMax, Power2, TimelineLite, delayedCall} = require("gsap");

const App = require('./app.js');

module.exports = class Setting 
{
	constructor() 
	{
		this.loadFile();
		this.instance1 = {};
		this.instance2 = {};
		this.instance3 = {};
		this.instance4 = {};
	}

	updateItem(name, value) 
	{
		this.item[name] = value;
		if (name == 'is_post_question') this.castPostQuestion();
		if (name == 'is_live') this.castLive();
		// if (name == 'is_party') this.castParty();
		// if (name == 'is_warning') this.castWarning();
	}

	getItem() 
	{
		return this.item;
	}

	saveFile()
	{
		var content = JSON.stringify(this.item);
		var filename = `./db/setting.json`;
		fs.writeFile(filename, content, (error) => {
			if (error) console.log(error);
		});
	}

	loadFile()
	{
		fs.readFile('./db/setting.json', 'utf8', (error, data) => {
			if (data) {
				var obj = JSON.parse(data);
				this.item = obj;
				if (_.has(obj, 'is_event_start') == false) {
					this.item.is_event_start = false;
				}
			} else {
				this.item = {
					stream_url: null,
					is_post_question: false,
					is_live: false,
					countdown_dt: null,
					is_party: false,
					warning_text: null,
					is_warning: false,
					is_event_start: false,
				};
			}
			this.castPostQuestion();
			this.castLive();
			if (error) console.log(error);
		});
	}

	castPostQuestion() 
	{
		const app = App.getInstance();
		TweenMax.killTweensOf(this.instance1);
		if (this.item.is_post_question) {
			app.io.emit('onGlobalStartCastPostQuestion', {dt:app.dt()});
			var clock = 0;
			TweenMax.to(this.instance1, 0.5, {repeat:99999, repeatDelay:0.5, onRepeat() {
					clock++;
					console.log(app.dd(),'onGlobalCastPostQuestion',clock);
					app.io.emit('onGlobalCastPostQuestion', {dt:app.dt()});
				}, onComplete() {
					//
				}
			});
		} else {
			console.log(app.dd(), 'onGlobalStopCastPostQuestion');
			app.io.emit('onGlobalStopCastPostQuestion', {dt:app.dt()});
		}
	}

	castLive()
	{
		const app = App.getInstance();
		TweenMax.killTweensOf(this.instance2);
		if (this.item.is_live) {
			app.io.emit('onGlobalStartCastLive', {dt:app.dt()});
			var clock = 0;
			TweenMax.to(this.instance2, 0.5, {repeat:99999, repeatDelay:0.5, onRepeat() {
					clock++;
					console.log(app.dd(),'onGlobalCastLive',clock);
					app.io.emit('onGlobalCastLive', {dt:app.dt()});
				}, onComplete() {
					//
				}
			});
		} else {
			console.log(app.dd(), 'onGlobalStopCastLive');
			app.io.emit('onGlobalStopCastLive', {dt:app.dt()});
		}		
	}

	castParty()
	{
		const app = App.getInstance();
		TweenMax.killTweensOf(this.instance3);
		if (this.item.is_party) {
			app.io.emit('onGlobalStartCastParty', {dt:app.dt()});
			var clock = 0;
			TweenMax.to(this.instance3, 0.5, {repeat:99999, repeatDelay:0.5, onRepeat() {
					clock++;
					console.log(app.dd(),'onGlobalCastParty',clock);
					app.io.emit('onGlobalCastParty', {dt:app.dt()});
				}, onComplete() {
					//
				}
			});
		} else {
			console.log(app.dd(), 'onGlobalStopCastParty');
			app.io.emit('onGlobalStopCastParty', {dt:app.dt()});
		}		
	}

	castWarning()
	{
		const app = App.getInstance();
		TweenMax.killTweensOf(this.instance4);
		if (this.item.is_warning) {
			app.io.emit('onGlobalStartCastWarning', {dt:app.dt()});
			var clock = 0;
			TweenMax.to(this.instance4, 0.5, {repeat:99999, repeatDelay:0.5, onRepeat() {
					clock++;
					console.log(app.dd(),'onGlobalCastWarning',clock);
					app.io.emit('onGlobalCastWarning', {dt:app.dt()});
				}, onComplete() {
					//
				}
			});
		} else {
			console.log(app.dd(), 'onGlobalStopCastWarning');
			app.io.emit('onGlobalStopCastWarning', {dt:app.dt()});
		}	
	}

}

