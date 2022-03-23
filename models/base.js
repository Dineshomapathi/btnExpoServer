'use strict';

const _ = require('lodash');
const md5 = require('md5');
const moment = require('moment');

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const config = require('../config');

module.exports = class User
{
	/*
		async addItem(obj) 
		async getItems() 
		async updateItem(_id, obj) // {company_name, team_code}
		async updateItems(myquery, newvalue) // {company_name, team_code}
		async upsertItems(myquery, newvalue) // {company_name, team_code}
		async findItem(obj = {}) // {company_name, team_code}
		async findItemDesc(obj = {}) // {company_name, team_code}
		async findItems(obj) // {company_name, team_code}
		getItem(_id)
		async deleteItem(_id)
		async deleteItems(obj = {}) // {socket_id, _id} 
		async getCount(obj = {}) // {socket_id, _id} 
		async getPagination(page_num = 1, per_page = 550) 
		async dropTable()
	*/

	constructor(table_name) 
	{
		this.table_name = table_name;
	}

	async addItem(obj) 
	{
		var client, item, res = null;

		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		try {
			const dt = moment().format("YYYY-MM-DD HH:mm:ss");
			const data = _.assign(obj, {
				is_active: true,
				updated_at: dt,
				created_at: dt,
			});
			item = await client.db(config.mongo_db).collection(this.table_name).insertOne(data);
		} catch(error) { 
			console.log('error', error);
			return res;
		}
		client.close();	
		return item.ops[0];
	}

	async getItems() 
	{
		var client, items, res = [];

		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		try {
			items = await client.db(config.mongo_db).collection(this.table_name).find({}).toArray();
		} catch(error) { 
			console.log('error', error);
			return res;
		}
		client.close();

		return items;
	}

	async updateItem(_id, obj) // {company_name, team_code}
	{
		var client, res = false;

		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		try {
			await client.db(config.mongo_db).collection(this.table_name).updateOne({_id:ObjectId(_id)}, {$set:obj});
		} catch(error) { 
			console.log('error', error);
			return res;
		}
		client.close();
		return true;
	}

	async updateItems(myquery, newvalue) // {company_name, team_code}
	{
		var client, res = false;

		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		try {
			await client.db(config.mongo_db).collection(this.table_name).updateMany(myquery, {$set:newvalue});
		} catch(error) { 
			console.log('error', error);
			return res;
		}
		client.close();
		return true;
	}

	async upsertItems(myquery, newvalue) // {company_name, team_code}
	{
		var client, res = false;

		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		const dt = moment().format("YYYY-MM-DD HH:mm:ss");
		 _.assign(newvalue, {is_active: true, updated_at: dt, created_at: dt});
			
		try {
			await client.db(config.mongo_db).collection(this.table_name).updateMany(myquery, {$set:newvalue}, {upsert:true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}
		client.close();
		return true;
	}

	async findItem(obj = {}) // {company_name, team_code}
	{
		var client, item, res = null;

		if (_.has(obj, '_id')) {
			obj._id = ObjectId(obj._id);
		}

		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		try {
			item = await client.db(config.mongo_db).collection(this.table_name).findOne(obj);
		} catch(error) { 
			console.log('error', error);
			return res;
		}
		client.close();
		return item;
	}

	async findItemDesc(obj = {}) // {company_name, team_code}
	{
		var client, item, res = null;

		if (_.has(obj, '_id')) {
			obj._id = ObjectId(obj._id);
		}

		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		try {
			var arr = await client.db(config.mongo_db).collection(this.table_name).find(obj).sort({_id:-1}).limit(1).toArray();
			if (arr.length == 0) return res;
			item = arr[0];
		} catch(error) { 
			console.log('error', error);
			return res;
		}
		client.close();
		return item;
	}

	async findItems(obj) // {company_name, team_code}
	{
		var client, items, res = [];

		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		try {
			items = await client.db(config.mongo_db).collection(this.table_name).find(obj).toArray();
		} catch(error) { 
			console.log('error', error);
			return res;
		}
		client.close();
		return items;
	}

	async getItem(_id)
	{
		var client, item, res = null;

		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		try {
			item = await client.db(config.mongo_db).collection(this.table_name).findOne({_id:ObjectId(_id)});
		} catch(error) { 
			console.log('error', error);
			return res;
		}
		client.close();

		return item ? item : null;
	}

	async deleteItem(_id)
	{
		var client, item, res = false;

		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		try {
			item = await client.db(config.mongo_db).collection(this.table_name).deleteOne({_id:ObjectId(_id)});
		} catch(error) { 
			console.log('error', error);
			return res;
		}
		client.close();

		return true;
	}

	async deleteItems(obj = {}) /* {socket_id, _id} */
	{
		var client, item, res = false;
		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		try {
			item = await client.db(config.mongo_db).collection(this.table_name).deleteMany(obj);
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		client.close();
		return true;
	}

	async getCount(obj = {}) /* {socket_id, _id} */
	{
		var client, item, res = 0;
		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		try {
			res = await client.db(config.mongo_db).collection(this.table_name).find(obj).count();
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		client.close();
		return res;
	}

	async getPagination(page_num = 1, per_page = 50) 
	{
		var client, data, total, res = [];

		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		try {
			var skips = per_page * (page_num - 1);
			data = await client.db(config.mongo_db).collection(this.table_name).find().skip(skips).limit(per_page).toArray();
			total = await client.db(config.mongo_db).collection(this.table_name).find().count();
			var to = skips + data.length;

		} catch(error) { 
			console.log('error', error);
			return res;
		}
		client.close();

		return {
			data,
			current_page: page_num,
			from: skips + 1,
			last_page: Math.ceil(total / per_page),
			per_page,
			to,
			total,
		};
	}

	async dropTable()
	{
		var client, item, res = false;
		try {
			client = await MongoClient.connect(config.mongo_url, {useUnifiedTopology: true});
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		try {
			// await client.db(config.mongo_db).collection(this.table_name).drop();
			await client.db(config.mongo_db).collection(this.table_name).deleteMany();
		} catch(error) { 
			console.log('error', error);
			return res;
		}

		client.close();
		return true;
	}

}
