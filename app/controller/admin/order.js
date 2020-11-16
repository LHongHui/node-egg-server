'use strict';
const fs = require('fs');

const pump = require('mz-modules/pump');
const BaseController = require('./base.js');

class OrderController extends BaseController {
	async index() {
		const { ctx } = this;
		var results = await this.ctx.model.Order.find({});

		await ctx.render('admin/order/index.html', { data: results });
	}

	///orderchangeToFinished
	async orderchangeToFinished() {
		const { ctx } = this;
		var orderId = this.app.mongoose.Types.ObjectId(ctx.request.query.orderId);
		var data = await this.ctx.model.Order.find({ _id: orderId });
		console.log(data);
		if (data[0].order_status == 1) {
			var json = { /*es6 属性名表达式*/
				order_status: 2
			};
		} else {
			var json = {
				order_status: 1
			};
		}
		var updateResult = await this.ctx.model.Order.updateOne({ "_id": orderId }, json);
		if (updateResult) {
			ctx.body = {
				success: true,
				message: "已发货"
			}
		}
	}

}
module.exports = OrderController;