'use strict';

const Controller = require('egg').Controller;

class BaseController extends Controller {
    async error(redirectUrl, message) {
        // 参数:redirectUrl：跳转路由， message 错误信息

        await this.ctx.render('admin/public/error', {
            redirectUrl,
            message: message || '操作失败!',
        });
    }
    async success(redirectUrl, message) {
        // 参数:redirectUrl：跳转路由， message 错误信息

        await this.ctx.render('admin/public/success', {
            redirectUrl,
            message: message || '操作失败!',
        });
    }
    async verify() {
        // 验证码
        const captcha = await this.service.tools.captcha(); // 服务里面的方法
        this.ctx.response.type = 'image/svg+xml'; /* 指定返回的类型*/
        //console.log(this.ctx.session.code);
        this.ctx.body = captcha.data; /* 给页面返回一张图片*/
    }
    // 公共的删除
    async delete() {
        const collection = this.ctx.request.query.collection; // 
        const _id = this.ctx.request.query._id;
        console.log(collection, _id);
        await this.ctx.model[collection].deleteOne({ _id: _id }); // 注意写法
        // await this.success('/admin/goodsCate', '删除分类成功');
        await this.success(this.ctx.state.prevPage, '删除分类成功');
    }
    // 公共的修改状态
    async changeStatus() {
        const collectionName = this.ctx.request.query.collectionName; /* 数据库表 Model*/
        const attr = this.ctx.request.query.attr; /* 更新的属性 如:status is_best */
        const id = this.ctx.request.query.id; /* 更新的 id*/

        const result = await this.ctx.model[collectionName].find({ _id: id });

        if (result.length > 0) {

            // attr 值 比如  stauts 字段
            if (result[0][attr] == 1) {

                var json = {/* es6 属性名表达式*/

                    [attr]: 0,
                };

            } else {
                var json = {
                    [attr]: 1,
                };

            }

            // 执行更新操作
            const updateResult = await this.ctx.model[collectionName].updateOne({ _id: id }, json);

            if (updateResult) { // 返回json数据
                this.ctx.body = { message: '更新成功', success: true };
            } else {

                this.ctx.body = { message: '更新失败', success: false };
            }

        } else {

            // 接口
            this.ctx.body = { message: '更新失败,参数错误', success: false };


        }
    }
    // 改变数量的方法
    async editNum() {


        const collectionName = this.ctx.request.query.collectionName; /* 数据库表 Model*/
        const attr = this.ctx.request.query.attr; /* 更新的属性 如:sort */
        const id = this.ctx.request.query.id; /* 更新的 id*/
        const num = this.ctx.request.query.num; /* 数量*/

        const result = await this.ctx.model[collectionName].find({ _id: id });

        if (result.length > 0) {

            const json = {/* es6 属性名表达式*/

                [attr]: num,
            };

            // 执行更新操作
            const updateResult = await this.ctx.model[collectionName].updateOne({ _id: id }, json);

            if (updateResult) {
                this.ctx.body = { message: '更新成功', success: true };
            } else {

                this.ctx.body = { message: '更新失败', success: false };
            }

        } else {

            // 接口
            this.ctx.body = { message: '更新失败,参数错误', success: false };


        }


    }

}

module.exports = BaseController;
