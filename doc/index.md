---
layout: default
toc: true
---

# Diaspora

***Multi-source ORM for NodeJS & modern web browsers***


> You are on the manual website. You may check the [Quick Code Review](docco/index.html) or the [API Documentation](jsdoc/index.html)

---

## What is Diaspora

> A *diaspora* (from Greek διασπορά, "scattering, dispersion") is a scattered population whose origin lies within a smaller geographic locale
- Wikipedia

Diaspora considers data as populations and like human beings these data can move from their original app memory to databases.
A Diaspora based app may thus use data from several sources and can interact with each source independently with the same payload data.
Here are some examples :

### Example 1: "Diaspora Docs"

Let's consider an *online office suite app* with both desktop and browser interface : you can load, edit and save your documents and your account synchronises them all.
If working offline, the app keeps all changes locally on an offline version and when working online, it will send it on the server to be saved on one or many of the server's databases upon saving.


### Example 2: Update search engine datas

A website article is stored on a database (let's say MySQL or MongoDB). When you create, update or delete the article, your website search engine data have to be refreshed.


## How does it work?

Diaspora is both a server and a client library, loading the same configuation structure.
Diaspora allows you to create models, entities and data sources :

### Models

Models describe data and how to interact with them. Models instantiate and manage their [entities](#), and interacts with [data sources](). We can assimilate it to a table in MySQL or a collection in MongoDB.

<a href="jsdoc/Model.html" class="btn">See the <b>Model API</b></a>

### Entities

An entity represent a data, like a row in MySQL, or a document in MongoDB. Each entities are attached to a single [model](), and contains its value for each [data source](). Thus, an entity can know and interact with its state in each data source.

<a href="jsdoc/Entity.html" class="btn">See the <b>Entity API</b></a>

### Data sources

Data sources are data stores we interact with through [adapters](). A store is, for example, your MySQL, Mongo, Redis server, an HTTP REST API, or even a block of memory in your program. You are not supposed to use adapters & data-sources directly: Diaspora is in charge for this.

<a href="create-an-adapter.html" class="btn">Learn how to <b>create an adapter</b></a>

## Available adapters

<table style="display:table;">
	<thead>
		<tr>
			<th>Adapter</th>
			<th>Links</th>
			<th>Maintainer</th>
			<th>Platform</th>
			<th>Other infos</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td style="vertical-align: middle;"><img width="100" alt="In memory" src="https://cdn.rawgit.com/GerkinDev/Diaspora/master/media/inMemory.svg"/></td>
			<td colspan="2" style="vertical-align: middle;">Built-in</td>
			<td>Node + Browser</td>
			<td rowspan="2" style="vertical-align: middle;">QL v2</td>
		</tr>
		<tr>
			<td style="vertical-align: middle;"><a href="https://developer.mozilla.org/en-US/docs/Web/API/Storage"><img width="100" alt="Browser storage" src="https://cdn.rawgit.com/GerkinDev/Diaspora/master/media/webStorage.svg"/></a></td>
			<td colspan="2" style="vertical-align: middle;">Built-in</td>
			<td>Browser</td>
		</tr>
		<tr>
			<td style="vertical-align: middle;"><a href="https://www.mongodb.com/"><img width="100" alt="MongoDB" src="https://cdn.rawgit.com/GerkinDev/Diaspora-Mongo/master/media/mongo.svg"/></a></td>
			<td style="vertical-align: middle;">
				<a href="https://github.com/GerkinDev/Diaspora-Mongo" target="_blank"><img alt="GitHub release" src="https://img.shields.io/github/release/GerkinDev/Diaspora-Mongo.svg?label=GitHub"/></a>
				<a href="https://www.npmjs.com/package/diaspora-mongo" target="_blank"><img alt="npm" src="https://img.shields.io/npm/v/diaspora-mongo.svg"/></a>
				<a href="yarnpkg.com/en/package/diaspora-mongo" target="_blank"><img alt="yarn" src="https://img.shields.io/npm/v/diaspora-mongo.svg?label=yarn"/></a>
			</td>
			<td style="vertical-align: middle;"><a href="https://github.com/GerkinDev" target="_blank"><img alt="GitHub followers" src="https://img.shields.io/github/followers/GerkinDev.svg?label=GerkinDev"/></a></td>
			<td>Node</td>
			<td style="vertical-align: middle;">QL v2</td>
		</tr>
	</tbody>
</table>

## Planned or unsure Diaspora behaviors

> Manual change of ID

*Unsure* > Entity may change mode to `desync` ?

> P2P Adapter

*Unsure* > May be interesting... Check for possible problems about data modification, etc etc.

> Mongo Adapter

*Planned* > Wait for definitive adapter structure

> Redis Adapter

*Planned* > Wait for definitive adapter structure

> LocalStorage/SessionStorage Adapter

*Planned* > Wait for definitive adapter structure

> Auto-switch to API server/client

*Planned* > Wait for at least Mongo & Localstorage adapters.

<div id="disqus_thread"></div>
