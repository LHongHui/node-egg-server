'use strict';

const Service = require('egg').Service;

const Alipay = require('alipay-mobile');

class AlipayService extends Service {
  async doPay(orderData) {
    return new Promise((resolve, reject) => {
      //实例化 alipay 支付宝支付的配置
      const service = new Alipay(this.config.alipayOptions);
      //获取返回的参数
      // this.config.alipayBasicParams
      //createWebOrderURL
      //service.createPageOrderURL(orderData, this.config.alipayBasicParams)
      /*
         exports.alipayBasicParams = {
          return_url: 'http://app.yiqigoumall.com/#/success', //(前端)支付成功返回地址
          notify_url: 'http://app2.yiqigoumall.com/alipay/alipayNotify'//(后台的接口)支付成功异步通知地址，更新订单路由
        }
      */
      service.createWebOrderURL(orderData, this.config.alipayBasicParams)
        .then(result => {
          console.log(result)  // 定义要查看是否能拿到支付宝提供的拉取支付的界面。
          resolve(result.data);
        })
    })


  }


  //验证异步通知的数据是否正确
  alipayNotify(params) {

    //实例化 alipay
    const service = new Alipay(this.config.alipayOptions);

    return service.makeNotifyResponse(params);


  }

}

module.exports = AlipayService;
