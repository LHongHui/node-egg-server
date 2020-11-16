'use strict';

const BaseController = require('./base.js');

class AccessController extends BaseController {
  async index() {
    // 1 拿到 access 权限列表顶级模块和对应的二级菜单或操作(表自关联实现的)

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


    console.log(result);


    await this.ctx.render('admin/access/index', {

      list: result,
    });
  }
  async add() {


    // 获取模块列表

    const result = await this.ctx.model.Access.find({ module_id: '0' });


    await this.ctx.render('admin/access/add', {

      moduleList: result,
    });
  }

  async doAdd() {
    // console.log(this.ctx.request.body);

    try {


      const addResult = this.ctx.request.body;
      const module_id = addResult.module_id;

      // 菜单  或者操作
      if (module_id != 0) {

        addResult.module_id = this.app.mongoose.Types.ObjectId(module_id); // 调用mongoose里面的方法把字符串转换成ObjectId

      }
      const access = new this.ctx.model.Access(addResult);

      access.save();

      await this.success('/admin/access', '增加权限成功');
    } catch (error) {

      console.log(error);

    }


  }
  async edit() {


    const id = this.ctx.request.query.id;

    // 获取编辑的数据

    const accessResult = await this.ctx.model.Access.find({ _id: id });


    const result = await this.ctx.model.Access.find({ module_id: '0' });


    await this.ctx.render('admin/access/edit', {


      list: accessResult[0],

      moduleList: result,
    });
  }


  async doEdit() {
    console.log(this.ctx.request.body);

    /*
    {


      id: '5b8e4422b3cc641f4894d7bc',
      _csrf: '8F3tGQd8-w1HtBpsyUbnBSQY5Up7OOqHXYSY',


      module_name: '权限管理111',
      type: '3',
      action_name: '增加权限1',
      url: '/admin/access/add',
      module_id: '5b8e3836f71aad20249c2f98',
      sort: '100',
      description: '增加权限---操作1111' }
    */
    const updateResult = this.ctx.request.body;

    const id = updateResult.id;

    const module_id = updateResult.module_id;


    // 菜单  或者操作
    if (module_id != 0) {

      updateResult.module_id = this.app.mongoose.Types.ObjectId(module_id); // 调用mongoose里面的方法把字符串转换成ObjectId

    }

    const result = await this.ctx.model.Access.updateOne({ _id: id }, updateResult);

    await this.success('/admin/access', '修改权限成功');


  }
}
module.exports = AccessController;
