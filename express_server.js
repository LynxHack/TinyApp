//This program enables express based GET and POST handling
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
//Main url Post Handlers
app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (to be replaced)
});


app.post("/login", (req, res) => {
  //var username = req.body.username;
  console.log("Login info received...");
	res.cookie = {password: req.body.password, username: req.body.username}
	res.redirect("/urls/" + id);
});


app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
	console.log("Updating long url of short url id: " + id);
	urlDatabase[id] = req.body.URL;
	res.redirect("/urls/" + id);
});

app.post("/urls/:id/delete", (req, res) => {
	console.log("running post urls id delete for" + req.params.id);
	delete urlDatabase[req.params.id];
	res.redirect("/urls");
});

//Main Url GET Handlers
app.get("/login", (req, res) => {
  const templateVars = {};
  res.render("login", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { urlDatabase: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urlDatabase: urlDatabase };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/new" , (req, res) => { 
  res.render("urls_new");
});


//Port Listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Generates a random 6 character alphanumeric string
function generateRandomString() {
	return Math.random().toString(36).substr(2,6);	
}

