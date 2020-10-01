const express = require("express");
const app = express();
const PORT = 7000; // default port 

app.set("view engine", "ejs");
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }

}


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
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  };

  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("urls_login", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  // console.log(shortURL);
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
app.get("/urls/:shortURL", (req, res) => {
  // console.log(req.params);
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {

  let longReq = req.body;
  let message = generateRandomString();
  urlDatabase[message] = longReq.longURL;

  res.send(message);         // Respond with 'new short url'
});

function generateRandomString(bod) {
  return Math.random().toString(20).substr(2, 6);
}

app.post("/urls/:shortURL/delete", (req, res) => {

  const templateVars = req.params.shortURL;
  delete urlDatabase[templateVars];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/submit", (req, res) => {

  const newLongUrl = req.body.newUrl;
  const templateVars = req.params.shortURL;
  urlDatabase[templateVars] = newLongUrl;
  // console.log(newLongUrl);

  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let newEmail = req.body.email;
  let newPass = req.body.password;

  if (newEmail === "" && newPass === "") {
    res.sendStatus(404);
  }

  else if (findEmail(users, newEmail) === false) {
    res.sendStatus(404);

  }

  else {
    const newID = generateRandomString();
    res.cookie("user_id", newID);
    users[newID] = { id: newID, email: newEmail, password: newPass };

    res.redirect("/urls")
  }
});


const findEmail = function (usersDB, email) {
  for (let user in usersDB) {

    if (usersDB[user]["email"] === email) {
      return false;
    }

  }
  return true;
}

const searchUser = function (usersDB, email) {
  for (let user in usersDB) {

    if (usersDB[user]["email"] === email) {
      return usersDB[user];
    }

  }
  return null;
}

app.post("/login", (req, res) => {

  const { email, password } = req.body;



  if (email === "" || password === "") {
    return res.status(400).send("No email and/or Password!");

  }

  const userFound = searchUser(users, email);

  if(!userFound) {

    return res.status(403).send("User not found");
  }

    if (userFound.password !== password) {
      
      return res.status(401).send("Password Incorrect!");
    }

    res.cookie("user_id", userFound.id);
    res.redirect("/urls");
  

});

app.post("/logout", (req, res) => {

  // console.log(req.cookies);
  res.clearCookie("user_id");

  res.redirect("/urls")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// Fill out the urls_show.ejs template to display the long URL and its shortened form. Also include a link (href='#') for creating a new url. 
