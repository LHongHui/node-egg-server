'use strict';
// 用户相关操作
const BaseController = require('../admin/base')
const md5 = require('md5')
class UserController extends BaseController {


    // 用户登录
    async login() {
        const { ctx } = this
        const { phone, password, verify } = ctx.request.body
        if (!phone || !password) {
            return ctx.body = {
                code: -1,
                message: '请输入完整信息'
            }
        }
        console.log(this.ctx.session.code)
        if (this.ctx.session.code.toUpperCase() !== verify.toUpperCase()) {
            return ctx.body = {
                code: -2,
                message: '验证码错误'
            }
        }
        let data = await ctx.model.User.findOne({ phone })
		console.log("data:"+data);
        if (data) {
            //登录
            if (data.password != md5(password)) {
                return ctx.body = {
                    code: -3,
                    message: '密码错误'
                }
            } else {
                if (this.ctx.session.code.toUpperCase() !== verify.toUpperCase()) {
                    return ctx.body = {
                        code: -2,
                        message: '验证码错误'
                    }
                } else {
                    // 登录的
                    //ctx.session.userInfo = data
                    // Token
                    let userToken = {
                        _id: data._id,
                        username: data.username
                    }
                    const token = await this.service.jwt.setToken(userToken)
                    let userInfo = {
                        avatar: data.avatar,
                        day: data.day,
                        gender: data.gender,
                        month: data.month,
                        nickname: data.nickname,
                        username: data.username,
                        year: data.year,
                        _id: data._id
                    }

                    ctx.body = {
                        code: 200,
                        message: '登录成功',
                        userInfo,
                        token

                    }
                }
            }

        } else {
            //注册
            let username = this.ctx.helper.random(15)   // 获取用户名
            let user = new ctx.model.User({
                phone,
                username,
                password: md5(password)
            })
            let data2 = await user.save()
			console.log("注册："+data2);
            //ctx.session.userInfo = user
            // Token
            let userToken = {
                _id: data2._id,
                name: data2.username
            }
            const token = await this.service.jwt.setToken(userToken)
            let userInfo = {
                avatar: user.avatar,
                day: user.day,
                gender: user.gender,
                month: user.month,
                nickname: user.nickname,
                username: user.username,
                year: user.year,
                _id: data2._id
            }
            ctx.body = {
                code: 200,
                userInfo,
                message: '注册成功',
                token
            }
        }
    }


    // 退出登录
    async loginOut() {
        let userToken = {};
        this.app.jwt.sign({ userToken }, this.app.config.secret, {
            expiresIn: -1,
        });

        this.ctx.body = {
            code: 0
        }
    }


    // 用户查询
    async queryUser() {
        let _id = this.ctx.request.query._id;
        // let _id = this.ctx.session.userInfo._id;
        let userInfo = await this.ctx.model.User.findById(_id)
        if (!userInfo) {
            this.ctx.body = {
                success: false,
                message: '用户查询失败'
            }
            return
        }
        this.ctx.body = {
            success: true,
            message: '用户查询成功',
            code: 200,
            userInfo
        }
    }

    // 修改保存用户
    async saveUser() {
        const data = this.ctx.request.body
        if (data.avatar) {  //判断是否修改头像
            let { saveDir } = await this.service.tools.getUploadFile2(data.avatar)
            data.avatar = saveDir  // 上传的base64新头像

        }
        await this.ctx.model.User.updateOne({ '_id': data.id }, data)

        let user = await this.ctx.model.User.findById(data.id)
        this.ctx.body = {
            code: 200,
            message: '更改成功',
            user
        }


    }

    // 用户收藏商品: userLike 中的添加操作   /item/like
    async userLike() {
        const { ctx } = this
        let userId = this.ctx.request.query._id;
        var itemId = ctx.request.query.itemId;
        const userLikeModel = new ctx.model.UserLike({
            userId,
            itemId
        });
        // 保存用户
        const userLikeResult = await userLikeModel.save();
        if (userLikeResult) {
            ctx.body = {
                "success": true,
                "message": "收藏成功"
            };
        }
    }

