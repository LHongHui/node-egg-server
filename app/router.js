'use strict';
module.exports = app => {
  require('./router/admin')(app);
  require('./router/api')(app);
};
