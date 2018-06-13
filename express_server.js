//This program enables express based GET and POST handling
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

let urlDatabase = {
  "b2xVn2": {link:"http://www.lighthouselabs.ca",
            userid:"userRandomID"},
  "9sm5xK": {link: "http://www.google.com",
            userid:"user2RandomID"}
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

//Auxiliary functions

//Parse UrlDataBase to Create User Specific url List
//return format {id: link, id: link ...}
function makeuserurls(userid){
  let urllist = {};
  console.log("user info", userid);
  for(url in urlDatabase){
    console.log(urlDatabase[url]["userid"], userid)
    if(urlDatabase[url]["userid"] === userid){
      urllist[url] = urlDatabase[url]["link"];
    }
  }
  console.log(urllist);
  return urllist;
}

//Return master url list in format {id: link, id: link}
function masterurllist(){
  let urllist = {};
  console.log("user info", userid);
  for(url in urlDatabase){
      urllist[url] = urlDatabase[url]["link"];
  }
  console.log(urllist);
  return urllist;
}

//Check if email exists in users
function emailcheck(email){
  let matches = false;
  for(user in users){
    if(users[user]["email"] === email){matches = true; break;}
  }
  return matches;
}

//Check if login is valid
function logincheck(email, password){
  let matches = false;
  for(user in users){
    if(users[user]["email"] === email && users[user]["password"] === password){
      matches = true;
      break;
    }
  }
  return matches? user:false;
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
  //check if username is entered or login is correct
  if(!req.body.email || !req.body.password){
    res.status(403).send("Please enter info in all boxes");
  }
  const loginresult = logincheck(req.body.email, req.body.password);
  if(!loginresult){
    res.status(403).send("Incorrect login credentials")
  }
  res.cookie("user_id", loginresult)
  //res.cookie("username", req.body.username);
  console.log("Cookie value: " + loginresult);
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id").redirect("/urls");
});


app.post("/register", (req, res) =>{
  if(!req.body.password || !req.body.email){
    console.log("user did not input a field in the registration form");
    res.status(400).send("Failed to enter a field in registration form");
  }
  else if(emailcheck(req.body.email)){
    res.status(400).send("Email address already exists!");
  }
  var newid = generateRandomString();
  users[newid] = {id: newid, email: req.body.email, password: req.body.password};
  console.log("updated user list: ", users);
  //res.cookie["user_id"] = newid;
  res.redirect("/urls");
});

app.post("/urls/new", (req, res) => {
  if(!req.cookies["user_id"]){
    res.redirect("/login");
  }
  console.log("new url entered: " + req.body.longURL);
  urlDatabase[generateRandomString()] = {link: req.body.longURL, userid: req.cookies["user_id"]};
  console.log(req.body.URL);
  console.log(req.body);
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
	console.log("Updating long url of short url id: " + id);
  urlDatabase[id] = req.body.URL;
  const templateVars = {username: req.cookies["user_id"], users: users};
	res.render("/urls/" + id, templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
	console.log("running post urls id delete for" + req.params.id);
	delete urlDatabase[req.params.id];
	res.redirect("/urls");
});



/////////////////////////
//Main Url GET Handlers//
/////////////////////////

app.get("/register", (req, res) =>{
  res.render("registration");
});

app.get("/login", (req, res) => {
  const templateVars = {username: req.cookies["user_id"], users: users};
  res.render("login", templateVars);
});

app.get("/urls", (req, res) => {
  console.log(!req.cookies["user_id"]);
  if(!req.cookies["user_id"]){
    res.status(300); //not logged in, redirect to login page
    res.redirect("/login");
  }
  let templateVars = {
     username: req.cookies["user_id"], 
  urlDatabase: makeuserurls(req.cookies["user_id"])
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new" , (req, res) => {
  if(!req.cookies["user_id"]){
    res.status(300); //not logged in, redirect to login page
    res.redirect("/login");
  }
  const templateVars = {username: req.cookies["user_id"]}; 
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if(!(req.cookies["user_id"] === urlDatabase[req.params.id].userid)){
    res.status(400);
    res.redirect("/login");
  }
  let templateVars = {username: req.cookies["user_id"], shortURL: req.params.id, urlDatabase: makeuserurls(req.cookies["user_id"])};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const templateVars = {username: req.cookies["user_id"]};
  let longURL = urlDatabase[req.params.shortURL].link;
  console.log("Redirecting to: " + longURL);
  res.redirect(longURL);
});

//Port Listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Generates a random 6 character alphanumeric string
function generateRandomString() {
	return Math.random().toString(36).substr(2,6);	
}

