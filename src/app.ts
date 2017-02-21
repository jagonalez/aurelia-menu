import { Router, RouterConfiguration, RouteConfig, NavModel } from 'aurelia-router';
import { relativeToFile } from 'aurelia-path';
import { CompositionEngine, CompositionContext } from 'aurelia-templating';
import { autoinject } from 'aurelia-framework';
import { Origin } from 'aurelia-metadata';

@autoinject()
export class App {
  public router: Router;

  constructor(private compositionEngine: CompositionEngine) { }

  configureRouter(config: RouterConfiguration, router: Router) {
    config.title = 'Child Route Menu Example';
    config.map([
      { route: ['', 'home'], name: 'home',  moduleId: 'routes/home/index',  nav: true, title: 'Home' },
      { route: 'cats',       name: 'cats',  moduleId: 'routes/cats/index',  nav: true, title: 'Cats' },
      { route: 'dogs',       name: 'dogs',  moduleId: 'routes/dogs/index',  nav: true, title: 'Dogs' },
      { route: 'birds',      name: 'birds', moduleId: 'routes/birds/index', nav: true, title: 'Birds' }
    ]);
    this.router = router;
  }

  public mapNavigation(router: Router, config?: RouteConfig) {
    const promises = [];
    const c = config ? config : {route: null};
    router.navigation.forEach( nav => {
      if (c.route !== nav.config.route) {
        promises.push(this.mapNavigationItem(nav, router));
      } else {
        promises.push(Promise.resolve(nav));
      }

    })
    return Promise.all(promises)
  }

  public mapNavigationItem(nav: NavModel, router: Router) {
    const config = <any>nav.config
    const navModel = nav

    if (config.moduleId) {
      const childContainer = router.container.createChild();
      const instruction = {
        viewModel: relativeToFile(config.moduleId, Origin.get(router.container.viewModel.constructor).moduleId),
        childContainer: childContainer,
        view: config.view || config.viewStrategy,
      };
      return this.compositionEngine.ensureViewModel(<any>instruction)
      .then((context: CompositionContext) => {
        if ('configureRouter' in context.viewModel) {
          const childRouter = new Router(childContainer, router.history)
          const childConfig = new RouterConfiguration()

          context.viewModel.configureRouter(childConfig, childRouter)
          childConfig.exportToRouter(childRouter)

          childRouter.navigation.forEach( nav => {
            nav.href = `${navModel.href}/${nav.config.href ? nav.config.href : nav.config.name}`
          })
          return this.mapNavigation(childRouter, config)
            .then(r => navModel.navigation = r)
            .then( () => navModel);
        }
        return navModel
      })
    }
    return Promise.resolve(navModel);
  }

  attached() {
    return this.mapNavigation(this.router)
  }
}
