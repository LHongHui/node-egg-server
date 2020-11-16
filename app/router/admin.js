'use strict';
module.exports = app => {
    const { router, controller } = app;
    router.get('/', controller.home.index);
    // 后台登录路由
    router.get('/admin', controller.admin.main.index);
    router.get('/admin/login', controller.admin.login.index);
    router.post('/admin/doLogin', controller.admin.login.doLogin);
    router.get('/admin/loginOut', controller.admin.login.loginOut);

    // 基类--验证码
    router.get('/admin/login/verify', controller.admin.base.verify);
    // 基类--公共删除
    router.get('/admin/del', controller.admin.base.delete);
    // 基类-- 公共的状态修改

    router.get('/admin/changeStatus', controller.admin.base.changeStatus);

    // 基类-- 公共的数值的修改

    router.get('/admin/editNum', controller.admin.base.editNum);
    // 商品分类路由
    router.get('/admin/goodsCate', controller.admin.goodsCate.index);
    router.get('/admin/goodsCate/add', controller.admin.goodsCate.add);
    router.post('/admin/goodsCate/doadd', controller.admin.goodsCate.doadd);
    router.get('/admin/goodsCate/edit', controller.admin.goodsCate.edit);
    router.post('/admin/goodsCate/doedit', controller.admin.goodsCate.doedit);

    //router.get('/admin/goodsCate/del', controller.admin.goodsCate.del);




    // 商品路由
    router.get('/admin/goods', controller.admin.goods.index);
    router.get('/admin/goods/add', controller.admin.goods.add);
    router.post('/admin/goods/doadd', controller.admin.goods.doadd);
    router.get('/admin/goods/edit', controller.admin.goods.edit);
    router.post('/admin/goods/doedit', controller.admin.goods.doedit);



    router.post('/admin/goods/goodsUploadImage', controller.admin.goods.goodsUploadImage);
    router.post('/admin/goods/goodsUploadPhoto', controller.admin.goods.goodsUploadPhoto);
    router.post('/admin/goods/changeGoodsImageColor', controller.admin.goods.changeGoodsImageColor);
    router.post('/admin/goods/goodsImageRemove', controller.admin.goods.goodsImageRemove);

    // 轮播图路由
    router.get('/admin/focus', controller.admin.focus.index);
    router.get('/admin/focus/add', controller.admin.focus.add);
    router.post('/admin/focus/doadd', controller.admin.focus.doadd);
    router.get('/admin/focus/edit', controller.admin.focus.edit);
    router.post('/admin/focus/doedit', controller.admin.focus.doedit);

    // 后台管理员模块路由
    router.get('/admin/admin', controller.admin.admin.index);
    router.get('/admin/admin/add', controller.admin.admin.add);
    router.post('/admin/admin/doadd', controller.admin.admin.doadd);
    router.get('/admin/admin/edit', controller.admin.admin.edit);
    router.post('/admin/admin/doedit', controller.admin.admin.doedit);

    // 访问授权：
    router.get('/admin/role', controller.admin.role.index);
    router.get('/admin/role/add', controller.admin.role.add);
    router.post('/admin/role/doAdd', controller.admin.role.doAdd);
    router.post('/admin/role/doEdit', controller.admin.role.doEdit);
    router.get('/admin/role/edit', controller.admin.role.edit);

    router.get('/admin/role/auth', controller.admin.role.auth);
    router.post('/admin/role/doAuth', controller.admin.role.doAuth);

    router.get('/admin/access', controller.admin.access.index);
    router.get('/admin/access/add', controller.admin.access.add);
    router.post('/admin/access/doAdd', controller.admin.access.doAdd);
    router.post('/admin/access/doEdit', controller.admin.access.doEdit);
    router.get('/admin/access/edit', controller.admin.access.edit);
	
	router.get('/admin/order', controller.admin.order.index);
	router.get('/admin/orderchangeToFinished', controller.admin.order.orderchangeToFinished);
	router.get('/admin/setting', controller.admin.setting.index);
	router.post('/admin/setting/doEdit', controller.admin.setting.doEdit);

};
