var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('app',["require", "exports", "aurelia-router", "aurelia-path", "aurelia-templating", "aurelia-event-aggregator", "aurelia-framework", "aurelia-metadata"], function (require, exports, aurelia_router_1, aurelia_path_1, aurelia_templating_1, aurelia_event_aggregator_1, aurelia_framework_1, aurelia_metadata_1) {
    "use strict";
    var App = (function () {
        function App(compositionEngine, eventAggregator) {
            this.compositionEngine = compositionEngine;
            this.eventAggregator = eventAggregator;
        }
        App.prototype.configureRouter = function (config, router) {
            config.title = 'Child Route Menu Example';
            config.map([
                { route: ['', 'home'], name: 'home', moduleId: 'routes/home/index', nav: true, title: 'Home' },
                { route: 'cats', name: 'cats', moduleId: 'routes/cats/index', nav: true, title: 'Cats' },
                { route: 'dogs', name: 'dogs', moduleId: 'routes/dogs/index', nav: true, title: 'Dogs' },
                { route: 'birds', name: 'birds', moduleId: 'routes/birds/index', nav: true, title: 'Birds' }
            ]);
            this.router = router;
        };
        App.prototype.mapNavigation = function (router, config) {
            var _this = this;
            var promises = [];
            var c = config ? config : { route: null };
            router.navigation.forEach(function (nav) {
                if (c.route !== nav.config.route) {
                    promises.push(_this.mapNavigationItem(nav, router));
                }
                else {
                    promises.push(Promise.resolve(nav));
                }
            });
            return Promise.all(promises);
        };
        App.prototype.mapNavigationItem = function (nav, router) {
            var _this = this;
            var config = nav.config;
            var navModel = Object.assign({}, nav);
            if (config.moduleId) {
                var childContainer_1 = router.container.createChild();
                var instruction = {
                    viewModel: aurelia_path_1.relativeToFile(config.moduleId, aurelia_metadata_1.Origin.get(router.container.viewModel.constructor).moduleId),
                    childContainer: childContainer_1,
                    view: config.view || config.viewStrategy,
                };
                return this.compositionEngine.ensureViewModel(instruction)
                    .then(function (context) {
                    if ('configureRouter' in context.viewModel) {
                        var childRouter = new aurelia_router_1.Router(childContainer_1, router.history);
                        var childConfig = new aurelia_router_1.RouterConfiguration();
                        context.viewModel.configureRouter(childConfig, childRouter);
                        childConfig.exportToRouter(childRouter);
                        childRouter.navigation.forEach(function (nav) {
                            nav.href = navModel.href + "/" + (nav.config.href ? nav.config.href : nav.config.route);
                        });
                        return _this.mapNavigation(childRouter, config)
                            .then(function (r) { return navModel.navigation = r; })
                            .then(function () { return navModel; });
                    }
                    return navModel;
                });
            }
            return Promise.resolve(navModel);
        };
        App.prototype.updateNavModels = function (navModels, instruction, instructionDepth, resetDepth) {
            var _this = this;
            navModels.forEach(function (navModel) {
                if (resetDepth >= instructionDepth)
                    navModel.isActive = false;
                if (navModel.href === instruction.config.navModel.href)
                    navModel.isActive = true;
                if (navModel.navigation) {
                    _this.updateNavModels(navModel.navigation, instruction, instructionDepth, resetDepth + 1);
                }
            });
        };
        App.prototype.updateNavigationMenu = function (instruction, depth) {
            this.updateNavModels(this.navigationMenu, instruction, depth, 0);
            if ('childNavigationInstruction' in instruction.viewPortInstructions.default) {
                this.updateNavigationMenu(instruction.viewPortInstructions.default.childNavigationInstruction, depth + 1);
            }
        };
        App.prototype.attached = function () {
            var _this = this;
            this.subscriber = this.eventAggregator.subscribe('router:navigation:complete', function (response) { _this.updateNavigationMenu(response.instruction, 0); });
            return this.mapNavigation(this.router)
                .then(function (navModel) { return _this.navigationMenu = navModel; })
                .then(function () { return _this.updateNavigationMenu(_this.router.currentInstruction, 0); });
        };
        App.prototype.detached = function () {
            this.subscriber.dispose();
        };
        return App;
    }());
    App = __decorate([
        aurelia_framework_1.autoinject(),
        __metadata("design:paramtypes", [aurelia_templating_1.CompositionEngine, aurelia_event_aggregator_1.EventAggregator])
    ], App);
    exports.App = App;
});

