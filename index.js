const fs = require("fs");
const fetch = require("node-fetch-commonjs");
const data = require("./all-verses.json");

// To solve the cors issue
const cors = require("cors");

// json file with the data
const express = require("express");
const app = express();

const port = process.env.PORT || 4500;

app.use(cors());

if (app.get("env") === "development") {
  app.locals.pretty = true;
}

app.get("/", (req, res) => {
  res.send({
    text: "[Welcome to the unofficial mushaf hefzmoyaser api! 😊]",
    routes: [
      {
        route: "/page",
        desc: "get all words in page.",
      },
      {
        route: "/verse",
        desc: "get the words in a verse with unqiue number",
      },
    ],
  });
});

// when get request is made, alldata() is called
app.get("/all", alldata);
function alldata(request, response) {
  response.send(data);
}

app.get("/page", (req, res) => {
  res.send(`TODO`);
});

app.get("/page/:query", (request, response) => {
  const query = request.params.query - 1;

  if (query > 603) response.sendStatus(404);

  // classifying all objects and grouping them by values
  let pages = groupBy(data, (a, b) => a.page_number === b.page_number);
  pages = pages[query];
  const chapters = groupBy(pages, (a, b) => a.chapter_id === b.chapter_id);

  // group words into verse array in each chapter array
  chapters.map((_, i) => {
    chapters[i] = groupBy(chapters[i], (a, b) => a.verse_key === b.verse_key);
  });

  // send the final array of 3 nested arrays
  // chapters:[] -> verses:[] -> words:[] -> word:{}
  response.send(chapters);
});

app.get("/verse", (_, res) => {
  res.send("TODO");
});

app.get("/verse/:query", (request, response) => {
  const query = request.params.query - 1;

  if (query > 6235) response.sendStatus(404);

  // group all objects by verse number.
  const verses = groupBy(data, (a, b) => a.verse_id === b.verse_id);

  // send the final object that holds the words array:
  // info:{} -> words:[] -> word:{}
  response.send({
    page: verses[query][0].page_number,
    chapter: verses[query][0].chapter_id,
    words: verses[query],
  });
});

function groupBy(arr, cb) {
  let list = [...arr];
  const result = [];
  while (list.length) {
    const { alike, remaining } = group(list, cb);
    result.push(alike);
    list = remaining;
  }
  return result;
}

function group(list, cb) {
  const alike = [];
  const remaining = [];
  const a = list.shift();
  list.map((b) => {
    const bool = cb(a, b);
    if (bool) alike.push(b);
    else remaining.push(b);
  });
  return {
    alike: alike.length > 0 ? [a, ...alike] : a,
    remaining,
  };
}

app.listen(port, () => console.log(`Server started at ${port}`));

module.exports = app;
