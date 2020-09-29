const express = require("express");
const app = express();
const PORT = 7000; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/u/:shortURL", (req, res) => {
  // console.log(shortURL);
  const longURL = urlDatabase[req.params.shortURL];
 res.redirect(longURL);
});
app.get("/urls/:shortURL", (req, res) => {
  // console.log(req.params);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {

  let longReq = req.body;
  // console.log(longReq);  // Log the POST request body to the console
  let message = generateRandomString();
  urlDatabase[message] = longReq.longURL;

// console.log(urlDatabase);
 
  res.send(message);         // Respond with 'new short url'
});

function generateRandomString(bod) {
 return Math.random().toString(20).substr(2,6);
}

app.post("/urls/:shortURL/delete", (req, res) => {

  const templateVars =  req.params.shortURL;
  delete urlDatabase[templateVars];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/submit", (req, res) => {

  const newLongUrl = req.body.newUrl;
  const templateVars =  req.params.shortURL;
  urlDatabase[templateVars] = newLongUrl;
  console.log(newLongUrl);
  
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// Fill out the urls_show.ejs template to display the long URL and its shortened form. Also include a link (href='#') for creating a new url. 