    // 用户取消收藏商品  /item/unlike
    async userunLike() {
        const { ctx } = this
        var userId = this.ctx.request.query._id;
        var itemId = ctx.request.query.itemId;
        var delResult = await this.ctx.model.UserLike.deleteOne({ "userId": userId, "itemId": itemId });
        if (delResult) {
            ctx.body = {
                "success": true,
                "message": "取消收藏"
            };
        } else {
            ctx.body = {
                "success": false,
                "message": "取消收藏失败"
            };
        }
    }

    // 查询用户是否收藏商品  /item/userIsLikeItem

    async userIsLike() {
        const { ctx } = this

        var userId = this.ctx.request.query._id;
        var itemId = ctx.request.query.itemId;
        var results = await this.ctx.model.UserLike.find({ "userId": userId, "itemId": itemId });
        if (results.length) {
            ctx.body = {
                "success": true,
                "message": "收藏过",
            };
        } else {
            ctx.body = {
                "success": false,
                "message": "未收藏",
            };
        }
    }


    //查询当前用户所有收藏的商品：http://localhost:3000/items/goodsFavList

    async goodsFavList() {
        const { ctx } = this
        var userId = this.ctx.request.query._id;
        // 1. 动态当前页
        var page = this.ctx.request.query.page || 1; // 当前页page 重要
        // 2. 每页显示条数
        var pageSize = 6;
        // 3. 总条数
        var totals = await this.ctx.model.UserLike.find({ userId: userId }).count();
        // 4. 总页数
        //var totalPages = Math.ceil(totals / pageSize);
        // 5.每页开始的编号
        var offset = (page - 1) * pageSize;
        //  // 分页   skip(offset).limit(pageSize)
        var resultitemIds = await this.ctx.model.UserLike.find({ userId: userId }).skip(offset).limit(pageSize).sort({ "sort": -1 });
        console.log(resultitemIds);
        if (resultitemIds.length) {
            console.log(111)
            var goodsIds = [];
            for (let i = 0; i < resultitemIds.length; i++) {
                goodsIds.push({
                    _id: resultitemIds[i].itemId  // 获得 userId 用户收藏的 商品编号 itemId
                });
            }
            if (!goodsIds) {
                return;
            }
            var results = await this.ctx.model.Goods.find({
                $or: goodsIds,    // $or:[{_id:xxx1},{_id:xxxx2}]
            }).sort({ "sort": -1 });
        } else {
            var results = [];
        }
        if (results.length) {
            ctx.body = {
                "success": true,
                "message": "OK",
                "data": results,
                "totals": totals
            };
        } else {
            ctx.body = {
                "success": false,
                "message": "没有查询到内容",
                "data": []
            };
        }
    }
	

    // 商品评论
    async comment() {
        const data = this.ctx.request.body
        const { ctx } = this
        console.log(data);
        // data.id  商品id,data.content评价内容
        if (!data.id || !data.content) {

            return
        }
        const uid = this.ctx.request.body.uid; // 评价人的id信息
        const _id = this.ctx.request.body._id; // 订单详情_id
        // 评论有没有上传图片
        let images = []
        if (data.image.length) {
            for (let i = 0; i < data.image.length; i++) {
                let img = await this.service.tools.getUploadFile2(data.image[i])
                images[i] = img.saveDir
            }
        }
        const datas = {
            comment_uid: uid,
            cid: data.id,
            comment_time: ctx.helper.formatTime(new Date(), 'YYYY-MM-DD HH:mm:ss'),   // 评论创建时间,
            rate: data.rate,
            anonymous: data.anonymous,
            content: data.content,
            images
        }
        const comment = new ctx.model.Comment(datas)
        let res = await comment.save()
        // 删除需要评论的那条数据或者把是否已经评论的状态改变(这里是改变状态)
        // 1，查到对应的订单,直接修改
        await ctx.model.OrderItem.findOneAndUpdate({ uid: uid, _id: _id }, {
            $set: {
                'isComment': true
            }
        })

        if (res) {
            ctx.body = {
                "success": true,
                "message": "添加评论成功"
            };
        }

    }

