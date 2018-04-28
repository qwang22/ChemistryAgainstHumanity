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

        // router.post("/login", (req: Request, res: Response, next: NextFunction) => {
        //     new IndexRoute().login(req, res, next);
        // });
        
        //add admin page to import reactions and get depictions
        router.post("/admin", (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().admin(req, res, next);
        });

        //if accessed through GET request or directly by URL
        router.get("/admin", (req: Request, res: Response, next: NextFunction) => {
            res.send("You either do not have permission to access this page, or you are trying to access it directly.  If you are an admin, please authenticate and try again.")
        })

        // handles ajax request to get depictions
        router.post("/getImage", (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().getImage(req, res, next);
        });
        
        //add game page route POST --> in class mode with leaderboard after user authentication
        router.post("/game", (req: Request, res: Response, next: NextFunction) => {
            //new IndexRoute().game(req, res, next);
            new IndexRoute().login(req, res, next);
        });

        //GET --> practice mode, no leaderboard effect
        router.get("/game", (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().game(req, res, next);
        });

        //insert reaction and cards to db
	    router.post("/addReaction", (req: Request, res: Response, next: NextFunction) => {
	        new IndexRoute().addReaction(req, res, next);
	    });
    
        //return 'deck' of cards from db for game use
	    router.post("/generateCards", (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().generateCards(req, res, next);
        });

        //return set of all reactions in db for solution checking
        router.post("/generateSolutions", (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().generateSolutions(req, res, next);
        });

        //export current reactions from db to csv file for download
        router.get("/exportReactions", (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().exportReactions(req, res, next);
        });

        //export users and points from db to csv file for download
        router.get("/exportPoints", (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().exportPoints(req, res, next);
        });

        //reset all user points to 0
        router.get("/resetPoints", (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().resetPoints(req, res, next);
        });

        router.get("/getLeaderboard", (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().getLeaderboard(req, res, next);
        });

        router.post("/updateLeaderboard", (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().updateLeaderboard(req, res, next);
        })

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

        let options: any = {};

        if (req.body.status === "pass") {
           options.status = "pass";
           options.user = req.body.onyen;

           var isAdmin = false; 
            if (req.body.onyen == "qianqian" 
                || req.body.onyen == "youngjt" 
                || req.body.onyen == "renfro18" 
                || req.body.onyen == "csv17"
                || req.body.onyen == "cmoy"
                || req.body.onyen == "pozefsky") {
                    isAdmin = true;
                    options.isAdmin = true;
           } else {
               options.isAdmin = false;
           }
           
           var host = "mongodb://localhost:27017";
           mongo.MongoClient.connect(host, function(err, db) {
               if (err) throw err;
               var dbo = db.db("chemistryagainsthumanity");

               var user_entry = {
                   onyen: req.body.onyen,
                   points: 0,
                   isAdmin: isAdmin
               }
                //insert if user not yet in table
                dbo.collection("users").update({"onyen": req.body.onyen}, {"$setOnInsert": user_entry}, {upsert: true}, function(err, res) {
                    if (err) throw err;
                    //console.log("1 user added/updated");
                });
           });
        } else {
            options.status = "fail";
        }

        // render template
        //this.render(req, res, "login", options);
        this.render(req, res, "game", options);
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
                var path = 'dist/public/reactions.csv';
                var data = new Array();
                data.push([" "]); //this is needed to properly align data, not sure why
                data.push(["id", "reactant", "reagent", "product\n"]);
                for (var i=0;i<docs.length;i++) {
                    data.push([docs[i]['_id'], docs[i]['reactant'], docs[i]['reagent'], docs[i]['product'] + '\n']);
                }
                fs.writeFile(path, data, function(err, res2) {
                    if (err) throw err;
                    res.download(path);
                });
            })
        })
    }

    public exportPoints(req: Request, res: Response, next: NextFunction) {
        mongo.MongoClient.connect("mongodb://localhost:27017", function(err, db) {
            if (err) throw err;
            var dbo = db.db("chemistryagainsthumanity");
            dbo.collection("users").find({}).toArray(function(err, docs) {
                var path = 'dist/public/points.csv';
                var data = new Array();
                data.push([" "]); //this is needed to properly align data, not sure why
                data.push(["onyen", "points\n"]);
                for (var i=0;i<docs.length;i++) {
                    data.push([docs[i]['onyen'], docs[i]['points'] + '\n']);
                }
                fs.writeFile(path, data, function(err, res2) {
                    if (err) throw err;
                    res.download(path);
                });
            });
        });
    }

    public resetPoints(req: Request, res: Response, next: NextFunction) {
        mongo.MongoClient.connect("mongodb://localhost:27017", function(err, db) {
            if (err) throw err;
            var dbo = db.db("chemistryagainsthumanity");
            dbo.collection("users").updateMany({"points":{"$exists": true}}, {"$set": {"points": 0}}, function(err, res2) {
                if (err) throw err;
                var response = JSON.stringify(res2);
                res.send(response);
            });
        });
    }

    public getLeaderboard(req: Request, res: Response, next: NextFunction) {
        mongo.MongoClient.connect("mongodb://localhost:27017", function(err, db) {
            if (err) throw err;
            var dbo = db.db("chemistryagainsthumanity");
            dbo.collection("users").find({}).sort({"points": -1}).toArray(function(err, res2) {
                if (err) throw err;
                var response = JSON.stringify(res2);
                res.send(response);
            });
        });
    }

    public updateLeaderboard(req: Request, res: Response, next: NextFunction) {
        console.log(req.body);
        var onyenToUpdate = req.body['onyen'];
        var points = parseFloat(req.body['points']);
        mongo.MongoClient.connect("mongodb://localhost:27017", function(err, db) {
            if (err) throw err;
            var dbo = db.db("chemistryagainsthumanity");
            dbo.collection("users").update({"onyen": onyenToUpdate}, {"$set": {"points": points}}, function(err, res2) {
                if (err) throw err;
                var response = JSON.stringify(res2);
                res.send(response);
            });
        });
    }
}