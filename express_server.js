const getUserByEmail = require('./helpers');
const cookieSession = require('cookie-session');
const express = require("express");
const app = express();
const PORT = 7000; // default port 
const bcrypt = require('bcrypt');
app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['lknt42fnoh90hn2hf90w8fhofnwe0'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));



const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "2iaj8b"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "2iaj8b"
  },
  i3BBBB: {
    longURL: "https://www.goofy.ca",
    userID: "aJ48lW"
  }
};

const users = {
  "aJ49lW": {
    id: "aJ49lW",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "aJ48lW": {
    id: "aJ48lW",
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
//get for urls page
  const user = req.session.user_id;
  const filter = urlsForUser(urlDatabase, user);
  const templateVars = {
    urls: filter,
    user: users[req.session.user_id]
  }

  res.render("urls_index", templateVars);

});

app.get("/register", (req, res) => {
//get for register page
  console.log(req.session)
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }

  const templateVars = {
    user: undefined
  };

  res.render("urls_register", templateVars);

});

app.get("/login", (req, res) => {
//get for login page
  const templateVars = {
    user: users[req.session.user_id]
  };

  res.render("urls_login", templateVars);

});

app.get("/urls/new", (req, res) => {
//get for new url page
  const user = req.session.user_id;
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (user) {

    res.render("urls_new", templateVars);
  } else {

    res.redirect("/login");
  }
});

app.get("/u/:shortURL", (req, res) => {

  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
//gets the show page with short url
  const foundURL = urlDatabase[req.params.shortURL];
  if (!foundURL) {
    return res.redirect("/urls");
  }
  const longURL = foundURL["longURL"];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  //editing on urls page
  const user = req.session.user_id;

  if (user) {

    let longReq = req.body.longURL;
    let message = generateRandomString();
    urlDatabase[message] = {
      ["longURL"]: longReq,
      userID: user
    }
    res.redirect("/urls");
  } else {

    return res.status(400).send("You need to login or register")
  }
});

function generateRandomString(bod) {
//function to generate random numbers
  return Math.random().toString(20).substr(2, 6);
}

app.post("/urls/:shortURL/delete", (req, res) => {
//deletes the url and then returns to url main page without the deleted website
  const templateVars = req.params.shortURL;
  delete urlDatabase[templateVars];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/submit", (req, res) => {

  const user = req.session.user_id;
  if (user) {

    const newLongUrl = req.body.newUrl;
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL]["longURL"] = newLongUrl;
    res.redirect("/urls");
  } else {

    res.redirect("/login");
  }

});

app.post("/register", (req, res) => {
//user makes a new userid and password
  let newEmail = req.body.email;
  let newPass = req.body.password;

  if (newEmail === "" && newPass === "") {

    res.sendStatus(404);
  } else if (getUserByEmail(users, newEmail)) {
    return res.status(400).send("User already exists");

  } else {

    const hashedPassword = bcrypt.hashSync(newPass, 10);
    const newID = generateRandomString();
    console.log(req.session);
    req.session.user_id = newID;
    console.log(req.session);
    users[newID] = {
      id: newID,
      email: newEmail,
      password: hashedPassword
    };

    res.redirect("/urls")
  }
});

const urlsForUser = function (urlsDB, id) {
//function for getting the ids
  const filterUrls = {};
  for (let shortURL in urlsDB) {
    const urlObj = urlsDB[shortURL];
    if (urlObj.userID === id) {
      filterUrls[shortURL] = urlObj;
    }
  }
  return filterUrls;
}

app.post("/login", (req, res) => {
//login page where the user can login with already registered username and password
  const {
    email,
    password
  } = req.body;

  if (email === "" || password === "") {

    return res.status(400).send("No email and/or Password!");
  }

  const userFound = getUserByEmail(users, email);
  const dhashed = bcrypt.compareSync(password, userFound.password);

  if (!userFound) {

    return res.status(403).send("User not found");
  }

  if (!dhashed) {

    return res.status(401).send("Password Incorrect!");

  }
  
  req.session.user_id = userFound.id;
  res.redirect("/urls");

});

app.post("/logout", (req, res) => {
//clears cookies and logsout the user
  console.log(users);
  req.session = null;
  res.redirect("/urls")

});

app.listen(PORT, () => {

  console.log(`Example app listening on port ${PORT}!`);

});