    // 查询已经评价的商品
    async alreadyEvaluated() {
        const { ctx } = this
        const uid = this.ctx.request.query._id;
        console.log(uid);
        let pageSize = 10
        let page = ctx.query.page || 1
        let skip = (page - 1) * pageSize
        const alreadyEvaluated = await ctx.model.Comment.aggregate([
            {
                $lookup: {
                    from: "goods",
                    localField: "cid",
                    foreignField: "_id",
                    as: "goodList"
                }
            },
            {
                $match: {
                    comment_uid: this.app.mongoose.Types.ObjectId(uid),
                },
            },
            {
                $sort: { comment_time: -1 }
            },
            {
                $skip: skip
            },
            {
                $limit: pageSize
            }

        ])
        const totals = await ctx.model.Comment.find({ comment_uid: uid }).countDocuments()
        ctx.body = {
            success: true,
            message: '已经评论数据',
            data: {
                totals,
                page,
                list: alreadyEvaluated
            }
        }
    }
    // 查询待评价的商品
    async tobeEvaluated() {
        const { ctx } = this

        let pageSize = 6
        let page = ctx.query.page || 1
        let skip = (page - 1) * pageSize
        let order_status = 4
        var userId = this.app.mongoose.Types.ObjectId(ctx.request.query._id);
        var json = {
            uid: userId,
            order_status
        }
        const res = await ctx.model.Order.aggregate([

            {
                $lookup: {  // 两表联合 jion
                    from: 'order_item',
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'orderList',
                },
            },
            {
                $match: json   // where查询条件 模糊查询
            },
            {
                $sort: { "add_time": -1 }
            }

        ]);

        let eva = []
        res.forEach(item => {
            item.orderList.forEach(v => {
                if (!v.isComment) {
                    eva.push(v)
                }
            })
        })

        var json2 = {
            uid: userId,
            order_status
        }
        const res2 = await ctx.model.Order.aggregate([

            {
                $lookup: {  // 两表联合 jion
                    from: 'order_item',
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'orderList',
                },
            },
            {
                $match: json2   // where查询条件 模糊查询
            },
            // {     // 难点难道：新字段orderList 中  isComment 是 false 的数据过滤
            //     $project: {
            //         orderList: {
            //             $filter: {
            //                 input: "$orderList",
            //                 as: "item",
            //                 cond: { $eq: ["$$item.isComment", false] }
            //             }
            //         }
            //     }
            // },
            {
                $skip: skip
            },
            {
                $limit: pageSize
            },
            {
                $sort: { "add_time": -1 }
            }

        ]);
        let eva2 = []
        res2.forEach(item => {
            item.orderList.forEach(v => {
                if (!v.isComment) {
                    eva2.push(v)
                }
            })
        })
        ctx.body = {
            success: true,
            message: '未评价',
            code: 200,
            data: {
                list: eva2,
                page,
                count: eva.length
            }
        }
    }

