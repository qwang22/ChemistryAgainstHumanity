"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const route_1 = require("./route");
const https = require("https");
const mongo = require("mongodb");
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
        var src_urls = Object.keys(req.body).map(function (key) {
            var chem = req.body[key];
            var encoded = encodeURIComponent(chem);
            var imgURL = "http://opsin.ch.cam.ac.uk/opsin/" + encoded + ".png";
            json_obj[key] = imgURL;
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
        mongo.MongoClient.connect("mongodb://localhost:27017", function (err, db) {
            if (err)
                throw err;
            var dbo = db.db("chemistryagainsthumanity");
            dbo.collection("cards").insertOne(req.body.card1, function (err, res) {
                if (err)
                    throw err;
                console.log("1 document inserted");
            });
        });
    }
}
exports.IndexRoute = IndexRoute;
