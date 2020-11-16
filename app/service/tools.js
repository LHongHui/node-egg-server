'use strict';
// 安装cnpm install svg-captcha --save
var svgCaptcha = require('svg-captcha'); //引入验证
// cnpm install md5 --save
var md5 = require('md5');
var fs = require('fs');

//  cnpm install silly-datetime --save
var sd = require('silly-datetime');

var path = require('path');
// cnpm install  mz-modules --save
const mkdirp = require('mz-modules/mkdirp');

// cnpm install jimp --save
const Jimp = require('jimp'); // 生成缩略图的模块

const Service = require('egg').Service;
class ToolsService extends Service {
    async getOrderId() {
        var order_id = sd.format(new Date(), 'YYYYMMDDHHmmss');
        var numArr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        var randomStr = '';
        for (var i = 0; i < 6; i++) {
            randomStr += numArr[Math.floor(Math.random() * 10)];
        }
        return order_id + randomStr;  /*字符串的拼接*/
    }
    //生成验证码
    async captcha() {
        var captcha = svgCaptcha.create({
            size: 4,
            fontSize: 50,
            width: 100,
            height: 32,
            background: "#00AAFF"
        });
        this.ctx.session.code = captcha.text;   /*重要 存session验证码的信息*/
        return captcha;
    }
    // md5模块
    async md5(str) {
        return md5(str);
    }
    //  获得时间戳
    async getTime() {
        var d = new Date();
        return d.getTime();
    }
    async getUploadFile(filename) {
        // 1、获取当前日期     20200909
        const day = sd.format(new Date(), 'YYYYMMDD');
        // 2、创建图片保存的路径  app/public/upload/20200909
        const dir = path.join(this.config.uploadDir, day);
        await mkdirp(dir);
        const d = await this.getTime(); /* 毫秒数*/
        // 返回图片保存的路径
        const uploadDir = path.join(dir, d + path.extname(filename));
        // app\public\upload\20180914\1536895331444.png
        return {
            uploadDir, // 操作文件的路径
            saveDir: uploadDir.slice(3).replace(/\\/g, '/'), //数据库存的路径
        };
    }
    // 生成缩略图的公共方法
    async jimpImg(target) {
        // 上传图片成功以后生成缩略图
        Jimp.read(target, (err, lenna) => {
            if (err) throw err;
            for (let i = 0; i < this.config.jimpSize.length; i++) {
                const w = this.config.jimpSize[i].width;
                const h = this.config.jimpSize[i].height;
                lenna.resize(w, h) // resize
                    .quality(90) // set JPEG quality
                    .write(target + '_' + w + 'x' + h + path.extname(target));
            }
        });
    }
    // 写入文件
    async writeFile(path, dataBuffer) {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, dataBuffer, function (err) {//用fs写入文件
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }
    // 创建相册的保存路径
    async getUploadFile2(_base64) {

        var paths = this.app.config.uploadDir + Date.now() + Math.ceil(Math.random() * 9999) + '.png';//从app.js级开始找--在我的项目工程里是这样的
        let base64
        if (_base64.includes('data:image/')) {
            base64 = _base64.replace(/^data:image\/\w+;base64,/, "");//去掉图片base64码前面部分data:image/png;base64
        } else {
            base64 = _base64
        }
        var dataBuffer = new Buffer(base64, 'base64'); //把base64码转成buffer对象，
        await this.writeFile(paths, dataBuffer)
        return {
            saveDir: paths.slice(3).replace(/\\/g, '/')
        }
    }



}
module.exports = ToolsService;
