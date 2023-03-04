# Moyaser-API
An api of extracted data from [hefzmoyaser](https://hefzmoyaser.net/mushaf)

## Installation
```shell
git clone https://github.com/HasanAbbadi/moyaser-api
cd moyaser-api
npm install
npm run start
```

the api will start at port 4500 by default.

## Usage:
There are three routes to this api:

* `/all`:       sends all json data from `all-verses.json`.
* `/page`:      get all verses from specific page.
* `/verse`:     get all words of verse using it's index in the mushaf.