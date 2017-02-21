import { RouterConfiguration, Router } from 'aurelia-router';

export class Birds {
  public configureRouter(config: RouterConfiguration, router: Router) {
    config.title = "Birds";
    config.map([
      { route: ['', 'care'],   name: 'care',   moduleId: './routes/care/index',   nav: true, title: 'Caring' },
      { route: 'breeds', name: 'breeds', moduleId: './routes/breeds/index', nav: true, title: 'Breeds' },
      { route: 'toys',   name: 'toys',   moduleId: './routes/toys/index',   nav: true, title: 'Toys' },
    ]);
  }
}
