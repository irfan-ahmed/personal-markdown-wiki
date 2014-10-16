/* 
 * The MIT License
 *
 * Copyright 2014 Irfan Ahmed.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var express = require("express");
var favicon = require('serve-favicon');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var path = require("path");
var settings = require("./modules/settings");
var topics = require("./modules/topics");

var app = new express();
app.set("port", process.env.PORT || 9090);
//app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/data/settings", function (req, res) {
  settings.get().then(function (data) {
    res.json(data);
  }, function (error) {
    res.send(500, "Error in getting settings : ", error);
  });
});

app.post("/data/settings", function (req, res) {
  var data = req.body;
  settings.set(data).then(function () {
    res.json({success: true});
  }, function (e) {
    res.send(500, {error: e});
  });
});

app.post("/data/create/topic", function (req, res) {
  var topicInfo = req.body;
  settings.createTopic(topicInfo).then(function () {
    res.json(topicInfo);
  }, function (e) {
    res.status(500).send({error: e});
  });
});

// get sections for a topic
app.get("/data/topic/:id", function (req, res) {
  var topicID = req.param("id");
  if (!topicID) {
    res.status(500).send({error: "Missing topic ID"});
    return;
  }
  topics.list(topicID).then(function (sections) {
    res.json(sections);
  }, function (e) {
    res.status(500).send({error: e});
  });
});

// save sections for a topic
app.post("/data/topic/:id", function (req, res) {
  var topicID = req.param("id");
  var section = req.body;
  topics.save(topicID, section).then(function () {
    res.send({success: true});
  }, function (e) {
    res.status(500).send({error: e});
  });
});

// delete a section from a topic
app.post("/data/delete/section", function (req, res) {
  var params = req.body;
  topics.deleteSection(params).then(function () {
    res.json({success: true, data: params});
  }, function (e) {
    res.status(500).send({error: e});
  });
});

var server = app.listen(9090, function () {
  console.log("Server started... listening on %d", server.address().port);
});

