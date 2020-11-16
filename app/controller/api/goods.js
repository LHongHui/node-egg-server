'use strict';
var BaseController = require('../admin/base.js');
class GoodsController extends BaseController {
    // 轮播图方法
    async carousels() {
        var results = await this.ctx.model.Focus.find({}).sort({ "sort": -1 });
        if (results.length > 0) {
            this.ctx.body = {
                "success": true,
                "message": "OK",
                "data": results
            };
        } else {
            this.ctx.body = {
                "success": false,
                "message": "没有查询到轮播图",
                "data": []
            };
        }
    }
    // 推荐商品的方法
    /*async recommend() {
        var type = this.ctx.params.type  // is_best,is_hot,is_new
        console.log(this.ctx.params)
        var results = await this.ctx.model.Goods.find({ [type]: 1 }).sort({ "sort": -1 });
        if (results.length > 0) {
            this.ctx.body = {
                "success": true,
                "message": "OK",
                "data": results
            };
        } else {
            this.ctx.body = {
                "success": false,
                "message": "没有查询到内容",
                "data": []
            };
        }
    }*/
    async recommend() {
        var type = this.ctx.params.type  // is_best,is_hot,is_new

        // 1. 动态当前页
        var page = this.ctx.request.query.page || 1; // 当前页page 重要

        // 2. 每页显示条数
        var pageSize = 4;
        // 3. 总条数
        var totals = await this.ctx.model.Goods.find({ [type]: 1 }).count();
        // 4. 总页数
        var totalPages = Math.ceil(totals / pageSize);
        // 5.每页开始的编号
        var offset = (page - 1) * pageSize;
        //  
        //  // 分页   skip(offset).limit(pageSize)
        var results = await this.ctx.model.Goods.find({ [type]: 1 }).skip(offset).limit(pageSize).sort({ "sort": -1 });

        console.log(results);

        if (results.length > 0) {
            this.ctx.body = {
                "success": true,
                "message": "OK",
                "data": results,
                "totals": totals
            };
        } else {
            this.ctx.body = {
                "success": false,
                "message": "没有查询到内容",
                "data": []
            };
        }
    }
    // 产品详情页的方法   ?itemId=5f617b9ebb4df9a9f4d90895
    async goodsDetail() {
        const { ctx } = this
        var itemId = this.ctx.query.itemId;

        var result = await this.ctx.model.Goods.find({ "_id": itemId }).sort({ "sort": -1 });
        if (result.length > 0) {
            // 获取当前商品的颜色（将字符串转数组）
            // 5bbb68dcfe498e2346af9e4a,5bbb68effe498e2346af9e4b,5bc067d92e5f889dc864aa96


            if (result[0].goods_color.length > 0) {
                const colorArrTemp = result[0].goods_color.split(',');
                // console.log(colorArrTemp);
                const goodsColorArr = [];

                colorArrTemp.forEach(value => {
                    goodsColorArr.push({ _id: value });
                });
                var goodsColorResult = await this.ctx.model.GoodsColor.find({
                    $or: goodsColorArr,
                });
            } else {
                var goodsColorResult = [];
            }
			
			
			 //演出地点
			if (result[0].goods_city.length > 0) {
				var goodsCityResult = result[0].goods_city.split(',');
			} else {
				var goodsCityResult = [];
			}
			//演出场次
			if (result[0].goods_time.length > 0) {
				var goodsTimeResult = result[0].goods_time.split(',');
			} else {
				var goodsTimeResult = [];
			}
			//演出票档
			if (result[0].goods_price.length > 0) {
				var goodsPriceResult = result[0].goods_price.split(',');
			} else {
				var goodsPriceResult = [];
			}
			//演出位置定位
			if (result[0].goods_location.length > 0) {
				var goodsLocationResult = result[0].goods_location.split(',');
			} else {
				var goodsLocationResult = [];
			}


            // 获取当前商品的尺寸（将字符串转数组）
            // 5bbb68dcfe498e2346af9e4a,5bbb68effe498e2346af9e4b,5bc067d92e5f889dc864aa96


            if (result[0].goods_size.length > 0) {
                const sizeArrTemp = result[0].goods_size.split(',');
                // console.log(colorArrTemp);
                const goodsSizeArr = [];

                sizeArrTemp.forEach(value => {
                    goodsSizeArr.push({ _id: value });
                });
                var goodsSizeResult = await this.ctx.model.GoodsSize.find({
                    $or: goodsSizeArr,
                });
            } else {
                var goodsSizeResult = [];
            }
            var goodsImageResult = await this.ctx.model.GoodsImage.find({ "goods_id": itemId }).sort({ "sort": -1 });

            // 评论接口：
            let pageSize = 10
            let page = ctx.query.page || 1
            let skip = (page - 1) * pageSize
            const comment = await ctx.model.Comment.aggregate([
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
                        "cid": this.app.mongoose.Types.ObjectId(itemId)
                    },
                },
                {
                    $skip: skip
                },
                {
                    $limit: pageSize
                }

            ])
            const totals = await ctx.model.Comment.find({ cid: itemId }).countDocuments()
            if (comment.length) {
                comment.forEach(item => {
                    if (item.anonymous) {
                        item.nickname = '匿名人士'
                        delete item.comment_uid
                        delete item.user
                        item.comment_avatar = 'http://img4.imgtn.bdimg.com/it/u=198369807,133263955&fm=27&gp=0.jpg'
                    }
                })
            }

