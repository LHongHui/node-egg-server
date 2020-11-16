module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const d = new Date();
  const Order = new Schema({
    uid: { type: Schema.Types.ObjectId },
    mallPrice: { type: Number },
	freight: { type:Number },
	discount: { type:Number },
    order_id: { type: String },
    name: { type: String },
    tel: { type: Number },
    address: { type: String },
    //remark:{ type: String },      
    pay_status: { type: Number },   // 支付状态： 0 表示未支付     1 已经支付
    pay_type: { type: String, default: 'alipay' },      // 支付类型： alipay    wechat  
    order_status: {               // 0,待付款 1，待发货 2，待收货 3，评价 4，已完成
      type: Number
    },
    add_time: {
      type: Number,
      default: d.getTime()
    }
  });

  return mongoose.model('Order', Order, 'order');
};