    // 查询单条 评价详情
    async evaluateOne() {
        const { ctx } = this
        const evaluateOne = await ctx.model.Comment.aggregate([
            {
                $lookup: {
                    from: "goods",
                    localField: "cid",
                    foreignField: "_id",
                    as: "goods"
                }
            },
            {
                $lookup: {
                    from: "user",
                    localField: "comment_uid",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $match: {
                    '_id': this.app.mongoose.Types.ObjectId(ctx.request.body._id)
                },
            },
        ])

        ctx.body = {
            success: true,
            message: '查询评论信息',
            data: evaluateOne[0],
        }
    }
    // 购物车接口：
    // 获得购物车：
    async getShop() {
        let userId = this.ctx.request.query._id;   // 用户id
        const { ctx } = this

        if (userId) {
            const goodsData = await ctx.model.ShopList.find({ uid: userId })
            var totalNumber = 0;
            if (goodsData) {
                for (var k in goodsData) {
                    totalNumber += goodsData[k].num
                }
                ctx.body = {
                    "success": true,
                    "message": "OK",
                    "data": goodsData,
                    "totalNumber": totalNumber
                };
            } else {
                ctx.body = {
                    "success": false,
                    "message": "没有商品",
                    "data": [],
					"totalNumber": 0
                };
            }
        } else {
            ctx.body = {
                "success": false,
                "message": "查询购物车商品失败,请登录",
                "data": []
            };
        }

    }
    // 加入购物车
    async addShop() {
        const { id } = this.ctx.request.body
        const { size } = this.ctx.request.body
        const { color } = this.ctx.request.body
		const { city } = this.ctx.request.body
		const { time } = this.ctx.request.body
		const { price } = this.ctx.request.body
        const { num } = this.ctx.request.body
        const { check } = this.ctx.request.body
        const { ctx } = this
        console.log(this.ctx.request.body);
        let _id = this.ctx.request.query._id;   // 用户id
        if (!ctx.request.body.id) {
            return
        }
        const goodsData = await ctx.model.ShopList.findOne({ id: id, uid: _id, size, color, city, time, price })

        // 购物车已经有了这条商品，商品默认+1
        if (goodsData) {
            await ctx.model.ShopList.findOneAndUpdate({ id: id, uid: _id, size, color, city, time, price }, {
                $set: {
                    num: goodsData.num += parseInt(num),
                    mallPrice: goodsData.market_price * goodsData.num,
                    check: check
                }
            })
        } else {  // 说明没有这条数据
            // 查到这条商品数据
            let goods = await ctx.model.Goods.findOne({ _id: id })
            console.log(goods);
            let newGoods = new ctx.model.ShopList({
                uid: _id,
                market_price: goods.market_price,
                id: goods.id,
                goods_img: goods.goods_img,
                title: goods.title,
                mallPrice: goods.market_price * parseInt(num),
                check: check,
                num: num,
                color: color,
                size: size,
				city: city,
				time: time,
				price: price,
                add_time: +new Date()
            })
            await newGoods.save()
        }
        ctx.body = {
            success: true,
            message: '添加购物车'
        }
    }

    // 购物车增加减少
    async editCart() {
        const data = this.ctx.request.body
        let uid = this.ctx.request.query._id;
        const { ctx } = this
        if (!data) {

            return
        }
        let goods = await ctx.model.Goods.findOne({ _id: data.id })
        await ctx.model.ShopList.findOneAndUpdate({ uid: uid, id: data.id, color: data.color, size: data.size, city: data.city, time: data.time, price: data.price }, {
            $set: {
                'num': data.num,
                'mallPrice': goods.market_price * parseInt(data.num),
                'check': data.check
            }
        })
        ctx.body = {
            success: true,
            message: '购物车修改成功'
        }
    }

    // 购物车删除
    async deleteShop() {
        const data = this.ctx.request.body
        let uid = this.ctx.request.query._id;
        console.log(data, uid);
        if (!data) {
            this.error('缺少重要参数')
            return
        }
        const { ctx } = this
        await ctx.model.ShopList.deleteMany({ uid: uid, id: data.id, color: data.color, size: data.size, city: data.city, time: data.time, price: data.price })
        ctx.body = {
            success: true,
            message: '购物车删除成功'
        }

    }


    // 查询用户收货地址
    async getAddress() {
        const { ctx } = this
        const _id = this.ctx.request.query.uid
        const address = await ctx.model.Address.find({ uid: _id })
        ctx.body = {
            success: true,
            message: '查询用户收货地址',
            address
        }
    }

    // 查询默认收货地址
    async getDefaultAddress() {
        const { ctx } = this
        const _id = this.ctx.request.query.uid
        const defaultAdd = await ctx.model.Address.findOne({ uid: _id, isDefault: true })
        ctx.body = {
            success: true,
            message: '查询默认收货地址',
            defaultAdd
        }
    }

    async setDefaultAddress() {
        const { ctx } = this
        const _id = this.ctx.request.query.uid
        const { id } = ctx.request.body
        await ctx.model.Address.updateMany({ uid: _id, isDefault: true }, {
            $set: {
                'isDefault': false,
            }
        })

        await ctx.model.Address.findOneAndUpdate({ uid: _id, _id: id }, {
            $set: {
                'isDefault': true,
            }
        })

        ctx.body = {
            success: true,
            message: '设置默认地址成功'
        }
    }


    // 保存收货地址
    async address() {
        const { ctx } = this
        const data = ctx.request.body
        if (!data) {
            this.error('缺少重要参数')
            return
        }
        const _id = ctx.request.body.uid
        if (data.isDefault == true) {   // 设置默认地址
            await ctx.model.Address.updateMany({ uid: _id, isDefault: true }, {
                $set: {
                    'isDefault': false,
                }
            })
        }

        if (data.id) {    // 说明是更新地址
            await ctx.model.Address.updateOne({ _id: data.id, uid: _id }, data)
            ctx.body = {
                success: true,
                message: '修改地址成功'
            }

        } else {  // 新增地址
            const datas = Object.assign(data, {
                uid: _id,
                add_time: +new Date()
            })
            const address = new ctx.model.Address(datas)
            await address.save()
            // 保存后查询一次
            const addressDef = await ctx.model.Address.find({ uid: _id })
            if (addressDef.length == 1) { // 如果数据库只有1条，设置这一条为默认地址
                if (!addressDef.isDefault) {
                    await ctx.model.Address.findOneAndUpdate({ uid: _id, _id: addressDef[0]._id }, {
                        $set: {
                            'isDefault': true
                        }
                    })
                }
            }
            ctx.body = {
                success: true,
                message: '添加地址成功'
            }
        }
    }

    // 删除单条收货地址
    async deleteAddress() {
        const { ctx } = this
        const { id } = ctx.request.body
        if (!id) {
            this.error('缺少重要参数id')
            return
        }
        const _id = this.ctx.request.query.uid
        await this.ctx.model.Address.findOneAndDelete({ '_id': id, uid: _id })
        ctx.body = {
            success: true,
            message: '删除单条收货地址'
        }
    }

    /**订单处理 =====================================================================*/
    itemToArray(itemStr) {
        var items = itemStr.split(','); // [1001|5|绿色|l,2000|3|红色|s,3043|2||蓝色|m]
        items.pop();
        var itemsObj = [];  // [{_id:1001,num:5,color:'绿色',size:'l'},{_id:2000,num:3}]
        for (var k in items) {
            var itemOne = items[k].split('|');
            itemsObj.push(
                {
                    _id: itemOne[0],
                    num: itemOne[1],
                    color: itemOne[2],
                    size: itemOne[3],
					city: itemOne[4],
					time: itemOne[5],
					price: itemOne[6],
                }
            )
        }
        return itemsObj;
    }
    async order() {
        const { ctx } = this;
        const uid = ctx.request.body.userId;
        const itemStr = ctx.request.body.itemStr;
        const addressId = ctx.request.body.address;
        const idDirect = ctx.request.body.idDirect;
		const freight = ctx.request.body.freight;
		const discount = ctx.request.body.discount;
        //idDirect 是true
        // 立即购买的生成的订单
        // 与 shopList 没关系

        // 否则idDirect 是 undefined
        // 购物车过来的生成订单，
        // 删除shopList 中的对应的商品

        //itemStr=1001|5|color|size,1002|3
        let addressResult = await ctx.model.Address.find({ "uid": uid, _id: addressId });
        var cartList = this.itemToArray(itemStr); // 订单多个商品对象信息
        console.log(addressResult, cartList);
        if (addressResult && addressResult.length > 0 && cartList && cartList.length > 0) {
            var mallPrice = 0;

            var orderList = [];
            for (var k in cartList) {
                var resultOne = await ctx.model.Goods.find({ _id: this.app.mongoose.Types.ObjectId(cartList[k]._id) });
                console.log(resultOne);
                if (resultOne) {
                    // mallPrice += resultOne[0].market_price * parseInt(cartList[k].num);
					mallPrice += cartList[k].price * parseInt(cartList[k].num);

                    orderList.push({
                        _id: resultOne[0]._id,
                        title: resultOne[0].title,
                        goods_img: resultOne[0].goods_img,
                        market_price: resultOne[0].market_price,
                        num: cartList[k].num,
                        color: cartList[k].color,
                        size: cartList[k].size,
						city: cartList[k].city,
						time: cartList[k].time,
						price: cartList[k].price
                    })
                    // 删除购物车列表的商品
                    // 否则idDirect 是 undefined
                    // 购物车过来的生成订单，
                    // 删除shopList 中的对应的商品
                    //console.log(idDirect);
                    if (!idDirect) {
                        await ctx.model.ShopList.deleteMany({ uid, id: cartList[k]._id, color: cartList[k].color, size: cartList[k].size, city: cartList[k].city, time: cartList[k].time, price: cartList[k].price })
                    }
                }
            }
            console.log(orderList);
            //执行提交订单的操作
            // 生成订单号算法
            let order_id = await this.service.tools.getOrderId()

            let name = addressResult[0].name;
            let tel = addressResult[0].tel;
            let address = addressResult[0].address;
            let pay_status = 0;
            let order_status = 0; // 0,待付款 1，待发货 2，待收货 3，评价 4，已完成

            let orderModel = new ctx.model.Order({
                order_id,
                uid,
                name,
                tel,
                address,
                pay_status,
                order_status,
                mallPrice,
				freight,
				discount
            });
            let orderResult = await orderModel.save();

            if (orderResult && orderResult._id) {
                //增加商品信息
                for (let i = 0; i < orderList.length; i++) {
                    let json = {
                        "uid": uid,
                        "order_id": orderResult._id,   //订单id
                        "product_title": orderList[i].title,
                        "product_id": orderList[i]._id,
						"product_color": orderList[i].color,
						"product_size": orderList[i].size,
                        "product_img": orderList[i].goods_img,
						"product_city": orderList[i].city,
						"product_time": orderList[i].time,
                        "product_price": orderList[i].price,
                        "product_num": orderList[i].num
                    }

                    let orderItemModel = new ctx.model.OrderItem(json);
                    await orderItemModel.save();

                }

                ctx.body = {
                    success: true,
                    message: '生成订单成功',
                    data: {
                        orderId: orderResult.order_id,

                    }
                };
            } else {
                ctx.body = {
                    success: false,
                    message: '失败',
                    data: []
                };
            }
        } else {
            ctx.body = {
                success: false,
                message: '失败',
                data: []
            };
        }
    }

    // 查询用户订单
    async myOrder() {
        const { ctx } = this;
        var userId = this.app.mongoose.Types.ObjectId(ctx.request.query.uid);
        var json = {
            uid: userId,
        }
        var results = await ctx.model.Order.aggregate([

            {
                $lookup: {  // 两表联合 jion
                    from: 'order_item',
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'orderList',
                },
            },
            {
                $match: json   // where查询条件 模糊查询
            },
            {
                $sort: { "add_time": -1 }
            }

        ]);
        console.log(results);
        if (results.length > 0) {
            ctx.body = {
                "success": true,
                "message": "OK",
                list: results.reverse()
            };
        } else {
            ctx.body = {
                "success": false,
                "message": "没有查询到订单",
                list: []
            };
        }
    }
    // 查询用户订单数量
    async orderNum() {
        const { ctx } = this
        var userId = this.app.mongoose.Types.ObjectId(ctx.request.query.uid);
        var json = {
            uid: userId,
        }

        let num = [], num1 = [], num2 = [], num3 = [], numList = [], evaluate = [] // 待评价
        const res = await ctx.model.Order.aggregate([

            {
                $lookup: {  // 两表联合 jion
                    from: 'order_item',
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'orderList',
                },
            },
            {
                $match: json   // where查询条件 模糊查询
            },
            {
                $sort: { "add_time": -1 }
            }

        ]);
        // 0,待付款 1，待发货 2，待收货 3，已完成
        for (var i in res) {
            let item = res[i];
            if (item.order_status == 0) {
                num.push(item)
            } else if (item.order_status == 1) {
                num1.push(item)
            } else if (item.order_status == 2) {
                num2.push(item)
            } else if (item.order_status == 3) { // 订单完成后并且评论了
                num3.push(item)
            } else {   //4完成,就要统计待评价商品数量
                for (var k in item.orderList) {
                    //console.log(item.orderList[k].isComment);
                    if (!item.orderList[k].isComment) {
                        evaluate.push(item.orderList[k])// 待评价商品数量
                    }
                }
            }

        }
        numList.push(num.length, num1.length, num2.length, evaluate.length, num3.length)
        ctx.body = {
            success: true,
            message: '获得订单数量',
            code: 200,
            numList,
            res
        }
    }

    async confirm() {
        const { ctx } = this;
        var id = this.ctx.request.query.id;
        var uid = this.ctx.state.userId;
        console.log(id, uid)
        var orderResult = await this.ctx.model.Order.find({ uid, order_id: id });
        console.log(orderResult);
        if (orderResult && orderResult.length > 0) {
            //获取商品
            var orderItemResult = await this.ctx.model.OrderItem.find({ order_id: orderResult[0]._id });
            ctx.body = {
                success: true,
                message: '获得确认订单信息',
                code: 200,
                data: {
                    orderResult: orderResult[0],
                    orderItemResult: orderItemResult,
                    id: id
                }
            }


        } else {
            //错误
            ctx.body = {
                success: false,
                message: '获得确认订单信息失败',
                code: -1,
            }

        }

    }
	
	
	async addFoot(){
		let {ctx } = this
		let {_id} = this.ctx.request.body

		let userId = ctx.state.userId
		let exist = await this.ctx.model.Foot.find({userId:this.app.mongoose.Types.ObjectId(userId),itemId:this.app.mongoose.Types.ObjectId(_id)})
		if(exist){  // 如果存在  则删除
		await this.ctx.model.Foot.deleteOne({userId:this.app.mongoose.Types.ObjectId(userId),itemId:this.app.mongoose.Types.ObjectId(_id)})
		}
		const userLikeModel = new ctx.model.Foot({
		userId,
				itemId:_id,
				add_time:new Date().getTime()
		});
		const userLikeResult = await userLikeModel.save();
			if (userLikeResult) {
				ctx.body = {
				"success": true,
				"message": "收藏足迹成功"
				};
			}
		}
	
	async getFoot(){
		let {ctx} = this
		const foot = await ctx.model.Foot.aggregate([
			{
				$lookup: {
					from: "goods",
					localField: "itemId",
					foreignField: "_id",
					as: "goods"
				}
			},
			{
				$lookup: {
					from: "user",
					localField: "userId",
					foreignField: "_id",
					as: "foot"
				}
			},
			{
				$match: {
					userId: this.app.mongoose.Types.ObjectId(ctx.state.userId),
				},
			},
			{
				$sort: {
					'add_time': -1
				},
			},
		])

		ctx.body = {
			"success": true,
			"message": "获得足迹成功",
			"data":foot
		};
	}
	
}

module.exports = UserController;
