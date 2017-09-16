---
layout: default
---

# Diaspora

***Multi-source ORM for NodeJS & the browser***


> You are on the manual website. You may check the [Quick Code Review](docco/index.html) or the [API Documentation](jsdoc/index.html)

---

## What is Diaspora

A diaspora, according to (TODO), is

> (TODO find a citation)

Exactly like populations, your apps may use datas from several sources, and you may like to interact with each source independently with the same payload data. Some example of applications that takes advantage of Diaspora: 

### Example 1: Diaspora Doc

On your account, can load, edit & save documents. Once opened, you work on an offline version that keeps all your changes, so you can close the window and continue back later. After editing your document, you'll save it: it sends the document on the server (probably via a REST API), that will persist it on the server's database.

### Example 2: Update search engine datas

On your website, you store the full article on a MySQL or MongoDB database. When you create, update, or delete your documents, search engine datas have to be refreshed.

## How does it work?

Diaspora is composed of a server & a client library, both loading the same configuration structure.

Diaspora allows you to create models, entities and data sources.

### Models

Models represents the population of your data, and how to interact with them. Models manage [entities](#), and interacts with [data sources](). We can assimilate it to a table in MySQL or a collection in MongoDB.

> See the [Model API]()

### Entities

An entity represent a data, like a row in MySQL, or a document in MongoDB. Each entities are attached to a single [model](), and contains its value for each [data source](). An entity can then know and interact with its state in each data source.

### Data sources

Data sources are a data store we interact with through [adapters](). This is a database in the store you use. A store is, for example, your MySQL, Mongo, Redis server, an HTTP REST API, or even a block of memory in the program



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