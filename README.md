
Su-App项目简介
===================

Su-App是一个小型的SAP论坛,具有用户注册，发表文章，评论，收藏和对自己的文章和评论有相关的CRUD的功能的应用.

演示地址:http://su-app-b1ab8.coding.io/

----------


### 采用响应式布局


应用分三个 分辨率作为不同的布局模式:
1 1024px 2 640px   3 480px
![enter image description here](http://7xorsq.com1.z0.glb.clouddn.com/res.jpg)

### 表单验证功能
-------------
包括用户名Email唯一验证和正则的验证、上传文件大小和类型、输入字符串长度限制等等

![enter image description here](http://7xorsq.com1.z0.glb.clouddn.com/Image.jpg)

### 使用对话框对文章的CRUD、评论以及收藏等操作
-------------

![enter image description here](http://7xorsq.com1.z0.glb.clouddn.com/actions.jpg)

使用技术总结
===================
后台语言采用Nodejs+Express，数据库使用Mongodb，前端框架使用Angular。

页面转跳使用UI Router，整体使用Ajax更新数据,只有在用户登录、注销、注册和更新本人信息时才会导致页面刷新。
文章列表采用瀑布流读取数据。

错误处理:使用Angular的HttpInterceptor作为全局处理后台反馈的status code,比如404的转跳,未授权用户操作会弹出登录窗口。

###应用模块

后端服务模块划分为user、post、comment、tags等4个模块

前端模块划分为：user、post、comment、tags等4个主要模块与后台数据进行互交、数据以及前端显示的

> **模块功能划分:**

>- **service：**主要用于与服务端数据的互交操作，把后台数据写入到对象，并提交到controller进行处理；
> - **controller：**用于在service和views之间的视图与后台数据控制器，对用户提交的数据进行一定处理后反馈给service与后台进行互动；
> - **directive：**用于扩展功能和通用组件，比如输入字数的限制，loading的显示，弹出对话框等等。
> - **views：**主要是html文件，用于向用户展示数据、结合angular的指令数据进行处理和反馈。或者结合directive组件进行与用户的操作交互。

###自建组件
个人写的一个基于Angular弹窗小组件,能够自定义一些基础属性或者使用自己的html构建自己的窗口。

```
modalService.init({
    template: {
        title:"信息"
        content: "删除成功",
    },
    closeTime: 800})

```
构建具有"信息"和"删除成功"的对话框,通过closeTime来触发自动关闭对话框的时间(毫秒)
```
modalService.init({
            templateUrl:'/angularapp/post/post.creator.html',
            closeModal: ['.modal-close-btn', '.modal-bg', '.button-cancel'],
            controller: 'PostController',
            controllerAs: "Post"
        }).then(
            function () {
            }, function () {
                vm.postFormDataModel.data = null;
            }
        )

```
也可以利用html模板创建对话框，通过定义closeModal属性来设置触发关闭对话框的html元素（class或者id），controller绑定试图控制器，通过promise来接受对话框的关闭状态(resolve为关闭对话框,reject为关闭整个modal(包括背景半透明)),再在关闭后执行其他代码.

其他
===================
###浏览器兼容
桌面端：chrome 46.0 fiefox 44.02 IE 10
移动端(android 5.1)：UC Web 10.9 QQ 浏览器 6.1

###目录结构
app和config为后台nodejs文件，/public/angularapp为原始angular文件，/public/dist为压缩代码后的文件
假如下载使用,需要对config/config.js mongodbURI,port,uploadPath等值进行配置

###联系方式
TEL：13128220027
Email：suyuanhan@gmail.com
QQ：99165772

