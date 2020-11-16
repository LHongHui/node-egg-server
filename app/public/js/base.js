var app = {
	toggle: function (el, collectionName, attr, id) {
		/* el, img(this)节点 
		   collectionName, 集合名称(比如 GoodsCate)
		   attr,  字段操作(比如 status 状态字段)
		   id  当前数据的id
		
		*/
		$.get('/admin/changeStatus', { collectionName: collectionName, attr: attr, id: id }, function (data) {
			if (data.success) {
				if (el.src.indexOf('yes') != -1) {
					el.src = '/public/images/no.gif';
				} else {
					el.src = '/public/images/yes.gif';
				}
			}
		})

	},
	editNum: function (el, collectionName, attr, id) {
        /* el, span(this)节点 
		   collectionName, 集合名称(比如 GoodsCate)
		   attr,  字段操作(比如 status 状态字段)
		   id  当前数据的id
		
		*/
		var val = $(el).html();

		var input = $("<input value='' size='5'/>");


		//把input放在span里面
		$(el).html(input); // //将数字覆盖为表单元素

		//让input获取焦点  给input赋值
		$(input).val(val).trigger('focus');


		//点击input的时候阻止冒泡
		$(input).click(function () {

			return false;
		})
		//鼠标离开的时候给sapn赋值
		$(input).blur(function () {

			var num = $(this).val();

			$(el).html(num);  //将表单元素覆盖成数字

			// console.log(model,attr,id)

			$.get('/admin/editNum', { collectionName: collectionName, attr: attr, id: id, num: num }, function (data) {

				console.log(data);
			})

		})

	}
}
