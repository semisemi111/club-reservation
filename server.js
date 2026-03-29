console.log("🔥 실행됨");
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

// DB 연결
const db = new sqlite3.Database('./reservation.db');

// 테이블 생성
db.run(`
CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  club TEXT,
  name TEXT,
  date TEXT,
  time TEXT
)
`);

// 📌 예약 추가
app.post('/reserve', (req, res) => {
  const { club, date, time } = req.body;

  if (!club || !date || !time) {
    return res.json({ success: false, message: "값을 모두 입력하세요" });
  }

  // 중복 체크
  db.get(
    "SELECT * FROM reservations WHERE date=? AND time=?",
    [date, time],
    (err, row) => {
      if (row) {
        return res.json({ success: false, message: "이미 예약된 시간입니다" });
      }

      db.run(
        "INSERT INTO reservations (club, name, date, time) VALUES (?, ?, ?)",
        [club, date, time],
        function () {
          res.json({ success: true, id: this.lastID });
        }
      );
    }
  );
});

// 📌 전체 조회
app.get('/reservations', (req, res) => {
  db.all("SELECT * FROM reservations ORDER BY date, time", (err, rows) => {
    res.json(rows);
  });
});

// 📌 삭제
app.delete('/reserve/:id', (req, res) => {
  const id = req.params.id;

  db.run("DELETE FROM reservations WHERE id=?", [id], () => {
    res.json({ success: true });
  });
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`서버 실행: http://localhost:${PORT}`);
});
