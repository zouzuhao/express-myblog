const sqlite3 = require("sqlite3").verbose();

class Database {
  constructor(file) {
    this.db = new sqlite3.Database(file, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log("Connected to the SQLite database.");
      }
    });
  }

  run(sql, params) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err.message);
        } else {
          resolve();
        }
      });
    });
  }

  get(sql, params, callback) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err.message);
        } else {
          if (callback) callback(row);
          resolve(row);
        }
      });
    });
  }

  all(sql, params) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err.message);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // 多条sql查询
  queryAll(sqls, params = []) {
    let arr = [];
    let count = 0;
    return new Promise((resolve, reject) => {
      for (let index = 0; index < sqls.length; index++) {
        this.get(sqls[index], params?.[index]).then((res) => {
          arr[index] = res;
          count++;
          if (count === sqls.length) {
            resolve(arr);
          }
        }, (err) => {
          reject(err.message);
        });
      }
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err.message);
        } else {
          resolve();
        }
      });
    });
  }
}

// 创建一个新的SQLite数据库实例 TODO:生产环境需更改
const db = new Database(
  "C:\\Users\\18521\\Desktop\\my_blog\\express-blog-backend\\utils\\data\\MSG.db"
);

module.exports.sqlite_db = db;
