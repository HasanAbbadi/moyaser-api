// Fetch Api
const fetch = require("node-fetch-commonjs");

// To solve the cors issue
const cors = require("cors");

// Express App
const express = require("express");
const app = express();

const port = process.env.PORT || 4500;

app.use(cors());

if (app.get("env") === "development") {
  app.locals.pretty = true;
}

async function getData(pageNum) {
  const mainUrl = "https://api.hefzmoyaser.net/juzs";
  if (pageNum < 600) {
    juz = Math.ceil(pageNum / 20);
  } else {
    juz = Math.floor(pageNum / 20);
  }
  const res = await fetch(`${mainUrl}/${juz}/words`);
  return await res.json();
}

app.get("/", (req, res) => {
  res.json({
    text: "[Welcome to the unofficial mushaf hefzmoyaser api! 😊]",
    routes: [
      {
        route: "/page",
        desc: "get all words in page.",
      },
      {
        route: "/pages",
        desc: "get all words in two pages by providing the number of one.",
      },
      {
        route: "/verse",
        desc: "get the words in a verse with unqiue number",
      },
    ],
  });
});

app.get("/page", (req, res) => {
  res.send(`TODO`);
});

app.get("/page/:query", async (request, response) => {
  const query = request.params.query - 1;
  const format = request.query.format;

  if (query > 603) response.sendStatus(404);

  const data = await getData(query);

  // classifying all objects and grouping them by values
  let pages = data.filter((x) => x.page_number === query + 1);
  pages = groupBy(pages, (a, b) => a.page_number === b.page_number);
  const chapters = groupBy(pages, (a, b) => a.chapter_id === b.chapter_id);

  // group words into verse/line array in each chapter array
  chapters.map((_, i) => {
    if (format) {
      chapters[i] = groupBy(chapters[i], (a, b) => a.line_number === b[format]);
    } else {
      chapters[i] = groupBy(chapters[i], (a, b) => a.verse_key === b.verse_key);
    }
  });

  // send the final array of 3 nested arrays
  // chapters:[] -> verses:[] -> words:[] -> word:{}
  response.setHeader("Content-Type", "application/json");
  response.json(chapters);
});

app.get("/pages/:query", async (request, response) => {
  const query = request.params.query - 1;
  let secondPage = query + 2;

  if ((query + 1) % 2 === 0) {
    secondPage -= 3;
  }

  if (query > 603) response.sendStatus(404);

  const data = await getData(query);

  // classifying all objects and grouping them by values
  let pages = data.filter((x) => x.page_number === query + 1 || x.page_number === secondPage);
  pages = groupBy(pages, (a, b) => a.page_number === b.page_number);

  // group words into verse/line array in each chapter array
  pages.map((_, i) => {
      pages[i] = groupBy(pages[i], (a, b) => a.line_number === b.line_number);
  });

  // send the final array of 3 nested arrays
  // chapters:[] -> verses:[] -> words:[] -> word:{}
  response.setHeader("Content-Type", "application/json");
  response.json(pages);


})

app.get("/verse", (_, res) => {
  res.send("TODO");
});

app.get("/verse/:query", async (request, response) => {
  const query = request.params.query - 1;

  if (query > 6235) response.sendStatus(404);
  const mainUrl = "https://api.hefzmoyaser.net/verses";
  const res = await fetch(`${mainUrl}/${query}/interactions`);
  const json = await res.json();

  response.setHeader("Content-Type", "application/json");
  response.json(json);
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
