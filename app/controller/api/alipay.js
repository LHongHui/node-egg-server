'use strict';

const Controller = require('egg').Controller;
const Transaction = require("mongoose-transactions");

class AlipayController extends Controller {
    async pay() {
        const { ctx } = this;
        var uid = ctx.state.userId;
        var order_id = ctx.request.query.order_id;
        // 将来要拿到总价格：
        var orderResult = await this.ctx.model.Order.find({ uid, order_id: order_id });
        //var return_url = ctx.request.body.return_url;
        var d = new Date();

        const data = {
            subject: '一起购小电商',
            out_trade_no: order_id,
            total_amount: '0.1'
        }
        var url = await this.service.alipay.doPay(data);
        ctx.body = { success: true, message: '支付宝拉取地址', data: url };

    }
    //支付成功以后更新订单   必须正式上线
    async alipayNotify() {

        const params = this.ctx.request.body; //支付宝给的接收 post 提交的 XML 

        console.log(params);

        var result = await this.service.alipay.alipayNotify(params);

        console.log(result);  // json 对象的
        console.log('-------------');

        if (result.code == 0) {
            if (params.trade_status == 'TRADE_SUCCESS') {
                //更新订单
                // 更新订单
                var out_trade_no_arr = params.out_trade_no.split('_');

                var order_id = out_trade_no_arr[0];
                /*
                   pay_status: { type: Number },   // 支付状态： 0 表示未支付     1 已经支付
                   pay_type: { type: String },      // 支付类型： 1 alipay    2 wechat  
                */
                const data = await this.ctx.model.Order.find({ "order_id": order_id });
                if (data.length) {
                    //const transaction = new Transaction();
                    await this.ctx.model.Order.updateOne({ order_id: order_id }, { pay_status: 1, pay_type: 'alipay', order_status: 2 });
                    const orderData = await this.ctx.model.OrderItem.find({ "order_id": data[0]._id });
                    const goodData = await this.ctx.model.Goods.find({ _id: orderData[0].product_id });
                    await this.ctx.model.Goods.updateOne({ _id: orderData[0].product_id }, { goods_number: goodData[0].goods_number - 1 });
                    /* try {

                        // 事物回滚(多件事情一起完成或一起失败)
                        let oldOrder = { pay_status: data[0].pay_status, pay_type: data[0].pay_type, order_status: data[0].order_status }
                        let updateOrder = { pay_status: 1, pay_type: 'alipay', order_status: 2 }
                        const id = transaction.insert("Order", oldOrder);
                        //await this.ctx.model.Order.updateOne();
                        transaction.update("Order", id, updateOrder, { order_id: order_id });
                        const orderData = await this.ctx.model.OrderItem.find({ "order_id": data[0]._id });
                        const goodData = await this.ctx.model.Goods.find({ _id: orderData[0].product_id });
                        let oldGoods = { goods_number: goodData[0].goods_number }
                        let updateGoods = { goods_number: goodData[0].goods_num - 1 }
                        const id2 = transaction.insert("Goods", oldGoods);
                        transaction.update("Goods", id2, updateGoods, { _id: orderData[0].product_id });
                        //await this.ctx.model.Goods.updateOne({ _id: orderData[0].product_id }, { goods_number: goodData[0].goods_number - 1 });
                        await transaction.run();
                    } catch (error) {
                        console.error(error);
                        await transaction.rollback().catch(console.error);
                        transaction.clean();

                    } */
                }
            }

            //接收异步通知
        }

    }
    async changeOrderInfo() {
        let order_id = this.ctx.request.query.order_id;
        console.log(order_id);
        const data = await this.ctx.model.Order.find({ "order_id": order_id });
        console.log(data);
        // 1.修改 order表 pay_status: 1, pay_type: 'alipay', order_status: 1
        await this.ctx.model.Order.updateOne({ order_id: order_id }, { pay_status: 1, pay_type: 'alipay', order_status: 1 });
        // 通过订单号可以查询到多个商品的 编号
        const orderData = await this.ctx.model.OrderItem.find({ "order_id": data[0]._id });
        for (var key in orderData) {
            const goodData = await this.ctx.model.Goods.find({ _id: orderData[key].product_id });
            // 2. 修改 goods表中 库存， 缺少商品数量
            await this.ctx.model.Goods.updateOne({ _id: orderData[key].product_id }, { goods_number: goodData[0].goods_number - orderData[key].product_num });
        }

        this.ctx.body = { success: true, message: '修改订单信息成功' };
    }

    async orderchangeToFinished2() {
        const { ctx } = this;
        var orderId = this.app.mongoose.Types.ObjectId(ctx.request.query.orderId);
        var data = await this.ctx.model.Order.find({ _id: orderId });
        console.log(data);
        if (data[0].order_status == 2) {
            var json = { /*es6 属性名表达式*/
                order_status: 4
            };
        }
        var updateResult = await this.ctx.model.Order.updateOne({ "_id": orderId }, json);
        if (updateResult) {
            ctx.body = {
                success: true,
                message: "订单完成"
            }
        }
    }
}
module.exports = AlipayController;