define('environment',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        debug: true,
        testing: true
    };
});

define('main',["require", "exports", "./environment"], function (require, exports, environment_1) {
    "use strict";
    Promise.config({
        warnings: {
            wForgottenReturn: false
        }
    });
    function configure(aurelia) {
        aurelia.use
            .standardConfiguration()
            .feature('resources');
        if (environment_1.default.debug) {
            aurelia.use.developmentLogging();
        }
        if (environment_1.default.testing) {
            aurelia.use.plugin('aurelia-testing');
        }
        aurelia.start().then(function () { return aurelia.setRoot(); });
    }
    exports.configure = configure;
});

define('resources/index',["require", "exports"], function (require, exports) {
    "use strict";
    function configure(config) {
    }
    exports.configure = configure;
});

define('routes/birds/index',["require", "exports"], function (require, exports) {
    "use strict";
    var Birds = (function () {
        function Birds() {
        }
        Birds.prototype.configureRouter = function (config, router) {
            config.title = "Birds";
            config.map([
                { route: ['', 'care'], name: 'care', moduleId: './routes/care/index', nav: true, title: 'Caring' },
                { route: 'breeds', name: 'breeds', moduleId: './routes/breeds/index', nav: true, title: 'Breeds' },
                { route: 'toys', name: 'toys', moduleId: './routes/toys/index', nav: true, title: 'Toys' },
            ]);
        };
        return Birds;
    }());
    exports.Birds = Birds;
});

define('routes/cats/index',["require", "exports"], function (require, exports) {
    "use strict";
    var Cats = (function () {
        function Cats() {
        }
        Cats.prototype.configureRouter = function (config, router) {
            config.title = "Cats";
            config.map([
                { route: ['', 'care'], name: 'care', moduleId: './routes/care/index', nav: true, title: 'Caring' },
                { route: 'breeds', name: 'breeds', moduleId: './routes/breeds/index', nav: true, title: 'Breeds' },
                { route: 'toys', name: 'toys', moduleId: './routes/toys/index', nav: true, title: 'Toys' },
            ]);
        };
        return Cats;
    }());
    exports.Cats = Cats;
});

define('routes/dogs/index',["require", "exports"], function (require, exports) {
    "use strict";
    var Dogs = (function () {
        function Dogs() {
        }
        Dogs.prototype.configureRouter = function (config, router) {
            config.title = "Dogs";
            config.map([
                { route: ['', 'care'], name: 'care', moduleId: './routes/care/index', nav: true, title: 'Caring' },
                { route: 'breeds', name: 'breeds', moduleId: './routes/breeds/index', nav: true, title: 'Breeds' },
                { route: 'toys', name: 'toys', moduleId: './routes/toys/index', nav: true, title: 'Toys' },
            ]);
        };
        return Dogs;
    }());
    exports.Dogs = Dogs;
});

define('routes/home/index',["require", "exports"], function (require, exports) {
    "use strict";
    var Home = (function () {
        function Home() {
        }
        return Home;
    }());
    exports.Home = Home;
});

define('routes/birds/routes/breeds/index',["require", "exports"], function (require, exports) {
    "use strict";
    var Breeds = (function () {
        function Breeds() {
        }
        return Breeds;
    }());
    exports.Breeds = Breeds;
});

define('routes/birds/routes/care/index',["require", "exports"], function (require, exports) {
    "use strict";
    var Care = (function () {
        function Care() {
        }
        return Care;
    }());
    exports.Care = Care;
});

