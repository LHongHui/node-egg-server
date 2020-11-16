module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  
  const d = new Date();
  const OrderItem = new Schema({
    uid:{ type: Schema.Types.ObjectId },
    order_id:  { type: Schema.Types.ObjectId },
    product_title: { type: String },
    product_id: { type: Schema.Types.ObjectId },
    product_color: { type: String },
    product_size: { type: String }, 
    product_img: { type: String },
	product_city: { type: String },
	product_time: { type: String },
    product_price: { type: Number },
    product_num: { type: Number },
    isComment: {  //是否已经评论过了
      type: Boolean,
      default: false
    },    
    add_time: {
      type: Number,
      default: d.getTime(),
    }
  });

  return mongoose.model('OrderItem', OrderItem, 'order_item');
};
