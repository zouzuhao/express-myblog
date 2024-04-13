/**
 * sql
 */

const queryMonthMsgSql = `SELECT count(*) as count FROM AboutYou where datetime(CreateTime, 'unixepoch', 'localtime') BETWEEN ? AND ?`;
const queryTypeMsgSql = `SELECT count(*) as count FROM AboutYou where type = ?`;
const queryWeekMsgSql = `SELECT count(*) as count FROM AboutYou WHERE strftime('%w', datetime(CreateTime, 'unixepoch', 'localtime')) = ?`;
const insertTodayMsgSql = `INSERT INTO TodayInteraction(name, msgtext, createDate) VALUES(?, ?, ?)`;
const queryTodayMsgSql = `SELECT count(*) as count FROM TodayInteraction`;

module.exports = {
    queryMonthMsgSql,
    queryTypeMsgSql,
    queryWeekMsgSql,
    insertTodayMsgSql,
    queryTodayMsgSql
}