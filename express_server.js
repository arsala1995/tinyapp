const express = require("express");
const app = express();
const PORT = 7000; // default port 
const bcrypt = require('bcrypt');
app.set("view engine", "ejs");
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));




const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "2iaj8b" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "2iaj8b" },
  i3BBBB: { longURL: "https://www.goofy.ca", userID: "aJ48lW" }
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
  const user = req.cookies.user_id;
  if(user){

  const filter = urlsForUser(urlDatabase, user);  
  const templateVars = {
    urls: filter,
    user: users[req.cookies.user_id]
  }
  
  res.render("urls_index", templateVars);
  }
  else{
    return res.status(400).send("You need to login or register")
  } 
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
  const user = req.cookies.user_id;
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  if (user) {
    res.render("urls_new", templateVars);
  }
  else {
    res.redirect("/login");
  }
});
app.get("/u/:shortURL", (req, res) => {
 
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
app.get("/urls/:shortURL", (req, res) => {

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase,
    user: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
 
  const user = req.cookies.user_id;


    let longReq = req.body.longURL;

  let message = generateRandomString();
 
  urlDatabase[message] = {
    ["longURL"]: longReq,
    userID: user
  }
  res.redirect("/urls"); 
 
         
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

  const user = req.cookies.user_id;
  if (user) {
    const newLongUrl = req.body.newUrl;

    const shortURL = req.params.shortURL;
  
    urlDatabase[shortURL]["longURL"] = newLongUrl;
   
    res.redirect("/urls");
  }
  else {
    res.redirect("/login");
  }

});

app.post("/register", (req, res) => {
  let newEmail = req.body.email;
  let newPass = req.body.password;
  
  if (newEmail === "" && newPass === "") {
    res.sendStatus(404);
  }

  else if (findEmail(users, newEmail) === true) {
    res.sendStatus(404);

  }

  else {
    const hashedPassword = bcrypt.hashSync(newPass, 10);
  // console.log(hashedPassword);
    const newID = generateRandomString();
    res.cookie("user_id", newID);
    users[newID] = { id: newID, email: newEmail, password: hashedPassword };

    res.redirect("/urls")
  }
});

const urlsForUser = function (urlsDB, id) {
  const filterUrls = {};
  for (let shortURL in urlsDB) {
    const urlObj = urlsDB[shortURL];
    // console.log("urlObj.userID", urlObj.userID, id);
      if (urlObj.userID === id) {
      filterUrls[shortURL] = urlObj;
    }
  }
  return filterUrls;
}

const findEmail = function (usersDB, email) {
  for (let user in usersDB) {

    if (usersDB[user]["email"] === email) {
      return true;
    }

  }
  return false;
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

  const dhashed = bcrypt.compareSync(password, userFound.password);
// console.log(dhashed);
  if (!userFound) {

    return res.status(403).send("User not found");
  }

  if (!dhashed) {

    return res.status(401).send("Password Incorrect!");
  }
// console.log(dhashed);

  res.cookie("user_id", userFound.id);
  res.redirect("/urls");


});

app.post("/logout", (req, res) => {

   console.log(users);
  res.clearCookie("user_id");

  res.redirect("/login")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// Fill out the urls_show.ejs template to display the long URL and its shortened form. Also include a link (href='#') for creating a new url. 
