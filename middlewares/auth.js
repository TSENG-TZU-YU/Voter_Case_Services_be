let checkLogin = function (req, res, next) {
    // 判斷這個人是否已經登入？
    // session 裡如果沒有 member 這個資料，表示沒有登入過
    console.log('req.session.member', req.session.member);
    if (!req.session.member) {
        //尚未登入
        return res.status(403).json({ msg: '尚未登入' });
    }
    next();

    // if (req.session.member.user === 1) {
    //   //尚未登入
    //   return res.json({ msg: '權限一' });
    // }
    // next();

    // if (req.session.member.handler === 1) {
    //   //尚未登入
    //   return res.json({ msg: '權限三' });
    // }
    // // next();
};

module.exports = { checkLogin };
