const express = require("express");
const dbUtils = require("../utils/sqlite_db");
const router = express.Router();
const sqls = require("../utils/data/sql.js");
const db = dbUtils.sqlite_db;
const { getIO } = require("../utils/io.js");

/**
 * 查询每个人发送的数据条数
 */
router.get("/bothmsg", async (req, res, next) => {
  db.queryAll([
    "SELECT count(*) as other FROM AboutYou where IsSender = 0;",
    "SELECT count(*) as self FROM AboutYou where IsSender = 1",
  ]).then(
    (re) => {
      const data = { ...(re?.[0] || {}), ...(re?.[1] || {}) };
      res.json({
        code: "0",
        msg: "查询成功",
        data,
      });
    },
    (err) => {
      res.json({
        code: "019002",
        msg: "查询失败",
        data: err,
      });
    }
  );
});

/**
 * 文本1  表情包47 图片3 视频43 语音34 拍一拍10000
 */

const myMap = new Map([
  ["1", "wb"],
  ["47", "bqb"],
  ["3", "tp"],
  ["43", "sp"],
  ["34", "yy"],
  ["10000", "pyp"],
]);

/**
 * 查询不同消息类型对应的数量
 *
 * wxid_ve0yjimknu8r22 宝宝的vxid
 * TODO: 查询条件待优化
 */
router.get("/typemsg", async (req, res, next) => {
  const { type } = req.query;
  const typeArr = Array.isArray(type) ? type : type?.split(",");
  if (!typeArr || !Array.isArray(typeArr) || typeArr?.length === 0) {
    res.json({
      code: "019002",
      msg: "缺失查询参数！",
      data: null,
    });
    return;
  }
  const querySqls = new Array(typeArr.length).fill(sqls.queryTypeMsgSql);

  db.queryAll(
    querySqls,
    typeArr.map((v) => [v])
  ).then(
    (re) => {
      const data = {};
      re.forEach((item, index) => {
        data[myMap.get(typeArr[index])] = item?.count;
      });
      res.json({
        code: "0",
        msg: "查询成功",
        data: data,
      });
    },
    (err) => {
      res.json({
        code: "019002",
        msg: "查询失败",
        data: err,
      });
    }
  );
});
// SELECT *
// FROM your_table
// WHERE event_timestamp BETWEEN '2023-01-01 00:00:00' AND '2023-01-31 23:59:59';

function generateDateRanges(num) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1 + 1;

  const dateRanges = [];
  for (let i = 0; i < num; i++) {
    const startDate = new Date(currentYear, currentMonth - 1 - i); // 从当前月份往前推
    const endDate = new Date(currentYear, currentMonth - i); // 下一个月的第一天，即当前月的最后一天
    dateRanges.unshift([
      startDate.toISOString().slice(0, 7) + "-01",
      endDate.toISOString().slice(0, 7) + "-01",
    ]);
  }
  return dateRanges;
}
/**
 * 查询每月的聊天数量 2023.10 开始
 */
router.get("/monthmsg", async (req, res, next) => {
  const { months } = req.query;
  if (!months || !/^\d+$/.test(months) || months > 24 || months < 1) {
    res.json({
      code: "019002",
      msg: "参数有误",
      data: null,
    });
    return;
  }
  const timeparagraph = generateDateRanges(months);
  const querySqls = new Array(timeparagraph.length).fill(sqls.queryMonthMsgSql);
  db.queryAll(querySqls, timeparagraph).then(
    (re) => {
      res.json({
        code: "0",
        msg: "查询成功",
        data: re,
      });
    },
    (err) => {
      res.json({
        code: "019002",
        msg: "查询失败",
        data: err,
      });
    }
  );
});

/**
 * 查询 SELECT * FROM events WHERE strftime('%w', date) = '2';
 */
router.get("/weekmsg", async (req, res, next) => {
  const querySqls = new Array(7).fill(sqls.queryWeekMsgSql);
  db.queryAll(querySqls, ["1", "2", "3", "4", "5", "6", "0"]).then(
    (re) => {
      res.json({
        code: "0",
        msg: "查询成功",
        data: re?.map((item) => item.count),
      });
    },
    (err) => {
      res.json({
        code: "019002",
        msg: "查询失败",
        data: err,
      });
    }
  );
});

// 更新到日互动次数
router.put("/update_today_msg", async (req, res, next) => {
  const { name, msgtext, createDate } = req.body;
  console.log(name, msgtext, createDate);
  if (!name || !msgtext || !createDate) {
    res.json({
      code: "019002",
      msg: "参数有误",
      data: null,
    });
    return;
  }
  db.run(sqls.insertTodayMsgSql, [name, msgtext, createDate]).then(
    () => {
      const io = getIO();
      db.get(sqls.queryTodayMsgSql).then(
        (d) => {
          res.json({
            code: "0",
            msg: "更新成功",
          });
          io.emit("updateTodayMsg", d);
        },
        (err) => {
          res.json({
            code: "019002",
            msg: "失败",
            data: err,
          });
        }
      );
    },
    (err) => {
      res.json({
        code: "019002",
        msg: "更新失败",
        data: err,
      });
    }
  );
});

module.exports = router;
