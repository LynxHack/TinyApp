//This program enables express based GET and POST handling
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');


let urlDatabase = {
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

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

function emailcheck(email){
  var matches = false;
  for(user in users){
    console.log(users[user]["email"], email)
    if(users[user]["email"] === email){matches = true;}
  }
  console.log("email matched: " + matches);
  return matches;
}



//////////////////////////
//Main Url POST Handlers//
//////////////////////////

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (to be replaced)
});

app.post("/login", (req, res) => {
  console.log("Login info incoming...");
  //check if username is entered
  if(req.body.username){
    res.cookie("username", req.body.username);
  }
  console.log("Cookie value: ");
  res.redirect("/login")
});

app.post("/logout", (req, res) => {
  res.clearCookie("username").redirect("/urls");
});

app.post("/urls/new", (req, res) => {
  urlDatabase[generateRandomString()] = req.body.URL;
  console.log(req.body.URL);
  console.log(req.body);
  res.redirect("/urls");
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

app.post("/register", (req, res) =>{
  if(!req.body.password || !req.body.email){
    console.log("user did not input a field in the registration form");
    res.status(400).send("Failed to enter a field in registration form");
  }
  else if(emailcheck(req.body.email)){
    console.log(!emailcheck(req.body.email));
    res.status(400).send("Email addres already exists!");
  }
  var newid = generateRandomString();
  users[newid] = {id: newid, email: req.body.email, password: req.body.password};
  console.log("updated user list: ", users);
  res.cookie["user_id"] = newid;
  res.redirect("/urls");
});






/////////////////////////
//Main Url GET Handlers//
/////////////////////////

app.get("/register", (req, res) =>{
  res.render("registration");
});

app.get("/login", (req, res) => {
  const templateVars = {username: req.cookies["username"], users: users};
  console.log(templateVars["username"]);
  res.render("login", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = {username: req.cookies["username"], urlDatabase: urlDatabase};
  console.log(req.cookies['username']);
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {username: req.cookies["username"], shortURL: req.params.id, urlDatabase: urlDatabase };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const templateVars = {username: req.cookies["username"]};
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL, templateVars);
});

app.get("/urls/new" , (req, res) => {
  const templateVars = {username: req.cookies["username"]}; 
  res.render("urls_new", templateVars);
});


//Port Listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Generates a random 6 character alphanumeric string
function generateRandomString() {
	return Math.random().toString(36).substr(2,6);	
}

