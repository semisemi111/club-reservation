console.log("🔥 실행됨");

const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// DB 연결
const db = new Database('reservation.db');

// 테이블 생성
db.prepare(`
CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  club TEXT,
  date TEXT,
  time TEXT
)
`).run();

// 📌 예약 추가
app.post('/reserve', (req, res) => {
  const { club, date, time } = req.body;

  if (!club || !date || !time) {
    return res.json({ success: false, message: "값을 모두 입력하세요" });
  }

  // 중복 체크
  const existing = db.prepare(
    "SELECT * FROM reservations WHERE date=? AND time=?"
  ).get(date, time);

  if (existing) {
    return res.json({ success: false, message: "이미 예약된 시간입니다" });
  }

  // 예약 추가
  const result = db.prepare(
    "INSERT INTO reservations (club, date, time) VALUES (?, ?, ?)"
  ).run(club, date, time);

  res.json({ success: true, id: result.lastInsertRowid });
});

// 📌 전체 조회
app.get('/reservations', (req, res) => {
  const rows = db.prepare(
    "SELECT * FROM reservations ORDER BY date, time"
  ).all();

  res.json(rows);
});

// 📌 삭제
app.delete('/reserve/:id', (req, res) => {
  const id = req.params.id;

  db.prepare("DELETE FROM reservations WHERE id=?").run(id);

  res.json({ success: true });
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`서버 실행: http://localhost:${PORT}`);
});
