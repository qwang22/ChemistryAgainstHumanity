"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const route_1 = require("./route");
const https = require("https");
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
}
exports.IndexRoute = IndexRoute;
