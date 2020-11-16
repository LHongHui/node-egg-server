'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = 'egg企业级框架项目';
  }
}

module.exports = HomeController;
