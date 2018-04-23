import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";
const https = require("https");
import mongo = require("mongodb");
const fs = require('fs');

/**
 * / route
 *
 * @class User
 */
export class IndexRoute extends BaseRoute {

    /**
     * Create the routes.
     *
     * @class IndexRoute
     * @method create
     * @static
     */


    public static create(router: Router) {
        // log
        console.log("[IndexRoute::create] Creating index route.");

        // add home page route
        router.get("/", (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().index(req, res, next);
        });

        // we will post to the root if we have a login fail
        router.post("/", (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().index(req, res, next);
        });

        router.post("/login", (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().login(req, res, next);
        });
        
        //add admin page to import reactions and get depictions
        router.get("/admin", (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().admin(req, res, next);
        });

        // handles ajax request to get depictions
        router.post("/getImage", (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().getImage(req, res, next);
        });
        
        router.get("/game", (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().game(req, res, next);
        });

	    router.post("/addReaction", (req: Request, res: Response, next: NextFunction) => {
	        new IndexRoute().addReaction(req, res, next);
	    });
	
	    router.post("/generateCards", (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().generateCards(req, res, next);
        });

        router.post("/generateSolutions", (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().generateSolutions(req, res, next);
        });

        router.post("/exportReactions", (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().exportReactions(req, res, next);
        });

    }

    
    /**
     * Constructor
     *
     * @class IndexRoute
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * The home page route.
     *
     * @class IndexRoute
     * @method index
     * @param req {Request} The express Request object.
     * @param res {Response} The express Response object.
     * @next {NextFunction} Execute the next method.
     */
    public index(req: Request, res: Response, next: NextFunction) {
        // set custom title
        this.title = "Home | Chemistry Against Humanity";

        // set options
        let options: Object = {
            "message": "Welcome to Chemistry Against Humanity"
        };

        // render template
        this.render(req, res, "index", options);
    }


    public login(req: Request, res: Response, next: NextFunction) {
        // set custom title
        this.title = "Login";
        // console.log(req);

        let options: any = {};

        if (req.body.status === "pass") {
           options.status = "pass";
           
           var host = "mongodb://localhost:27017";
           mongo.MongoClient.connect(host, function(err, db) {
               if (err) throw err;
               var dbo = db.db("chemistryagainsthumanity");

               var user_entry = {
                   onyen: req.body.onyen,
                   fname: 'fname',
                   lname: 'lname',
                   points: 0,
                   isAdmin: false
               }

               dbo.collection("users").insertOne(user_entry, function(err, res) {
                   if (err) throw err;
                   console.log("1 user added");
               });
           });
        } else {
            options.status = "fail";
        }

        // render template
        this.render(req, res, "login", options);
    }
    
    public admin(req: Request, res: Response, next: NextFunction) {

        let options: Object = {
            "title" : "Reaction Dashboard"
        }

        this.render(req, res, "admin", options);
    }

    public getImage(req: Request, res: Response, next: NextFunction) {

        // req.body = {reactant: {name: name, depiction: img_src}, reagent: {...}, product: {...}}
        var json_obj = {};

        Object.keys(req.body).map(function(key) {
            var chem = req.body[key]['name'];
            var img_src;
            //if admin did not upload image depiction, we will pull depiction from api
            if (typeof req.body[key]['depiction'] == 'undefined') {
                var encoded = encodeURIComponent(chem);
                img_src = "http://opsin.ch.cam.ac.uk/opsin/" + encoded + ".png"
            } else {
                img_src = req.body[key]['depiction']
            }
            json_obj[key] = {
                name: chem,
                depiction: img_src
            }
        });

        var response = JSON.stringify(json_obj);

        console.log("response = " + response);

        res.send(response);
    }
    
    public game(req: Request, res: Response, next: NextFunction) {
        
        let options: any = {};
        
        this.render(req, res, "game", options);
    }

    public addReaction(req: Request, res: Response, next: NextFunction) {
        console.log(req.body)

        var host = "mongodb://localhost:27017";
        mongo.MongoClient.connect(host, function(err, db) {
            if (err) throw err;
            var dbo = db.db("chemistryagainsthumanity");

            var reaction_entry = {
               reactant: req.body.reactant.back,
               reagent: req.body.reagent.back,
               product: req.body.product.back,
               active: true
            }

            //console.log("reaction_entry = " + JSON.stringify(reaction_entry))

            dbo.collection("reactions").insertOne(reaction_entry, function(err, res) {
               if (err) throw err;
               console.log('1 reaction inserted into reactions table');
            });

            var cards_entry = new Array();
            Object.keys(req.body).map(function(key) {
                var card_obj = {
                    front: req.body[key]['front'],
                    back: req.body[key]['back']
                }
                cards_entry.push(card_obj);
            });
            //console.log("cards_entry = " + cards_entry);

            dbo.collection("cards").insertMany(cards_entry, function(err, res) {
                if (err) throw err;
                console.log('3 cards inserted into cards table');
            });
            
        });
        var response = {status: "done"}
        res.send(response);
    }
	
    public generateCards(req: Request, res: Response, next: NextFunction) {
        mongo.MongoClient.connect("mongodb://localhost:27017", function(err, db) {
            if (err) throw err;
            var dbo = db.db("chemistryagainsthumanity");

            dbo.collection("cards").find({}).toArray(function(err, res2) {
               if (err) throw err;
               //console.log(res2);
               var response = JSON.stringify(res2);
               res.send(response);
            });
        });
    }

    public generateSolutions(req: Request, res: Response, next: NextFunction) {
        mongo.MongoClient.connect("mongodb://localhost:27017", function(err, db) {
            if (err) throw err;
            var dbo = db.db("chemistryagainsthumanity");

            dbo.collection("reactions").find({active:true}, {_id: 0, reactant: 1, "reagent": 1, "product": 1}).toArray(function(err, res2) {
                if (err) throw err;
                console.log(res2);
                var response = JSON.stringify(res2);
                res.send(response);
            });
        });
    }

    public exportReactions(req: Request, res: Response, next: NextFunction) {
        mongo.MongoClient.connect("mongodb://localhost:27017", function(err, db) {
            if (err) throw err;
            var dbo = db.db("chemistryagainsthumanity");
            dbo.collection("reactions").find({}).toArray(function(err, docs) {
                var fields = ['_id', 'reactant', 'reagent', 'product', 'active'];
                var path = 'dist/public/reactions.csv';
                fs.writeFile(path, JSON.stringify(docs), function(err, data) {
                    if (err) throw err;
                    res.download(path);
                });
            })
        })
    }
}
