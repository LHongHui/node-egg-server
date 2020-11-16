'use strict';
var fs = require('fs');
const pump = require('mz-modules/pump');

var BaseController = require('./base.js');
class FocusController extends BaseController {
    async index() {
        const { ctx } = this;
        let data = await this.ctx.model.Focus.find({});
        await ctx.render('admin/focus/index', { data: data })
    }
    async add() {
        const { ctx } = this;
        // 优化  csrf传值 ，adminauth中间件设置了ctx.state.csrf = ctx.csrf;   //全局变量
        await ctx.render('admin/focus/add');
    }
    async doadd() {
        //1. parts  上传文件对象信息,其他表单信息(title,sort)
        const parts = this.ctx.multipart({ autoFields: true });

        let files = {};
        let stream;
        while ((stream = await parts()) != null) {
            if (!stream.filename) {
                break;
            }
            const fieldname = stream.fieldname; // file表单的名字
            // 2. 上传图片的目录
            const dir = await this.service.tools.getUploadFile(stream.filename);
            // 3. egg流文件上传图片操作
            const target = dir.uploadDir;
            const writeStream = fs.createWriteStream(target);
            await pump(stream, writeStream);
            // 4. 将上传的图像路径添加到数据库的-- 字段  cate_img:upload/20200901/fdfdfd.png
            files = Object.assign(files, {
                [fieldname]: dir.saveDir,
            });
            console.log(fieldname);
            // 生成缩略图
            this.service.tools.jimpImg(target);
        }
        console.log(parts);

        let body = Object.assign(files, parts.field)
        const focus = new this.ctx.model.Focus(body);
        await focus.save();
        await this.success('/admin/focus', '增加分类成功');

    }
    async edit() {
        const { ctx } = this;
        let _id = this.ctx.request.query._id;
        console.log(_id);
        let dataone = await this.ctx.model.Focus.find({ _id: _id });
        console.log(dataone);
        await ctx.render('admin/focus/edit', { dataone: dataone[0] });
    }
    async doedit() {

        //1. parts  上传文件对象信息,其他表单信息(title,sort)
        const parts = this.ctx.multipart({ autoFields: true });

        let files = {};
        let stream;
        while ((stream = await parts()) != null) {
            if (!stream.filename) {
                break;
            }
            const fieldname = stream.fieldname; // file表单的名字
            // 2. 上传图片的目录
            const dir = await this.service.tools.getUploadFile(stream.filename);
            // 3. egg流文件上传图片操作
            const target = dir.uploadDir;
            const writeStream = fs.createWriteStream(target);
            await pump(stream, writeStream);
            // 4. （重要）将上传的图像路径添加到数据库的-- 字段  cate_img:upload/20200901/fdfdfd.png
            files = Object.assign(files, {
                [fieldname]: dir.saveDir,
            });
            console.log(fieldname);
            // 生成缩略图
            this.service.tools.jimpImg(target);
        }
        console.log(parts);
        // 修改操作
        const _id = parts.field._id;
        const updateResult = Object.assign(files, parts.field);
        // 修改商品信息
        await this.ctx.model.Focus.updateOne({ _id: _id }, updateResult);

        await this.success('/admin/focus', '修改分类成功');

    }

}

module.exports = FocusController;
