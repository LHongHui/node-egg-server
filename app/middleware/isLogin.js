const url = require('url')
// session方案
/* module.exports = (opt, app) => {
    return async function isLogin(ctx, next) {
         let pathname = url.parse(ctx.request.url).pathname;
        if (!ctx.session.userInfo) { // 没有登录
            if (pathname == '/api/loginOut' || pathname == '/api/login' || pathname == '/api/verify' || pathname == '/api/index/carousels' || pathname == '/api/index/items/is_best' || pathname == '/api/index/items/is_hot' || pathname == '/api/index/items/is_new' || pathname == '/api/items/searchById' || pathname == '/api/cats' || pathname == '/api/items/searchByCat' || pathname == '/api/index/search' || pathname == '/api/item/queryItems' || pathname == '/api/catesAndGoods')  {
                await next()
                return
            }
            ctx.status = 408;
            ctx.body = {
                message: 'session 失效请重新登录',
                code: -10003
            }
        } else {
            await next()
        }
    }
} */

// JWT方案
module.exports = (options, app) => {
    return async (ctx, next) => {
        let pathname = url.parse(ctx.request.url).pathname;
        // ctx.header.authorization
        let token = ctx.request.header['authorization'];//重要重要重要,拿到前端的token
        console.log(token);
        if (pathname == '/api/getColorSize' || pathname == '/api/getImageStore' || pathname == '/api/loginOut' || pathname == '/api/login' || pathname == '/api/verify' || pathname == '/api/index/carousels' || pathname == '/api/index/items/is_best' || pathname == '/api/index/items/is_hot' || pathname == '/api/index/items/is_new' || pathname == '/api/items/searchById' || pathname == '/api/cats' || pathname == '/api/items/searchByCat' || pathname == '/api/index/search' || pathname == '/api/item/queryItems' || pathname == '/api/catesAndGoods') {
            // 不需要用户操作的放行
            await next()
        } else {
            if (!token) {
                ctx.status = 401;
                ctx.body = {
                    success: false,
                    message: '没有token',
                    code: -10000
                }
                return;
            } else {
                let decode = app.jwt.verify(token, app.config.secret);
                console.log(decode);
                let username = decode.userToken.username
                console.log(username);
                let hasUser = await ctx.model.User.findOne({ username })
                console.log(hasUser);
                if (hasUser) {
                    ctx.state.userId = decode.userToken._id; //重要重要定义token解码后的用户id存为全局变量
                    await next()
                } else {
                    ctx.status = 401;
                    ctx.body = {
                        success: false,
                        message: '登录过期，请重新登录',
                        code: -10001
                    };
                }

            }
        }
    };
};

