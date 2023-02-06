let checkLogin = function (req, res, next) {
    // 判斷這個人是否已經登入？
    // session 裡如果沒有 member 這個資料，表示沒有登入過

    if (!req.session.member) {
        //尚未登入
        return res.status(403).json({ msg: '尚未登入' });
    }
    next();
};

let user = function (req, res, next) {
    if (req.session.member.user !== 1) {
        return res.status(200).json({ msg: '無權限一' });
    }
    next();
};
let handler = function (req, res, next) {
    if (req.session.member.handler !== 1) {
        return res.status(200).json({ msg: '無權限三' });
    }
    next();
};
let manage = function (req, res, next) {
    if (req.session.member.manage !== 1) {
        return res.status(200).json({ msg: '無權限四' });
    }
    next();
};

let all = function (req, res, next) {
    if (req.session.member.manage !== 1 && req.session.member.handler !== 1 && req.session.member.user !== 1) {
        return res.status(200).json({ msg: '無權限一或三或四' });
    }
    next();
};

let handler_manage = function (req, res, next) {
    if (req.session.member.manage !== 1 && req.session.member.handler !== 1) {
        return res.status(200).json({ msg: '無權限三或四' });
    }
    next();
};

module.exports = {
    checkLogin,
    user,
    handler,
    manage,
    all,
    handler_manage,
};
