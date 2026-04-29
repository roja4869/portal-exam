const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    db.run("UPDATE exams SET start_time = NULL WHERE start_time = ''", (err) => {
        if (err) console.error(err);
        else console.log('Fixed start_time');
    });
    db.run("UPDATE exams SET end_time = NULL WHERE end_time = ''", (err) => {
        if (err) console.error(err);
        else console.log('Fixed end_time');
    });
});

db.close();
