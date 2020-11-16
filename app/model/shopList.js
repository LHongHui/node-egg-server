// 购物车表
module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;

    const ShopListSchema = new Schema({
        uid: String,    // 用户的id
        market_price: Number,   // 单个商品价格
        size: String,
        color: String,
		city: String,
		time: String,
		price: String,
        id: String,    // 商品的id
        goods_img: String, // 商品的图片
        title: String,       // 名称
        mallPrice: Number,  // 总价
        add_time: {         // 加入购物车时间
            type: Number,
            default: +new Date(),
        },
        check: {        // 是否选中
            type: Boolean,
            default: false
        },
        num: {        // 商品数量
            type: Number,
            default: 1
        }
    });

    return mongoose.model('ShopList', ShopListSchema, 'shopList');
}