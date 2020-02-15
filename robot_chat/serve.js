var http = require("http");
var url = require("url");
var fs = require("fs");
var querystring = require("querystring");
var mysql = require("mysql");
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'robot'
});
//连接数据库
connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});
var app = http.createServer(function(req, res) {
    var url_obj = url.parse(req.url);
    if (url_obj.pathname === '/') {
        render("./templete/index.html", res)
        return;
    }
    //处理登录逻辑
    if (url_obj.pathname === '/login'&& req.method==='POST')
    {
        var str = '';
        req.on("data",function (chunk) {
            str+=chunk;
        })
        req.on("end",function(error){
            res.setHeader('content-type','text/html;charset=utf-8')

            if(!error)
            {
                res.write('{"status":"0","message":"登录成功"}','utf-8');
                res.end();
            }
        })
        return;
    }
    //处理注册逻辑
    if (url_obj.pathname === '/register'&& req.method==='POST')
    {
        var str = '';
        req.on("data",function (chunk) {
            str+=chunk;
        })
        req.on("end",function(error){
            res.setHeader('content-type','text/html;charset=utf-8')

            if(!error) {
                var str_obj = querystring.parse(str);
                if (str_obj.username === '' && str_obj.password === '') {
                    res.write('{"status" : 1,"message":"用户名和密码不能为空"}', 'utf-8');
                    res.end();
                    return;
                }
                if (str_obj.password !== str_obj.repassword) {
                    res.write('{"status" : 1,"message":"两次密码输入不一样"}', 'utf-8');
                    res.end();
                    return;
                }
                var sql = 'INSERT INTO admin(username,password,email) VALUE("' + str_obj.username + '","' + str_obj.password + '","' + str_obj.email + '")';
                connection.query(sql, function (err, result) {
                    if (!err && result && result.length !== 0) {
                        res.write('{"status" : 0,"message":"注册成功"}', 'utf-8');
                        res.end();
                        return;
                    }
                })
            }
        })
        return;
    }
    //处理登录逻辑
    if (url_obj.pathname ==='/login'&&req.method === 'POST')
    {
        var user_str='';
        req.on("data",function (chunk) {
            user_str+=chunk;

        })
        req.on("end",function (err) {
            if (!err)
            {
                res.setHeader('content-type','text/html;charset=utf-8')
                var user_obj = querystring.parse(user_str);
                var sql = "SELECT * FROM admin WHERE username='"+user_obj.username+"' AND password='"+user_obj.password+"';";
                connection.query(sql,function (error,result) {
                    if (!error && result && result.length!==0)
                    {
                        // res.setHeader('Set-Cookie',cookie.serialize('isLogin',"true"));
                        res.write('{"status":"0","message":"登录成功"}','utf-8');
                        res.end();

                    }
                    else
                    {
                        res.write('{"status":"1","message":"用户名或密码错误"}','utf-8');
                        res.end();
                    }
                })

            }
        })
        return;
    }
    render('./templete' + url_obj.pathname, res);
})

function render(path, res) {
    fs.readFile(path, 'binary', function(err, data) {
        if (!err) {
            res.write(data, 'binary');
            res.end();
        }
    })
}
app.listen(4000, function(err) {
    if (!err) {
        console.log("listing on");
    }

})