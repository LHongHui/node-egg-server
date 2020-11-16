'use strict';

const Service = require('egg').Service;

const url = require('url');

class AdminService extends Service {
  async checkAuth() {
    /*先用当前自己的用户 拿 role_id,
    然后 在  role_access表中 获得 权限管理的模块或菜单的_id编号列表
    再然后 用当前访问的路由url  去Access找对应的数据获得_id号(一个)
    最后  将_id号(一个)去 权限管理的模块或菜单的_id编号列表找,如果没找到就没权限访问
   */

    // 1、获取当前用户的角色
    const userinfo = this.ctx.session.userinfo;

    const role_id = userinfo.role_id;

    const pathname = url.parse(this.ctx.request.url).pathname; // 获取当前用户访问的地址

    //  console.log(pathname);

    // 忽略权限判断的地址    is_super表示是管理员
    const ignoreUrl = ['/admin', '/admin/login', '/admin/doLogin', '/admin/login/verify', '/admin/loginOut'];

    if (ignoreUrl.indexOf(pathname) != -1 || userinfo.is_super == 1) {
      return true; // 允许访问
    }


    // 2、根据角色获取当前角色的权限列表

    const accessResult = await this.ctx.model.RoleAccess.find({ role_id });

    const accessArray = []; // 当前角色可以访问的权限列表
    accessResult.forEach(function (value) {
      accessArray.push(value.access_id.toString());
    });


    // 3、获取当前访问的url 对应的权限id


    //  var pathname=url.parse(ctx.request.url).pathname;         //获取当前用户访问的地址

    const accessUrlResult = await this.ctx.model.Access.find({ url: pathname });

    console.log(pathname, accessUrlResult);
    // 4、判断当前访问的url对应的权限id 是否在权限列表中的id中


    if (accessUrlResult.length > 0) {

      if (accessArray.indexOf(accessUrlResult[0]._id.toString()) != -1) {

        return true; // 有权限访问
      }
      return false; // 没权限访问

    }

    return false;
  }

  // 获取权限列表的方法
  async getAuthList(role_id) {


    /*

         1、获取全部的权限

         2、查询当前角色拥有的权限（查询当前角色的权限id） 把查找到的数据放在数组中

         3、循环遍历所有的权限数据     判断当前权限是否在角色权限的数组中，   如果在角色权限的数组中：选中    如果不在角色权限的数组中不选中

        */


    // 1、获取全部的权限

    const result = await this.ctx.model.Access.aggregate([

      {
        $lookup: {
          from: 'access',
          localField: '_id',
          foreignField: 'module_id',
          as: 'items',
        },
      },
      {
        $match: {
          module_id: '0',
        },
      },

    ]);

    // 2、查询当前角色拥有的权限（查询当前角色的权限id） 把查找到的数据放在数组中

    const accessReulst = await this.ctx.model.RoleAccess.find({ role_id });

    const roleAccessArray = [];

    accessReulst.forEach(function (value) {

      roleAccessArray.push(value.access_id.toString());
    });


    // console.log(roleAccessArray);

    // 3、循环遍历所有的权限数据     判断当前权限是否在角色权限的数组中


    for (let i = 0; i < result.length; i++) {

      if (roleAccessArray.indexOf(result[i]._id.toString()) != -1) {

        result[i].checked = true;

      }

      for (let j = 0; j < result[i].items.length; j++) {

        if (roleAccessArray.indexOf(result[i].items[j]._id.toString()) != -1) {

          result[i].items[j].checked = true;

        }

      }

    }

    // console.log(result);


    return result;


  }


}

module.exports = AdminService;
