module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const SettingSchema = new Schema({
    site_title: { type: String },
    site_logo: { type: String },
    site_keywords: {
      type: String,
    },
    site_description: {
      type: String,
    },
    no_picture: {
      type: String,
    },
    site_icp: {
      type: String,
    },
    site_tel: {
      type: String,
    },
    search_keywords: {
      type: String,
    },
    tongji_code: {
      type: String,
    },

  });

  return mongoose.model('Setting', SettingSchema, 'setting');
};
