
/*
 表和表的关系:  一对一，一对多，多对多， 自关联

分类表:
  _id   title          pid
    1     手机          0
    2     电视          0
    3     笔记本        0
    4     iphone手机    1
    5     小米手机       1
    6     华为手机       1
    7     iphone7        4
    8     iphone11       4
    9      TCL电视       2
    10     索尼电视      2

*/
module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;

    var d = new Date();
    const GoodsCateSchema = new Schema({
        title: { type: String }, // 分类标题
        cate_img: { type: String }, //分类图像
        pid: {   // 父级的 _id 编号
            type: Schema.Types.Mixed  //混合类型 
        },
        //sub_title: { type: String },          /*seo相关的标题  关键词  描述*/
        //keywords: { type: String },
        //description: { type: String },
        status: { type: Number, default: 1 }, // 商品分类的状态 0 停用，1启用
        sort: { type: Number, default: 100 }, //排序
        add_time: {                           // 添加时间
            type: Number,
            default: d.getTime()
        }

    });

    return mongoose.model('GoodsCate', GoodsCateSchema, 'goods_cate');
}
