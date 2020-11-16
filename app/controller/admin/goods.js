'use strict';
var fs = require('fs');
const pump = require('mz-modules/pump');

var BaseController = require('./base.js');
class GoodsController extends BaseController {

    async index() {
        const { ctx } = this;
        // 1. 动态当前页
        var page = ctx.request.query.page || 1;

        var keyword = ctx.request.query.keyword;

        // 注意
        var json = {};
        if (keyword) {   //{title:{$regex:/羽绒裤/}}     
            json = Object.assign({ title: { $regex: new RegExp(keyword) } });
        }
        // 2. 每页显示条数
        var pageSize = 3;
        // 3. 总条数
        var totals = await this.ctx.model.Goods.find(json).count();
        // 4. 总页数
        var totalPages = Math.ceil(totals / pageSize);
        // 5.每页开始的编号
        var offset = (page - 1) * pageSize;
        //	
        //	// 分页   skip(offset).limit(pageSize)
        //var results = await this.ctx.model.Goods.find(json).skip(offset).limit(pageSize).sort({ "sort": -1 });

        var results = await this.ctx.model.Goods.aggregate([

            {
                $lookup: {  // 两表联合 jion
                    from: 'goods_cate',
                    localField: 'cate_id',
                    foreignField: '_id',
                    as: 'catelist',
                },
            },
            {
                $match: json   // where查询条件 模糊查询
            },

            {
                $skip: offset,  // 分页
            },
            {
                $limit: pageSize,  // 分页
            },
            {
                $sort: { "add_time": -1 }

            }

        ]);
        //console.log(results);
        await this.ctx.render('admin/goods/index', {
            data: results,
            totalPages,
            page,
            keyword
        });
    }
    async add() {
        // 获取所有的颜色值
        const colorResult = await this.ctx.model.GoodsColor.find({});
        // 获取所有的尺寸类型
        const sizeResult = await this.ctx.model.GoodsSize.find({});
        let goodsCate = await this.ctx.model.GoodsCate.find({});
        await this.ctx.render('admin/goods/add', { goodsCate, colorResult, sizeResult });
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
        console.log(parts.field.goods_color);
        // 判断  goods_color 是数组转为字符串的情况
        // 5bbb68dcfe498e2346af9e4a,5bbb68effe498e2346af9e4b,5bc067d92e5f889dc864aa96
        if (typeof (parts.field.goods_color) != 'string') {
            parts.field.goods_color = parts.field.goods_color.join(',');
        }
        if (typeof (parts.field.goods_size) != 'string') {
            parts.field.goods_size = parts.field.goods_size.join(',');
        }

        let body = Object.assign(files, parts.field)
        const goods = new this.ctx.model.Goods(body);
        let result = await goods.save();

        // 增加图库信息
        let goods_image_list = body.goods_image_list;
        if (result._id && goods_image_list) {
            // 解决上传一个图库不是数组的问题(一个属性值时是字符串)
            if (typeof (goods_image_list) === 'string') {
                goods_image_list = new Array(goods_image_list);
            }
            for (var i = 0; i < goods_image_list.length; i++) {
                const goodsImageRes = new this.ctx.model.GoodsImage({
                    goods_id: result._id,
                    img_url: goods_image_list[i],
                });

                await goodsImageRes.save();
            }

        }
        await this.success('/admin/goods', '增加分类成功');

    }
    async edit() {
        const { ctx } = this;
        let _id = this.ctx.request.query._id;
        console.log(_id);
        // 获取所有的颜色值
        const colorResult = await this.ctx.model.GoodsColor.find({});
        const sizeResult = await this.ctx.model.GoodsSize.find({});
        // 商品分类的信息
        let goodsCate = await this.ctx.model.GoodsCate.find({});
        // 通过id拿商品的信息   dataone有goods_color字段
        let dataone = await this.ctx.model.Goods.find({ _id: _id });

        // 获取当前商品的颜色（将字符串转数组）
        // 5bbb68dcfe498e2346af9e4a,5bbb68effe498e2346af9e4b,5bc067d92e5f889dc864aa96


        if (dataone[0].goods_color.length > 0) {
            const colorArrTemp = dataone[0].goods_color.split(',');
            // console.log(colorArrTemp);
            const goodsColorArr = [];

            colorArrTemp.forEach(value => {
                goodsColorArr.push({ _id: value });
            });
            var goodsColorReulst = await this.ctx.model.GoodsColor.find({
                $or: goodsColorArr,
            });
        } else {
            var goodsColorReulst = [];
        }


        // 获取当前商品的尺寸（将字符串转数组）
        // 5bbb68dcfe498e2346af9e4a,5bbb68effe498e2346af9e4b,5bc067d92e5f889dc864aa96


        if (dataone[0].goods_size.length > 0) {
            const sizeArrTemp = dataone[0].goods_size.split(',');
            // console.log(colorArrTemp);
            const goodsSizeArr = [];

            sizeArrTemp.forEach(value => {
                goodsSizeArr.push({ _id: value });
            });
            var goodsSizeReulst = await this.ctx.model.GoodsSize.find({
                $or: goodsSizeArr,
            });
        } else {
            var goodsSizeReulst = [];
        }
        // 商品的图库信息
        const goodsImageResult = await this.ctx.model.GoodsImage.find({ goods_id: dataone[0]._id });
        await ctx.render('admin/goods/edit', {
            dataone: dataone[0],
            goodsCate,
            colorResult,
            sizeResult,
            goodsImage: goodsImageResult,
            goodsColor: goodsColorReulst,
            goodsSize: goodsSizeReulst,
        });
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
        // 判断 表单的 goods_color 是数组转为字符串的情况
        if (typeof (parts.field.goods_color) != 'string') {
            parts.field.goods_color = parts.field.goods_color.join(',');
        }
        if (typeof (parts.field.goods_size) != 'string') {
            parts.field.goods_size = parts.field.goods_size.join(',');
        }
        const updateResult = Object.assign(files, parts.field);
        await this.ctx.model.Goods.updateOne({ _id: _id }, updateResult);

        // 图库信息  （增加）

        let goods_image_list = parts.field.goods_image_list;
        console.log(goods_image_list);
        if (_id && goods_image_list) {
            if (typeof (goods_image_list) === 'string') {

                goods_image_list = new Array(goods_image_list);
            }

            for (var i = 0; i < goods_image_list.length; i++) {
                let imageBody = {
                    goods_id: _id,
                    img_url: goods_image_list[i],
                }
                const goodsImageRes = new this.ctx.model.GoodsImage(imageBody);
                await goodsImageRes.save();
            }
        }
        await this.success('/admin/goods', '修改商品成功');
    }


