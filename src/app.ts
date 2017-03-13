import { Router, RouterConfiguration, RouteConfig, NavModel } from 'aurelia-router';
import { relativeToFile } from 'aurelia-path';
import { CompositionEngine, CompositionContext } from 'aurelia-templating';
import { EventAggregator  } from 'aurelia-event-aggregator';
import { autoinject } from 'aurelia-framework';
import { Origin } from 'aurelia-metadata';

@autoinject()
export class App {
  public router: Router;
  public navigationMenu: any;
  public subscriber: any;

  constructor(private compositionEngine: CompositionEngine, private eventAggregator: EventAggregator ) {

  }

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
    const navModel: any = Object.assign({}, nav)

    if (config.moduleId) {
      const childContainer = router.container.createChild();
      const instruction = {
        viewModel: relativeToFile(config.moduleId, Origin.get((<any>router.container).viewModel.constructor).moduleId),
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
            nav.href = `${navModel.href}/${nav.config.href ? nav.config.href : nav.config.route}`
          })
          return this.mapNavigation(childRouter, config)
            .then(r => navModel.navigation = r )
            .then( () => navModel);
        }
        return navModel
      })
    }
    return Promise.resolve(navModel);
  }
  updateNavModels(navModels, instruction, instructionDepth, resetDepth) {
    navModels.forEach( navModel => {
      if (resetDepth >= instructionDepth)
        navModel.isActive = false;
      if (navModel.href === instruction.config.navModel.href)
        navModel.isActive = true;
      if (navModel.navigation) {
        this.updateNavModels(navModel.navigation, instruction, instructionDepth, resetDepth+1)
      }
    })
  }

  updateNavigationMenu(instruction, depth) {
    this.updateNavModels(this.navigationMenu, instruction, depth, 0)
    if ('childNavigationInstruction' in instruction.viewPortInstructions.default) {
      this.updateNavigationMenu(instruction.viewPortInstructions.default.childNavigationInstruction, depth+1)
    }
  }
  attached() {
    this.subscriber = this.eventAggregator.subscribe('router:navigation:complete', response => { this.updateNavigationMenu(response.instruction, 0) })
    return this.mapNavigation(this.router)
    .then(navModel => this.navigationMenu = navModel)
    .then(() => this.updateNavigationMenu(this.router.currentInstruction, 0))
  }

  detached() {
    this.subscriber.dispose();
  }

}
