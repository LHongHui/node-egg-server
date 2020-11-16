'use strict';
var fs = require('fs');
const pump = require('mz-modules/pump');

var BaseController = require('./base.js');
class AdminController extends BaseController {
    async index() {
        const { ctx } = this;
        const data = await this.ctx.model.Admin.aggregate([{

            $lookup: {
                from: 'role',
                localField: 'role_id',
                foreignField: '_id',
                as: 'role',
            },
        }]);
        console.log(data);
        await ctx.render('admin/admin/index', { data: data })
    }
    async add() {

        // 优化  csrf传值 ，adminauth中间件设置了ctx.state.csrf = ctx.csrf;   //全局变量
        const roleResult = await this.ctx.model.Role.find();
        await this.ctx.render('admin/admin/add', {

            roleResult
        });

    }
    async doadd() {
        let body = this.ctx.request.body;
        console.log(body);
        this.ctx.request.body.password = await this.service.tools.md5(this.ctx.request.body.password);
        // 判断当前用户是否存在
        const adminResult = await this.ctx.model.Admin.find({ username: body.username });
        if (adminResult.length > 0) {
            await this.error('/admin/admin/add', '此管理员已经存在');
        } else {
            const goodsCate = new this.ctx.model.Admin(body);
            await goodsCate.save();
            await this.success('/admin/admin', '增加管理员成功');

        }
    }
    async edit() {

        const { ctx } = this;
        let _id = this.ctx.request.query._id;
        console.log(_id);
        let dataone = await this.ctx.model.Admin.find({ _id: _id });
        // 获取角色
        const roleResult = await this.ctx.model.Role.find();
        await ctx.render('admin/admin/edit', { dataone: dataone[0], roleResult });
    }
    async doedit() {


        // 修改操作
        const _id = this.ctx.request.body._id;
        let password = this.ctx.request.body.password;
        const mobile = this.ctx.request.body.mobile;
        const email = this.ctx.request.body.email;
        const role_id = this.ctx.request.body.role_id;

        if (password) {
            // 修改密码
            password = await this.service.tools.md5(password);
            await this.ctx.model.Admin.updateOne({ _id: _id }, {
                password,
                mobile,
                email,
                role_id,
            });

        } else {

            // 不修改密码
            await this.ctx.model.Admin.updateOne({ _id: _id }, {
                mobile,
                email,
                role_id,
            });

        }

        await this.success('/admin/admin', '修改管理员成功');

    }
}

module.exports = AdminController;
