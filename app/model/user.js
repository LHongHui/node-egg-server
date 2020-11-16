module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;

    const UserSchema = new Schema({
        username: { type: String },
        nickname: { type: String },
        password: { type: String },
        phone: { type: String },
        email: { type: String },
        gender: {
            type: String,
            default: '男', //默认值
            enum: ['男', '女', '保密']
        },
        avatar: {
            type: String,
            default: '/public/user.jpg'
        },
        year: {  // 年
            type: Number,
            default: new Date().getFullYear()
        },
        month: { // 月
            type: Number,
            default: new Date().getMonth() + 1
        },
        day: {   // 日
            type: Number,
            default: new Date().getDate()
        },
        add_time: { // 时间戳
            type: Number,
            default: +new Date()
        },
    });

    return mongoose.model('User', UserSchema, 'user');
}