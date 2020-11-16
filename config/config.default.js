/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1599181100295_3544';

  config.uploadDir = 'app/public/upload';
  config.url = 'http://localhost:7001';

  config.session = {
    key: 'SESSION_ID',
    maxAge: 864000000,
    httpOnly: true,//只能服务器访问cookie(安全)
    encrypt: true,
    renew: true //  延长会话有效期
  }
  // add your middleware config here
  config.middleware = ['adminauth', 'isLogin'];

  config.adminauth = {
    match: '/admin',
  }

  config.isLogin = {
    match: '/api',
  }


  // add your user config here
  // const userConfig = {
  //   // myAppName: 'egg',
  // };

  //配置模板引擎
  config.view = {
    mapping: {
      '.html': 'ejs',
    },
  };


  exports.jwt = {
    secret: "myeggmall" //自己设置的值
  };

  // 配置表单数量
  exports.multipart = {
    fields: '50',
  };




  // 定义缩略图的尺寸
  exports.jimpSize = [

    {
      width: 180,
      height: 180,
    }, {

      width: 400,
      height: 400,
    }

  ];

  exports.security = {
    //csrf:false,
    csrf: {
      // 判断是否需要 ignore 的方法，请求上下文 context 作为第一个参数
      ignore: ctx => {
        if (ctx.request.url == '/admin/goods/goodsUploadImage' || ctx.request.url == '/admin/goods/goodsUploadPhoto') {
          return true;
        } else if (ctx.request.url.indexOf('/api') != -1) {
          return true;
        } else {
          return false;
        }
      }
    },
    // domainWhiteList: ['http://app.yiqigoumall.com']
	domainWhiteList: ['http://localhost:8080']
  };

  //配置mongoose连接mongodb数据库
  exports.mongoose = {
    client: {
      url: 'mongodb://127.0.0.1/eggMall',
      options: {},
    }
  };
  // 配置什么域名可以访问后台服务器
  //配置允许跨域
  // https://www.npmjs.com/package/koa2-cors
  exports.cors = {
	origin: 'http://localhost:8080',//origin: '*',
    // origin: 'http://app.yiqigoumall.com',//origin: '*',
    credentials: true, // 允许cookie跨越,不能写origin: '*'
    allowMethods: 'GET,PUT,POST,DELETE'
  };


  //支付宝支付的配置
  exports.alipayOptions = {
    app_id: "*******************",
    appPrivKeyFile: "**********************************",
    alipayPubKeyFile: "*************************************************", 
  }

  exports.alipayBasicParams = {
    return_url: 'http://www.yiqigoumall.com/#/success', //支付成功返回地址
    notify_url: 'http://app2.yiqigoumall.com/alipay/alipayNotify'//支付成功异步通知地址，更新订单路由
  }

  //微信支付的配置
  exports.weixinPayConfig = {
    wxappid: "****************", // 小程序ID
    wxpaykey: "**************************",  // 小程序Secret
    mch_id: "************", // 商户号  邮件里面获取
    mch_key: "********************************" //
  }

  exports.weixinpayBasicParams = {

    //注意回调地址必须在  微信商户平台配置
    //notify_url: "http://video.apiying.com/weixinpay/weixinpayNotify"
    notify_url: 'http://pay.apiying.com',
  }

  return {
    ...config,

  };
};
