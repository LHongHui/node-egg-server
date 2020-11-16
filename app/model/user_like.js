module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    let d = new Date();

    const userLikeSchema = new Schema({
        userId: { type: Schema.Types.ObjectId }, // 用户id
        itemId: { type: Schema.Types.ObjectId }, // 商品id
        sort: { type: Number },
        status: { type: Number, default: 1 },
        add_time: {
            type: Number,
            default: d.getTime(),
        },
    });

    return mongoose.model('UserLike', userLikeSchema, 'user_like');
}