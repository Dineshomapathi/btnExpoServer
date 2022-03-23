'use strict';

const _ = require('lodash');
const md5 = require('md5');
const moment = require('moment');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const config = require('../config');
const excel = require('exceljs');


module.exports = class MasterDB 
{
	async addItem(table_name, data){
		var client, item, res = null;

		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		try {
			item = await client.db(config.mongo_db).collection(table_name).insertOne(data);
		} catch(error) { 
			console.log('error', error);
			return res;
		}
		client.close();	
		return item.ops[0];
	}

	async getItems(table_name, obj){
		var client, items, res = [];

		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		try {
			items = await client.db(config.mongo_db).collection(table_name).find(obj).toArray();
		} catch(error) { 
			console.log('error', error);
			return res;
		}
		client.close();

		return items;
		// return this.items;
	}

	async getItemsL(table_name, obj, limit){
		var client, items, res = [];

		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		try {
			items = await client.db(config.mongo_db).collection(table_name).find(obj).sort({_id:-1}).limit(limit).toArray();
			items = items.reverse();
		} catch(error) { 
			console.log('error', error);
			return res;
		}
		client.close();

		return items;
		// return this.items;
	}

	async getItemsS(table_name, obj, sort){
		var client, items, res = [];

		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		try {
			items = await client.db(config.mongo_db).collection(table_name).find(obj).sort(sort).toArray();
		} catch(error) { 
			console.log('error', error);
			return res;
		}
		client.close();

		return items;
	}
	
	async getItemsSL(table_name, obj, sort, limit){
		var client, items, res = [];

		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		try {
			items = await client.db(config.mongo_db).collection(table_name).find(obj).sort(sort).limit(limit).toArray();
			items = items.reverse();
		} catch(error) { 
			console.log('error', error);
			return res;
		}
		client.close();

		return items;
		// return this.items;
	}

	async getItem(table_name, obj){
		var client, item, res = null;

		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		try {
			item = await client.db(config.mongo_db).collection(table_name).findOne(obj);
		} catch(error) { 
			console.log('error', error);
			return res;
		}
		client.close();
		return item;
	}

	async updateItems(table_name, query, obj){
		var client, res = null;

		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		try {
			await client.db(config.mongo_db).collection(table_name).updateMany(query, {$set:obj});
		} catch(error) { 
			console.log('error', error);
			return res;
		}
		client.close();
		return null;
	}

	async updateItem(table_name, query, obj){
		var client, res = null;

		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		try {
			await client.db(config.mongo_db).collection(table_name).updateOne(query, {$set:obj});
		} catch(error) { 
			console.log('error', error);
			return res;
		}
		client.close();
		return null;
	}

	async removeItems(table_name){
		var client, items, res = false;

		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		try {
			items = await client.db(config.mongo_db).collection(table_name).drop();
		} catch(error) { 
			console.log('error', error);
			return res;
		}
		client.close();

		return true;
	}

	async removeItemsO(table_name, obj){
		var client, items, res = false;

		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		try {
			items = await client.db(config.mongo_db).collection(table_name).deleteMany(obj);
		} catch(error) { 
			console.log('error', error);
			return res;
		}
		client.close();

		return true;
	}

	async removeItem(table_name, id){
		var client, res = false;

		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		try {
			await client.db(config.mongo_db).collection(table_name).deleteOne({ _id: ObjectId(id) });
		} catch(error) { 
			console.log('error', error);
			return res;
		}
		client.close();

		return true;
	}

	async removeItemO(table_name, obj){
		var client, res = false;

		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		try {
			await client.db(config.mongo_db).collection(table_name).deleteOne(obj);
		} catch(error) { 
			console.log('error', error);
			return res;
		}
		client.close();

		return true;
	}
}
