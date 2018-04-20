"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const route_1 = require("./route");
const https = require("https");
const mongo = require("mongodb");
const fs = require('fs');
class IndexRoute extends route_1.BaseRoute {
    static create(router) {
        console.log("[IndexRoute::create] Creating index route.");
        router.get("/", (req, res, next) => {
            new IndexRoute().index(req, res, next);
        });
        router.post("/", (req, res, next) => {
            new IndexRoute().index(req, res, next);
        });
        router.post("/login", (req, res, next) => {
            new IndexRoute().login(req, res, next);
        });
        router.get("/admin", (req, res, next) => {
            new IndexRoute().admin(req, res, next);
        });
        router.post("/getImage", (req, res, next) => {
            new IndexRoute().getImage(req, res, next);
        });
        router.get("/game", (req, res, next) => {
            new IndexRoute().game(req, res, next);
        });
        router.post("/addReaction", (req, res, next) => {
            new IndexRoute().addReaction(req, res, next);
        });
        router.post("/generateCards", (req, res, next) => {
            new IndexRoute().generateCards(req, res, next);
        });
        router.post("/generateSolutions", (req, res, next) => {
            new IndexRoute().generateSolutions(req, res, next);
        });
        router.post("/exportReactions", (req, res, next) => {
            new IndexRoute().exportReactions(req, res, next);
        });
    }
    constructor() {
        super();
    }
    index(req, res, next) {
        this.title = "Home | Chemistry Against Humanity";
        let options = {
            "message": "Welcome to Chemistry Against Humanity"
        };
        this.render(req, res, "index", options);
    }
    login(req, res, next) {
        this.title = "Login";
        let options = {};
        if (req.body.status === "pass") {
            options.status = "pass";
            var host = "mongodb://localhost:27017";
            mongo.MongoClient.connect(host, function (err, db) {
                if (err)
                    throw err;
                var dbo = db.db("chemistryagainsthumanity");
                var user_entry = {
                    onyen: req.body.onyen,
                    fname: 'fname',
                    lname: 'lname',
                    points: 0,
                    isAdmin: false
                };
                dbo.collection("users").insertOne(user_entry, function (err, res) {
                    if (err)
                        throw err;
                    console.log("1 user added");
                });
            });
        }
        else {
            options.status = "fail";
        }
        this.render(req, res, "login", options);
    }
    admin(req, res, next) {
        let options = {
            "title": "Reaction Dashboard"
        };
        this.render(req, res, "admin", options);
    }
    getImage(req, res, next) {
        var json_obj = {};
        Object.keys(req.body).map(function (key) {
            var chem = req.body[key]['name'];
            var img_src;
            if (typeof req.body[key]['depiction'] == 'undefined') {
                var encoded = encodeURIComponent(chem);
                img_src = "http://opsin.ch.cam.ac.uk/opsin/" + encoded + ".png";
            }
            else {
                img_src = req.body[key]['depiction'];
            }
            json_obj[key] = {
                name: chem,
                depiction: img_src
            };
        });
        var response = JSON.stringify(json_obj);
        console.log("response = " + response);
        res.send(response);
    }
    game(req, res, next) {
        let options = {};
        this.render(req, res, "game", options);
    }
    addReaction(req, res, next) {
        console.log(req.body);
        var host = "mongodb://localhost:27017";
        mongo.MongoClient.connect(host, function (err, db) {
            if (err)
                throw err;
            var dbo = db.db("chemistryagainsthumanity");
            var reaction_entry = {
                reactant: req.body.reactant.back,
                reagent: req.body.reagent.back,
                product: req.body.product.back,
                active: true
            };
            dbo.collection("reactions_dummy").insertOne(reaction_entry, function (err, res) {
                if (err)
                    throw err;
                console.log('1 reaction inserted into reactions table');
            });
            var cards_entry = new Array();
            Object.keys(req.body).map(function (key) {
                var card_obj = {
                    front: req.body[key]['front'],
                    back: req.body[key]['back']
                };
                cards_entry.push(card_obj);
            });
            dbo.collection("cards_dummy").insertMany(cards_entry, function (err, res) {
                if (err)
                    throw err;
                console.log('3 cards inserted into cards table');
            });
        });
        var response = { status: "done" };
        res.send(response);
    }
    generateCards(req, res, next) {
        mongo.MongoClient.connect("mongodb://localhost:27017", function (err, db) {
            if (err)
                throw err;
            var dbo = db.db("chemistryagainsthumanity");
            dbo.collection("cards_dummy").find({}).toArray(function (err, res2) {
                if (err)
                    throw err;
                var response = JSON.stringify(res2);
                res.send(response);
            });
        });
    }
    generateSolutions(req, res, next) {
        mongo.MongoClient.connect("mongodb://localhost:27017", function (err, db) {
            if (err)
                throw err;
            var dbo = db.db("chemistryagainsthumanity");
            dbo.collection("reactions_dummy").find({ active: true }, { _id: 0, reactant: 1, "reagent": 1, "product": 1 }).toArray(function (err, res2) {
                if (err)
                    throw err;
                console.log(res2);
                var response = JSON.stringify(res2);
                res.send(response);
            });
        });
    }
    exportReactions(req, res, next) {
        mongo.MongoClient.connect("mongodb://localhost:27017", function (err, db) {
            if (err)
                throw err;
            var dbo = db.db("chemistryagainsthumanity");
            dbo.collection("reactions_dummy").find({}).toArray(function (err, docs) {
                var fields = ['_id', 'reactant', 'reagent', 'product', 'active'];
                var path = 'dist/public/reactions.csv';
                fs.writeFile(path, JSON.stringify(docs), function (err, data) {
                    if (err)
                        throw err;
                    res.download(path);
                });
            });
        });
    }
}
exports.IndexRoute = IndexRoute;