            this.ctx.body = {
                "success": true,
                "message": "OK",
                "data": {
                    "productone": result[0],
                    "goodsImageResult": goodsImageResult, //图库
                    "colorResult": goodsColorResult,// 可选的颜色的信息
                    "sizeResult": goodsSizeResult,//可选的尺寸的信息 
					"cityResult": goodsCityResult,
					"timeResult": goodsTimeResult,
					"priceResult": goodsPriceResult,
					"locationResult": goodsLocationResult,
                    comment,
                    totals
                },

            };
        } else {
            this.ctx.body = {
                "success": false,
                "message": "没有查询到具体商品",
                "data": []
            };
        }
    }
    // 获得所有分类名称信息的方法
    async goodsCats() {
        var results = await this.ctx.model.GoodsCate.find({}).sort({ "sort": -1 });
        if (results.length > 0) {
            this.ctx.body = {
                "success": true,
                "message": "OK",
                "data": results
            };
        } else {
            this.ctx.body = {
                "success": false,
                "message": "没有查询分类内容",
                "data": []
            };
        }
    }
    // 通过分类_id ,找对应的商品  ?catId=5f5ac82786f8bb2be06ac763
    async goodsByCat() {
        var catId = this.ctx.query.catId;
        var results = await this.ctx.model.Goods.find({ "cate_id": catId }).sort({ "sort": -1 });
        if (results.length > 0) {
            this.ctx.body = {
                "success": true,
                "message": "OK",
                "data": results
            };
        } else {
            this.ctx.body = {
                "success": 0,
                "message": "没有查询分类对应的商品",
                "data": []
            };
        }
    }
    // 商品搜索方法  ?keyword=帽子
    async search() {
        var keyword = this.ctx.request.query.keyword;
        var orderBy = this.ctx.request.query.orderBy;
        // 注意: 模糊查询 ,  new RegExp(keyword) ,keyword变量 .  reg =/羽绒服/ 不能传变量 
        var json = {};
        if (keyword) {   //{title:{$regex:/羽绒裤/}}     
            json = Object.assign({ title: { $regex: new RegExp(keyword) } });
        }

        if (orderBy) {
            // orderBy: is_new 最新商品,click_count 销量, shop_price 价格 排序    
            var results = await this.ctx.model.Goods.find(json).sort({ [orderBy]: -1 });
        } else {

            var results = await this.ctx.model.Goods.find(json).sort({ sort: -1 });
        }
        if (results.length > 0) {
            this.ctx.body = {
                "success": true,
                "message": "OK",
                "data": results
            };
        } else {
            this.ctx.body = {
                "success": false,
                "message": "没有查询内容",
                "data": []
            };
        }
    }

    strToArray(str) {

        try {
            let tempIds = [];
            if (str) {
                const idsArr = str.split(',');
                if (idsArr[idsArr.length - 1] == '') {
                    idsArr.pop();
                }
                for (let i = 0; i < idsArr.length; i++) {
                    tempIds.push({
                        _id: idsArr[i],
                    });
                }

            } else {
                tempIds = [{ 1: -1 }];

            }
            return tempIds;


        } catch (error) {
            return [{ 1: -1 }]; // 返回一个不成立的条件
        }


    }
    async getColorSize() {
        var colorResult = await this.ctx.model.GoodsColor.find({});
        var sizeResult = await this.ctx.model.GoodsSize.find({});
        this.ctx.body = {
            "success": true,
            "message": "OK",
            colorResult,
            sizeResult
        };
    }
    // 通过多个 itemIds 找多个商品
    async getGoods() {
        // itemIds=5f5ac82786f8bb2be06ac763,5f5ac82786f8bb2be06ac111,5f5ac82786f8bb2be06ac333
        var itemIds = this.ctx.request.query.itemIds; //转成二维数组
        var goodsIds = this.strToArray(itemIds);
        console.log(goodsIds)
        var results = await this.ctx.model.Goods.find({
            $or: goodsIds,    // $or:[{_id:xxx1},{_id:xxxx2}]
        }).sort({ "sort": -1 });
        if (results.length > 0) {

            this.ctx.body = {
                "success": true,
                "message": "OK",
                "data": results,

            };
        } else {
            this.ctx.body = {
                "success": true,
                "message": "没有查询到具体商品",
                "data": []
            };
        }
    }


    async catesAndGoods() {
        var results = await this.ctx.model.GoodsCate.aggregate([
            {
                $lookup: {
                    from: 'goods',
                    localField: '_id',
                    foreignField: 'cate_id',
                    as: 'goodsList'
                }
            },
            {
                $sort: {
                    'sort': -1
                }
            }
        ])
        console.log(results);
        if (results.length > 0) {
            this.ctx.body = {
                "success": true,
                "massage": "OK",
                "data": results
            }
        }


    }
    // getImageStore
    async getImageStore() {
        var _id = this.app.mongoose.Types.ObjectId(this.ctx.query._id);
        var goodsId = this.app.mongoose.Types.ObjectId(this.ctx.query.goodsId);
        //console.log(_id, goodsId);
        //await this.ctx.model.Goods.find(json)
        var results = await this.ctx.model.GoodsImage.find({ color_id: _id, goods_id: goodsId }).sort({ "sort": -1 });
        if (results.length > 0) {
            this.ctx.body = {
                "success": true,
                "message": "OK",
                "data": results
            };
        } else {
            this.ctx.body = {
                "success": 0,
                "message": "没有查询分类对应的图库",
                "data": []
            };
        }
    }
}

module.exports = GoodsController;
