module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const d = new Date();
    const GoodsSchema = new Schema({
        title: { type: String, default: '' }, //商品标题
        cate_id: { type: Schema.Types.ObjectId },//商品分类_id
        click_count: { // 商品点击量
            type: Number,
            default: 100,
        },
        goods_number: {// 库存
            type: Number,
            default: 1000,
        },
        shop_price: {// 原价
            type: Number,
            default: 0,
        },
        market_price: {// 打折价
            type: Number,
            default: 0,
        },
        goods_attrs: {  // 商品属性: 尺寸和颜色...
            type: String,
            default: '',
        },
        goods_img: { // 封面图
            type: String,
            default: '',
        },
        goods_gift: {//赠品
            type: String,
            default: '',
        },
        goods_fitting: {//配件
            type: String,
            default: '',
        },
        goods_color: {//商品颜色
            type: String,
            default: '',
        },
        goods_size: {//商品尺寸
            type: String,
            default: '',
        },
        goods_keywords: {// 关键字
            type: String,
            default: '',
        },
        goods_desc: {// 描述
            type: String,
            default: '',
        },
        goods_content: {// 商品内容
            type: String,
            default: '',
        },
        sort: { type: Number, default: 100 },//排序
        is_delete: { // 是否删除
            type: Number,
        },
        is_hot: { // 是否是热卖商品
            type: Number,
            default: 0,
        },
        is_best: { // 是否是推荐商品
            type: Number,
            default: 0,
        },
        is_new: {// 是否是最新商品
            type: Number,
            default: 0,
        },
        goods_type_id: { // 商品类型编号
            type: Schema.Types.Mixed, // 混合类型
        },
        status: { type: Number, default: 1 }, //状态
        add_time: { // 添加的时间戳
            type: Number,
            default: d.getTime(),
        },
        goods_city: {
            type: String,
            default: '',
        },
        goods_time: {
            type: String,
            default: '',
        },
        goods_price: {
            type: String,
            default: '',
        },
        goods_position: {
            type: String,
            default: '',
        },
		goods_location: {
			type: String,
			default: '',
		}
    });
    return mongoose.model('Goods', GoodsSchema, 'goods');
};
