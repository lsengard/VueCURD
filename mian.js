Vue.component('popup',{
    template:'#popup',
    props:['cdata','ctype'],
    data(){
        return{
            popupState:false //组件是否可见
        }
    },
    computed:{
        cacheData(){
            return this.cdata;
        }
    },
    methods:{
        pushData(){
            //组件自身通过$emit来触发一个pushdata的自定义事件，传递数据给父组件
            this.$emit('pushdata',this.cacheData);
            this.popupState = false;
        }
    }
})
var vm = new Vue({
   el:'#app',
   data:{
       originData:[], //原始数据
       showData:[], //页面显示数据
       //popupState: false, //弹窗的显示状态 true为显示 false为不显示
       setType: -1, //操作状态 -1:新增 其他值:修改
       cacheData: {
           hobby:{
               other:''
           }
       },
       searchlist:[] //查询数据时input下datalist的匹配数据
   },
    mounted:function () { //钩子函数
        //在vue实例创建完成之后执行
        this.$nextTick(function() {
            this.reqData();
        });
    },
    methods:{
       //请求用户数据
        reqData(){
            this.$http.get('data.json').then((req)=>{
                this.originData = req.body.result.users;
                //用JSON方法做深层拷贝
                this.showData = this.deepcopy(this.originData)
                //console.log(this.showData)
            })
        },
        //删除用户
        del(item){
            let num = this.originData.indexOf(item);
            this.originData.splice(num,1);
            this.showData = this.deepcopy(this.originData);
        },
        //新增用户
        add() {
            this.openchild();
            this.setType = -1;
            //重新初始化缓存用户数据,避免checkbox选择出错
            this.cacheData = {
                name:'',
                gender:'',
                phone:'',
                hobby:[]
            };
            this.cacheData.hobby.other = '';
        }
        ,
        //修改用户
        reviseUser(item){
            this.openchild();
            this.setType = this.showData.indexOf(item);
            this.cacheData = this.deepcopy(item);
        },
        //由组件来触发pushdata事件执行，同时接收组件传递过来的用户修改的值(包括新增或者修改)
        updata(event){
            //setTyoe为-1时新增用户,否则修改数组中位置为setType的那组的用户数据
            if(this.setType==-1){
                this.originData.push(event);
            }else {
                this.originData.splice(this.setType,1,event);
            }
            this.showData = this.deepcopy(this.originData);
        },
        //查询数据 input上绑定一个input事件 监听输入状态 接收一个事件参数
        searchData(e){
            let intVal = e.target.value,
                searchdata = []; //匹配查询数据
            this.searchlist = []; //清空查询提示list
            if(e){
                this.originData.forEach((item,index)=>{
                    //匹配条件
                    if(item.name.indexOf(intVal)>-1){
                        searchdata.push(item);
                        if(this.searchlist.indexOf(item.name)==-1){
                            this.searchlist.push(item.name);
                        }
                    }
                    else if(item.gender.indexOf(intVal)>-1){
                        searchdata.push(item);
                        if(this.searchlist.indexOf(item.gender)==-1){
                            this.searchlist.push(item.gender);
                        }
                    }
                })
                //更新显示数据
                this.showData = this.deepcopy(searchdata);
            }
            else {
                //如果没有输入内容 则显示原始数据
                this.showData = this.deepcopy(this.originData);
            }
        },
        //在页面上显示子组件(新增和修改弹窗)
        openchild(){
            //通过$refs可以直接访问子组件内部我们抛出opentype这个值
            this.$refs.opentype.popupState = true;
        },
        //深层拷贝数据到渲染显示列表
        deepcopy:function (obj) {
             return JSON.parse(JSON.stringify(obj));
        }
    }
});