'use strict';

const BaseController = require('./base.js');

class RoleController extends BaseController {
  async index() {

    const result = await this.ctx.model.Role.find({});

    await this.ctx.render('admin/role/index', {

      list: result,
    });

  }

  async add() {


    await this.ctx.render('admin/role/add');

  }

  async doAdd() {

    //  console.log(this.ctx.request.body);


    const role = new this.ctx.model.Role({

      title: this.ctx.request.body.title,

      description: this.ctx.request.body.description,
    });

    await role.save(); // 注意

    await this.success('/admin/role', '增加角色成功');


  }


  async edit() {


    const id = this.ctx.query.id;

    const result = await this.ctx.model.Role.find({ _id: id });

    await this.ctx.render('admin/role/edit', {

      list: result[0],
    });

  }

  async doEdit() {

    /*
        { _csrf: 'b6TZ302c-LE44hFJ7LW9q3aBsmWztZXEA3Vw',
        _id: '5b8cecf5ebad41239888d3e9',
        title: '网站编辑111',
        description: '网站编辑222' }
        */

    const _id = this.ctx.request.body._id;
    const title = this.ctx.request.body.title;
    const description = this.ctx.request.body.description;

    await this.ctx.model.Role.updateOne({ _id }, {
      title, description,
    });
    await this.success('/admin/role', '编辑角色成功');

  }

  async auth() {

    /*
        this.service.admin.getAuthList(role_id) 实现了：
         1、获取全部的权限

         2、查询当前角色拥有的权限（查询当前角色的权限id） 把查找到的数据放在数组中

         3、循环遍历所有的权限数据     判断当前权限是否在角色权限的数组中，   如果在角色权限的数组中：选中    如果不在角色权限的数组中不选中

        */


    const role_id = this.ctx.request.query.id;

    const result = await this.service.admin.getAuthList(role_id);


    await this.ctx.render('admin/role/auth', {

      list: result,
      role_id,
    });

  }


  async doAuth() {


    /*

        1、删除当前角色下面的所有权限

        2、把获取的权限和角色增加到数据库

        */


    console.log(this.ctx.request.body);

    const role_id = this.ctx.request.body.role_id;

    const access_node = this.ctx.request.body.access_node;

    // 1、删除当前角色下面的所有权限

    await this.ctx.model.RoleAccess.deleteMany({ role_id });


    // 2、给role_access增加数据 把获取的权限和角色增加到数据库

    for (let i = 0; i < access_node.length; i++) {

      const roleAccessData = new this.ctx.model.RoleAccess({

        role_id,
        access_id: access_node[i],
      });

      roleAccessData.save();
    }


    await this.success('/admin/role/auth?id=' + role_id, '授权成功');


  }


}

module.exports = RoleController;