    // 上传商品详情的图片
    async goodsUploadImage() {

        const parts = this.ctx.multipart({ autoFields: true });
        let files = {};
        let stream;
        while ((stream = await parts()) != null) {
            if (!stream.filename) {
                break;
            }
            const fieldname = stream.fieldname; // file表单的名字

            // 上传图片的目录
            const dir = await this.service.tools.getUploadFile(stream.filename);
            const target = dir.uploadDir;
            const writeStream = fs.createWriteStream(target);

            await pump(stream, writeStream);

            files = Object.assign(files, {
                [fieldname]: 'http://localhost:7001' + dir.saveDir,
            });

        }

        console.log(files);

        // 图片的地址转化成 {link: 'path/to/image.jpg'}

        this.ctx.body = { link: files.file };


    }

    // 上传相册的图片
    async goodsUploadPhoto() {
        // 实现图片上传
        const parts = this.ctx.multipart({ autoFields: true });
        let files = {};
        let stream;
        while ((stream = await parts()) != null) {
            if (!stream.filename) {
                break;
            }
            const fieldname = stream.fieldname; // file表单的名字

            // 上传图片的目录
            const dir = await this.service.tools.getUploadFile(stream.filename);
            const target = dir.uploadDir;
            const writeStream = fs.createWriteStream(target);

            await pump(stream, writeStream);

            files = Object.assign(files, {
                [fieldname]: dir.saveDir,
            });

            // 生成缩略图
            this.service.tools.jimpImg(target);

        }
        // 图片的地址转化成 {link: 'path/to/image.jpg'}

        this.ctx.body = { link: files.file };

    }
    // 修改图片颜色
    async changeGoodsImageColor() {

        let color_id = this.ctx.request.body.color_id;

        const goods_image_id = this.ctx.request.body.goods_image_id;
        console.log(this.ctx.request.body);
        if (color_id) {
            color_id = this.app.mongoose.Types.ObjectId(color_id);//重要转ObjectId的类型
        }

        const result = await this.ctx.model.GoodsImage.updateOne({ _id: goods_image_id }, {
            color_id,
        });
        if (result) {

            this.ctx.body = { success: true, message: '更新数据成功' };
        } else {

            this.ctx.body = { success: false, message: '更新数据失败' };
        }

    }

    // 删除图片
    async goodsImageRemove() {

        const goods_image_id = this.ctx.request.body.goods_image_id;

        // 注意  图片要不要删掉   fs模块删除以前当前数据对应的图片


        const result = await this.ctx.model.GoodsImage.deleteOne({ _id: goods_image_id }); // 注意写法

        if (result) {

            this.ctx.body = { success: true, message: '删除数据成功' };
        } else {

            this.ctx.body = { success: false, message: '删除数据失败' };
        }

    }


}

module.exports = GoodsController;
