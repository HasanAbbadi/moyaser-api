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
  const query = request.params.query;
  const groupByPage = groupBy("page_number");
  const pages = groupByPage(data);
  const result = pages[query];
  const groupByChapter = groupBy("chapter_id");
  const chapters = groupByChapter(result);
  Object.keys(chapters).forEach(function (key) {
    const groupByVerse = groupBy('verse_key');
    chapters[key] = groupByVerse(chapters[key]);
  });
  response.send({
    page: query,
    chapters: chapters,
  });
});

app.get("/verse", (_, res) => {
  res.send("TODO");
});

app.get("/verse/:query", (request, response) => {
  const query = request.params.query;
  const groupByVerse = groupBy("verse_id");
  const verses = groupByVerse(data);
  response.send({
    page: verses[query][0].page_number,
    chapter: verses[query][0].chapter_id,
    verses: verses[query],
  });
});

const groupBy = (key) => (array) =>
  array.reduce(
    (objectsByKeyValue, obj) => ({
      ...objectsByKeyValue,
      [obj[key]]: (objectsByKeyValue[obj[key]] || []).concat(obj),
    }),
    {}
  );

app.listen(port, () => console.log(`Server started at ${port}`));

module.exports = app;
