'use strict';
var md5 = require('md5');
//const Controller = require('egg').Controller;
var BaseController = require('./base.js');
class LoginController extends BaseController {
    async index() {
        const { ctx } = this;
        await ctx.render('admin/login', {
            csrf: this.ctx.csrf
        });
    }
    async doLogin() {
        // post 的接收
        //let body = this.ctx.request.body;
        //this.ctx.body = body;
        var username = this.ctx.request.body.username;
        var password = md5(this.ctx.request.body.password);
        //var code =?  和  this.ctx.session.code 做比较
        var mycode = this.ctx.request.body.verify;
        console.log(username, password);
        console.log(this.ctx.session.code)
        if (mycode.toUpperCase() == this.ctx.session.code.toUpperCase()) {
            // mongoose 数据库查询
            var result = await this.ctx.model.Admin.find({ username: username, password: password });
            //console.log(result);
            if (result.length > 0) {
                //登录成功
                // 1、session保存用户信息
                this.ctx.session.userinfo = result[0];

                //2、跳转到用户中心
                this.ctx.redirect('/admin');
            } else {
                //this.ctx.body = '用户名或密码不正确';
                await this.error('/admin/login', '用户名或者密码不对');
            }


        } else {
            // 验证码失败
            await this.error('/admin/login', '验证码不正确');
        }
    }
    // 登录退出
    async loginOut() {
        //  sesssion 中  userinfo 清除
        this.ctx.session.userinfo = null;

        this.ctx.redirect('/admin/login');
    }
}
module.exports = LoginController;
