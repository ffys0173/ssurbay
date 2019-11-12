//server.js에서 사용하기 위해 module.exports

module.exports = function (app, conn) {

    app.get('/test', function(req, res){
        var userAgent = req.header('User-Agent');
        res.send(userAgent);
    })

    app.post('/login', function (req, res){
        query = "select userpw from userinfo where userid = ?";
        conn.query(query, req.body.userId, function(err, rows){

            if(rows.length == 0){
                res.send("<script>alert('아이디나 비밀번호가 잘못되었습니다.');location.replace('/');</script>");
            }
           
            else if(rows[0].userpw === req.body.userpw){
                conn.query("update userinfo set session_id = ? where userid = ?", [req.sessionID, req.body.userId], function(){
                    req.session.userId = req.body.userId;
                    req.session.login = true;
                    res.redirect('/');
                })
            }
            else{
                res.send("<script>alert('아이디나 비밀번호가 잘못되었습니다.');location.replace('/');</script>");
            }
        })
    })

    app.get('/signin', function(req, res){

        var userAgent = req.header('User-Agent');

        if(userAgent.includes('Android')){
            var target = 'msignin.html';
        }
        else{
            var target = 'signin.html';
        }
        res.render(target,{});
    })

    app.post('/signin', function(req, res){
        var id = req.body.ID;
        var pw = req.body.pw;
        var q = req.body.question;
        var a = req.body.answer;

        if(pw[0] !== pw[1]){
            res.send("<script>alert('비밀번호를 확인해주세요.');location.replace('/signin');</script>");
        }
        else{
            conn.query("insert into userinfo(userid, userpw, question, answer) values(?, ?, ?, ?)", [id, pw[0], q, a], function(err){
                if(!err){
                    res.redirect('/');
                }
                else{
                    res.send("<script>alert('중복된 아이디입니다.');location.replace('/signin');</script>");
                }
            });
        }   
    })

    app.get('/pwrecover', function(req, res){

        var userAgent = req.header('User-Agent');

        if(userAgent.includes('Android') || userAgent.includes('iPhone')){
            var target = 'mpwrecover.html';
        }
        else{
            var target = 'pwrecover.html';
        }
        res.render(target,{});
    })
    app.post('/pwrecover', function(req, res){
        var id = req.body.FindID;
        var q = req.body.answfindpw;
        var a = req.body.find;

        conn.query("select answer, question, userpw from userinfo where userid = ?", id, function(err, rows){

            if(rows.length != 0){
                if(rows[0].question ===q && rows[0].answer === a){
                    res.send("<script>alert('비밀번호 : " + rows[0].userpw + "');location.replace('/');</script>");
                }
                else{
                    res.send("<script>alert('질문 및 답이 틀립니다.');location.replace('/pwrecover');</script>");
                }
            }
            else{
                res.send("<script>alert('존재하지 않는 아이디입니다.');location.replace('/pwrecover');</script>");
            }
        })
    })

    app.get('/', function (req, res) {

        var userAgent = req.header('User-Agent');

        if (req.session.login){
            console.log(req.session.userId);

            var category;
            if(req.query.category)
                category = req.query.category;
            else{
                category = '전체';
            }

            var catsearch = "";
            if(category === '전체')
                catsearch = "";
            else
                catsearch = " and a.category = '" + category + "'";

            var sort;
            if(req.query.sort)
                sort = req.query.sort;
            else
                sort = 'exp';

            var sortsearch = "";
            if(sort === 'exp') {
                sortorder = " order by limittime asc";
            }
            else {
                sortorder = " order by a.number desc";
            }
            var query = "select a.category, a.number, a.title, timestampdiff(second, now(), a.time + interval limittime minute) as limittime, a.text, date_format(a.time,'%Y-%m-%d %H:%i:%s') as time, a.expired, in1, in2, in3, in4, in5\
                from topic a\
                join(\
                    select number, max(in1) as in1, max(in2) as in2, max(in3) as in3, max(in4) as in4, max(in5) as in5\
                    from(\
                        select topic_number as number,\
                            case when item_number = '1' then item else null end as in1,\
                            case when item_number = '2' then item else null end as in2,\
                            case when item_number = '3' then item else null end as in3,\
                            case when item_number = '4' then item else null end as in4,\
                            case when item_number = '5' then item else null end as in5\
                        from topic_item\
                    ) tmp\
                    group by tmp.number\
                ) b on a.number = b.number" + catsearch +
                " and timestampdiff(second, now(), a.time + interval limittime minute) > 0" + sortorder +
                " limit 0, 10;";
            

            if(userAgent.includes('Android') || userAgent.includes('iPhone')){
                var target = 'mmain'
            }
            else{
                var target = 'main'
            }

            conn.query(query, function(err, rows){
                res.render(target, {
                    topicinfo: rows,
                    category: category,
                    sort: sort,
                    userid: req.session.userId
                });
            });
            
        }
        else{
            if(userAgent.includes('Android') || userAgent.includes('iPhone')){
                res.render('mintro');
            }
            else{
                res.render('intro');
            }
        }
    });

    app.get('/newtopic', function (req, res) {
        if (req.session.login){
            
            var userAgent = req.header('User-Agent');

            if(userAgent.includes('Android') || userAgent.includes('iPhone')){
                var target = 'mnewtopic';
            }
            else{
                var target = 'newtopic';
            }
            res.render(target, {userid: req.session.userId});
        }
        else{
            res.redirect('/');
        }
        });

    app.get('/delete:number', function(req,res){//시험용
        conn.query('select * from topic',function(err, rows){//'select count(*) as cnt from test'
            var number = req.params.number;//rows[rows.length-1].number;
            conn.query('delete from topic where number = ?',number);
            conn.query('delete from vote where number = ?',number);
            conn.query('delete from topic_item where topic_number = ?', number)
        });
        res.redirect('/'+req.session.userId+'/mypage');
    });
    
    app.post('/formrecieve', function (req, res) {

        if (req.session.login){
            var newtitle = req.body.title;
            var newtext = req.body.text;
            var category = req.body.category;
            var limittime = req.body.limit;

            newtext = newtext.replace("<script>", " ").replace("</script>", " ");

            var item = new Array();
            item[0] = req.body.item1;
            item[1] = req.body.item2;
            item[2] = req.body.item3;
            item[3] = req.body.item4;
            item[4] = req.body.item5;

            conn.query('insert into topic (category, title, text, userId, limittime) values (?, ?, ?, ?, ?)', [category, newtitle, newtext, req.session.userId ,limittime], function(err, rows){
                for(var i = 0; i<5; i++){
                    if(item[i])
                        conn.query('insert into topic_item (topic_number, item_number, item) values (?, ?, ?)', [rows.insertId, i+1, item[i]]);
                }
            });
            res.redirect('/');
        }
        else{
            res.redirect('/');
        }
    });
    app.get('/home', function (req, res) {//뒤로가기
        res.redirect('/');
    });

    app.get('/logout', function(req,res){//테스트용 기능
        delete req.session.login;
        res.redirect('/');
    });

    app.get('/init', function(req,res){//테스트용 기능
        conn.query('alter table topic auto_increment=1;');
        res.redirect('/');
    });

    app.post('/vote', function(req,res){

        if (req.session.login){
            var number = req.body.id*1;
            var selected = req.body.s*1;
    
            conn.query('select expired from topic where number = ?',number, function(err, rows){
                if(rows[0].expired === 'Y'){
                    res.send('<script>alert("이미 만료된 투표입니다.");location.replace("/");</script>');
                }
                else{//만료된 투표가 아니라면
                    conn.query('select userId from vote where number = ? and userId = ?', [number, req.session.userId],function(err, rows){
                        if(rows.length > 0){//이미 투표했다면
                            res.send('<script>alert("이미 투표했습니다.");location.replace("/");</script>');
                        }
                        else{
                            conn.query('update topic_item set voted = voted + 1 where topic_number = ? and item_number = ?',[number, selected]);
                            conn.query('insert into vote (number, userId, choice) values (?, ?, ?)',[number,req.session.userId,req.body.s]);
                            res.redirect('/');
                        }
                    });
                }
            });
        }
        else{
            res.redirect('/');
        }
    });

    let mypagequery = "select a.number, a.title, a.text, date_format(a.time,'%Y-%m-%d %H:%i:%s') as time, a.expired, in1, in2, in3, in4, in5,\
            voted1, voted2, voted3, voted4, voted5\
            from topic a\
            join(\
                select number, max(in1) as in1, max(in2) as in2, max(in3) as in3, max(in4) as in4, max(in5) as in5,\
                max(voted1) as voted1, max(voted2) as voted2, max(voted3) as voted3, max(voted4) as voted4, max(voted5) as voted5\
                from(\
                    select topic_number as number,\
                        case when item_number = '1' then item else null end as in1,\
                        case when item_number = '1' then voted else null end as voted1,\
                        case when item_number = '2' then item else null end as in2,\
                        case when item_number = '2' then voted else null end as voted2,\
                        case when item_number = '3' then item else null end as in3,\
                        case when item_number = '3' then voted else null end as voted3,\
                        case when item_number = '4' then item else null end as in4,\
                        case when item_number = '4' then voted else null end as voted4,\
                        case when item_number = '5' then item else null end as in5,\
                        case when item_number = '5' then voted else null end as voted5\
                    from topic_item\
                ) tmp\
                group by tmp.number\
            ) b on a.number = b.number and userId = ? order by a.number desc;";

    app.get('/:id/mypage',function(req,res){
        
        if (req.session.login && req.session.userId === req.params.id){
            conn.query(mypagequery, req.session.userId, function(err, rows){

                if(rows.length === 0){
                    res.send('<script>alert("작성한 글이 없습니다.");location.replace("/");</script>');
                }
                else{

                    var userAgent = req.header('User-Agent');

                    if(userAgent.includes('Android') || userAgent.includes('iPhone')){
                        var target = 'mmypage';
                    }
                    else{
                        var target = 'mypage';
                    }
    
                    res.render(target, {
                        mytopic: rows,
                        showtopic: 0,
                        userid: req.session.userId
                    });
                }
            });
        }
        else{
            res.redirect('/');
        }
    });

    app.post('/:id/mypage', function(req,res){

        if (req.session.login && req.session.userId === req.params.id){
            conn.query(mypagequery, req.session.userId, function(err, rows){
                
                var userAgent = req.header('User-Agent');

                if(userAgent.includes('Android') || userAgent.includes('iPhone')){
                    var target = 'mmypage';
                }
                else{
                    var target = 'mypage';
                }
                res.render(target, {
                    mytopic: rows,
                    showtopic: req.body.showtopic,
                    userid: req.session.userId
                });
            });
        }
        else{
            res.redirect('/');
        }
    });

    let myvotequery = "select a.number, a.title, a.text, date_format(a.time,'%Y-%m-%d %H:%i:%s') as time, a.expired, in1, in2, in3, in4, in5,\
            voted1, voted2, voted3, voted4, voted5, a.selected, v.choice\
            from topic a\
            join(\
                select number, max(in1) as in1, max(in2) as in2, max(in3) as in3, max(in4) as in4, max(in5) as in5,\
                max(voted1) as voted1, max(voted2) as voted2, max(voted3) as voted3, max(voted4) as voted4, max(voted5) as voted5\
                from(\
                    select topic_number as number,\
                        case when item_number = '1' then item else null end as in1,\
                        case when item_number = '1' then voted else null end as voted1,\
                        case when item_number = '2' then item else null end as in2,\
                        case when item_number = '2' then voted else null end as voted2,\
                        case when item_number = '3' then item else null end as in3,\
                        case when item_number = '3' then voted else null end as voted3,\
                        case when item_number = '4' then item else null end as in4,\
                        case when item_number = '4' then voted else null end as voted4,\
                        case when item_number = '5' then item else null end as in5,\
                        case when item_number = '5' then voted else null end as voted5\
                    from topic_item\
                ) tmp\
                group by tmp.number\
            ) b on a.number = b.number\
            join vote as v on a.number = v.number and v.userId = ? order by a.number desc;";

    app.get('/:id/myvote', function(req,res){

        if (req.session.login && req.session.userId === req.params.id){

            conn.query(myvotequery, req.session.userId, function(err, rows){

                if(rows.length === 0){
                    res.send('<script>alert("투표한 글이 없습니다.");location.replace("/");</script>');
                }
                else{
                    var userAgent = req.header('User-Agent');

                    if(userAgent.includes('Android') || userAgent.includes('iPhone')){
                        var target = 'mmyvote';
                    }
                    else{
                        var target = 'myvote';
                    }
                    res.render(target, {
                        topic: rows,
                        showtopic: 0,
                        userid: req.session.userId
                    });
                }
            });
        }
        else{
            res.redirect('/');
        }
    });

    app.post('/:id/myvote', function(req,res){

        if (req.session.login && req.session.userId === req.params.id){
            conn.query(myvotequery, req.session.userId, function(err, rows){
                
                var userAgent = req.header('User-Agent');

                if(userAgent.includes('Android') || userAgent.includes('iPhone')){
                    var target = 'mmyvote';
                }
                else{
                    var target = 'myvote';
                }
                res.render(target, {
                    topic: rows,
                    showtopic: req.body.showtopic,
                    userid: req.session.userId
                });
            });
        }
        else{
            res.redirect('/');
        }
    });


    app.post('/decision', function(req,res){

        if (req.session.login){
            var decision = req.body.s;
            var number = req.body.id*1;
    
            conn.query('update topic set selected = ?, expired = "Y" where number = ?',[decision, number]);
            res.redirect('/'+req.session.userId+'/mypage');
        }
        else{
            res.redirect('/');
        }
    });

    // app.get('/down',function(req,res){
    //     console.log("hello");
    //     res.download('C:\\Users\\save0\\njstest\\njstest.zip');
    // })
};