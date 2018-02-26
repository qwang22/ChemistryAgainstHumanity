import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";
const https = require("https");


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
        } else {
            options.status = "fail";
        }

        // render template
        this.render(req, res, "login", options);
    }
    
    public admin(req: Request, res: Response, next: NextFunction) {

        let options: Object = {
            "title" : "Admin page to input chemical reactions"
        }

        this.render(req, res, "admin", options);
    }

    public getImage(req: Request, res: Response, next: NextFunction) {

        // req.body = {"chem1":chemName, "chem2": chemName, "chem3": chemName} 
        
        var json_obj = {};

        // loop that sets json_obj = {chem1: img_url1, chem2: img_url2, chem3: img_url3}
        var src_urls = Object.keys(req.body).map(function(key) {
            var chem = req.body[key];
            var encoded = encodeURIComponent(chem);
            var imgURL = "http://opsin.ch.cam.ac.uk/opsin/" + encoded + ".png"
            json_obj[key] = imgURL;
        });

        var response = JSON.stringify(json_obj);

        console.log("response = " + response);

        res.send(response);
    }
    
    public game(req: Request, res: Response, next: NextFunction) {
        
        let options: any = {};
        
        this.render(req, res, "game", options);
    }
}
