'use strict';

//const Controller = require('egg').Controller;
var BaseController = require('./base.js');
class HomeController extends BaseController {
  async index() {
    const { ctx } = this;
    //ctx.body = '后台界面';

    await ctx.render('admin/main')
  }
}

module.exports = HomeController;
