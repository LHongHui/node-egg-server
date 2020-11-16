'use strict';
module.exports = app => {

    const xmlparseMiddleware = app.middleware.xmlparse();

    const { router, controller } = app;
    // 轮播图
    router.get('/api/index/carousels', controller.api.goods.carousels);
    // 商品展示相关
    // 首页推荐商品:  is_best, is_hot  is_new
    router.get('/api/index/items/:type', controller.api.goods.recommend);
    // 商品详情页  /api/items/searchById
    router.get('/api/items/searchById', controller.api.goods.goodsDetail);
    // 商品分类
    // 获得所有分类名称信息
    router.get('/api/cats', controller.api.goods.goodsCats);
    //通过分类id  查找对应商品  
    router.get('/api/items/searchByCat', controller.api.goods.goodsByCat);
    // 商品搜索
    router.get('/api/index/search', controller.api.goods.search);

    // 通过多个商品id 查找多个商品  

    router.get('/api/item/queryItems', controller.api.goods.getGoods);

    // 查找所有的分类下面对应的商品
    router.get('/api/catesAndGoods', controller.api.goods.catesAndGoods);

    // 通过color的id号找对应图库的图
    router.get('/api/getImageStore', controller.api.goods.getImageStore)

    //  获得 color 和 size 的对应信息
    router.get('/api/getColorSize', controller.api.goods.getColorSize)

    // 登录接口

    router.get('/api/verify', app.controller.admin.base.verify);           //验证码 
    router.post('/api/login', controller.api.user.login);           // 用户登录
    router.post('/api/queryUser', controller.api.user.queryUser);   // 查询单个用户
    router.post('/api/saveUser', controller.api.user.saveUser);     // 单个用户资料修改保存
    router.post('/api/loginOut', controller.api.user.loginOut);     // 退出登录

    // 用户操作
    // 收藏
    router.post('/api/item/like', controller.api.user.userLike);
    router.post('/api/item/unlike', controller.api.user.userunLike);
    router.post('/api/item/userIsLike', controller.api.user.userIsLike);
    router.post('/api/items/goodsFavList', controller.api.user.goodsFavList);

    // 评论 /api/goodsOne/comment
    router.post('/api/goodsOne/comment', controller.api.user.comment);
    router.post('/api/alreadyEvaluated', controller.api.user.alreadyEvaluated);     // 查询已评价的商品商品列表
    router.post('/api/tobeEvaluated', controller.api.user.tobeEvaluated);     // 查询待评价的商品商品列表
    router.post('/api/evaluateOne', controller.api.user.evaluateOne)  // 查询单条评价

    // 购物车
    router.post('/api/getShop', controller.api.user.getShop);
    router.post('/api/addShop', controller.api.user.addShop);                     // 加入购物车
    router.post('/api/editCart', controller.api.user.editCart);                   // 购物车增加减少
    router.post('/api/deleteShop', controller.api.user.deleteShop);

    // 地址管理
    router.get('/api/getAddress', controller.api.user.getAddress);  // 查询收货地址
    router.get('/api/getDefaultAddress', controller.api.user.getDefaultAddress);     // 查询默认收货地址
    router.post('/api/setDefaultAddress', controller.api.user.setDefaultAddress);     // 设置默认收货地址

    router.post('/api/address', controller.api.user.address);                     // 保存收货地址
    router.post('/api/deleteAddress', controller.api.user.deleteAddress);         // 删除单条收货地址
    // 訂單

    router.post('/api/order', controller.api.user.order); // 生成订单
    router.get('/api/myOrder', controller.api.user.myOrder);                   // 查询用户订单
    router.get('/api/orderNum', controller.api.user.orderNum);         // 查询用户订单数量

    //检测订单是否支付
    //router.get('/buy/getOrderPayStatus', controller.api.user.getOrderPayStatus);
    //支付
    router.get('/api/confirm', controller.api.user.confirm);

    router.get('/api/alipay/pay', controller.api.alipay.pay);
    //支付成功回调
    //router.get('/api/alipay/alipayReturn', controller.api.alipay.alipayReturn);
    //支付成功异步通知
    router.post('/api/alipay/alipayNotify', xmlparseMiddleware, controller.api.alipay.alipayNotify);

    ///api/alipay / changeOrderInfo  测试模拟支付状态修改
    router.get('/api/alipay/changeOrderInfo', controller.api.alipay.changeOrderInfo);
    //  前端用户确认收货
    router.get('/api/alipay/orderchangeToFinished2', controller.api.alipay.orderchangeToFinished2);
	
	// 我的足迹(添加)
	router.post('/api/addFoot', controller.api.user.addFoot);
	router.post('/api/getFoot', controller.api.user.getFoot);

};