define('routes/birds/routes/toys/index',["require", "exports"], function (require, exports) {
    "use strict";
    var Toys = (function () {
        function Toys() {
        }
        return Toys;
    }());
    exports.Toys = Toys;
});

define('routes/cats/routes/breeds/index',["require", "exports"], function (require, exports) {
    "use strict";
    var Breeds = (function () {
        function Breeds() {
        }
        return Breeds;
    }());
    exports.Breeds = Breeds;
});

define('routes/cats/routes/care/index',["require", "exports"], function (require, exports) {
    "use strict";
    var Care = (function () {
        function Care() {
        }
        return Care;
    }());
    exports.Care = Care;
});

define('routes/cats/routes/toys/index',["require", "exports"], function (require, exports) {
    "use strict";
    var Toys = (function () {
        function Toys() {
        }
        return Toys;
    }());
    exports.Toys = Toys;
});

define('routes/dogs/routes/breeds/index',["require", "exports"], function (require, exports) {
    "use strict";
    var Breeds = (function () {
        function Breeds() {
        }
        return Breeds;
    }());
    exports.Breeds = Breeds;
});

define('routes/dogs/routes/care/index',["require", "exports"], function (require, exports) {
    "use strict";
    var Care = (function () {
        function Care() {
        }
        return Care;
    }());
    exports.Care = Care;
});

define('routes/dogs/routes/toys/index',["require", "exports"], function (require, exports) {
    "use strict";
    var Toys = (function () {
        function Toys() {
        }
        return Toys;
    }());
    exports.Toys = Toys;
});

define('text!app.html', ['module'], function(module) { module.exports = "<template><require from=./resources/elements/nav-menu.html></require><style>li>a.active{font-weight:700}</style><nav-menu navigation.bind=navigationMenu></nav-menu><h1>Aurelia Menu with Child Routes example</h1><div><router-view></router-view></div></template>"; });
define('text!resources/elements/nav-menu.html', ['module'], function(module) { module.exports = "<template bindable=navigation><ul><li repeat.for=\"row of navigation\"><a href.bind=row.href class=\"${row.isActive ? 'active' : ''}\">${row.title}</a><nav-menu if.bind=row.navigation navigation.bind=row.navigation></nav-menu></li></ul></template>"; });
define('text!routes/birds/index.html', ['module'], function(module) { module.exports = "<template><h2>Birds Page</h2><router-view></router-view></template>"; });
define('text!routes/cats/index.html', ['module'], function(module) { module.exports = "<template><h2>Cats Page</h2><router-view></router-view></template>"; });
define('text!routes/dogs/index.html', ['module'], function(module) { module.exports = "<template><h2>Dogs Page</h2><router-view></router-view></template>"; });
define('text!routes/home/index.html', ['module'], function(module) { module.exports = "<template><h1>Home</h1></template>"; });
define('text!routes/birds/routes/breeds/index.html', ['module'], function(module) { module.exports = "<template><h3>Breeds</h3></template>"; });
define('text!routes/birds/routes/care/index.html', ['module'], function(module) { module.exports = "<template><h3>Care</h3></template>"; });
define('text!routes/birds/routes/toys/index.html', ['module'], function(module) { module.exports = "<template><h3>Toys</h3></template>"; });
define('text!routes/cats/routes/breeds/index.html', ['module'], function(module) { module.exports = "<template><h3>Breeds</h3></template>"; });
define('text!routes/cats/routes/care/index.html', ['module'], function(module) { module.exports = "<template><h3>Care</h3></template>"; });
define('text!routes/cats/routes/toys/index.html', ['module'], function(module) { module.exports = "<template><h3>Toys</h3></template>"; });
define('text!routes/dogs/routes/breeds/index.html', ['module'], function(module) { module.exports = "<template><h3>Breeds</h3></template>"; });
define('text!routes/dogs/routes/care/index.html', ['module'], function(module) { module.exports = "<template><h3>Care</h3></template>"; });
define('text!routes/dogs/routes/toys/index.html', ['module'], function(module) { module.exports = "<template><h3>Toys</h3></template>"; });
//# sourceMappingURL=app-bundle.js.map