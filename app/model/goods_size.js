module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;


  const GoodsSizeSchema = new Schema({
    size_name: { type: String },
    size_value: { type: String },
    status: { type: Number, default: 1 },

  });

  return mongoose.model('GoodsSize', GoodsSizeSchema, 'goods_size');
};
