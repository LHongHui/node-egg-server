'use strict';
const fs = require('fs');

const pump = require('mz-modules/pump');
const BaseController = require('./base.js');

class SettingController extends BaseController {
  async index() {

    // 提前给setting表增加一条数据
    const result = await this.ctx.model.Setting.find({});

    await this.ctx.render('admin/setting/index', {

      list: result[0],
    });

  }


  async doEdit() {


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

    }

    // 修改操作

    const updateResult = Object.assign(files, parts.field);

    await this.ctx.model.Setting.updateOne({}, updateResult);

    await this.success('/admin/setting', '修改系统设置成功');


  }
}

module.exports = SettingController;
