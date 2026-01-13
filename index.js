require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// ✅ pour lire le body des POST (form + json)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// ===============================
// ✅ Stockage en mémoire (OK pour FCC)
const urlDatabase = []; // index 0 => short_url 1, etc.

// ✅ Helpers
function isValidHttpUrl(str) {
  try {
    const u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// ✅ POST /api/shorturl
app.post("/api/shorturl", (req, res) => {
  const original_url = req.body.url;

  // 1) format URL
  if (!isValidHttpUrl(original_url)) {
    return res.json({ error: "invalid url" });
  }

  const hostname = new URL(original_url).hostname;

  // 2) vérification DNS
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }

    // (optionnel) éviter doublons : si déjà existante, renvoyer le même short_url
    const existingIndex = urlDatabase.indexOf(original_url);
    if (existingIndex !== -1) {
      return res.json({ original_url, short_url: existingIndex + 1 });
    }

    urlDatabase.push(original_url);
    const short_url = urlDatabase.length; // 1, 2, 3...

    return res.json({ original_url, short_url });
  });
});

// ✅ GET /api/shorturl/:short_url -> redirection
app.get("/api/shorturl/:short_url", (req, res) => {
  const short = parseInt(req.params.short_url);

  if (isNaN(short) || short < 1 || short > urlDatabase.length) {
    return res.json({ error: "invalid url" });
  }

  const original_url = urlDatabase[short - 1];
  return res.redirect(original_url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
