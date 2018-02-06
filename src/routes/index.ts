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
}