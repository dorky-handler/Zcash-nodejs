var fs = require('fs');
var crypto = require('crypto');
var resstr,retstr,lock=false;
const path = require('path');
const dbPath =  'db/node.db';
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
var datadir=path.join(__dirname, "../../mnt/node/");



function generate6DigitCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function generate8DigitCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}



function encryptData(data, passphrase) {
  try
{
  const salt = crypto.randomBytes(16).toString('hex');
  const key = crypto.pbkdf2Sync(passphrase, Buffer.from(salt, 'hex'), 10000, 32, 'sha256');
  const dataString = JSON.stringify(data);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encryptedData = cipher.update(dataString, 'utf-8', 'base64');
  encryptedData += cipher.final('base64');
  return { error:false , encryptedData: encryptedData, iv: iv.toString('hex'), salt: salt.toString('hex') };
}
catch(error)
{
console.log("Caught error while encrypting",error);
return { error:true , message:error};
}
}



async function decryptObj(encryptedData, iv, salt, passphrase) {

return new Promise((resolve) => {
        if (!encryptedData || !iv || !salt) {
        resolve({ error: true, message: 'Encryption Params missing' });
        }
        const iterations = 10000;
        const keySize = 32;
        console.log("passpharase = ",passphrase);
        console.log("typeof pass = "+typeof(passphrase));
        console.log("iv = " , iv);
        console.log("typeoof iv = "+typeof(iv));
        crypto.pbkdf2(passphrase, Buffer.from(salt, 'hex'), iterations, keySize, 'sha256', (err, derivedKey) => {
        if (err) {
        console.error('Error during key derivation:', err);
        resolve({ error: true, message: 'Error during key derivation.' + err });
        }
        try {
        const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, Buffer.from(iv, 'hex'));
        let decryptedData = decipher.update(encryptedData, 'base64', 'utf-8');
        decryptedData += decipher.final('utf-8');
        console.log('Decrypted Data:', decryptedData);
        resolve({ error : false, message: 'Data received and decrypted successfully.', decrypted:decryptedData});
        } catch (decryptionError) {
        console.error('Error during decryption:', decryptionError);
        resolve({ error: true, message: 'Error during decryption. Verify provided data and passphrase. ' + decryptionError });
        }
        });
  });
}



function cookieread()
{
var retcook;
if(!fs.existsSync(datadir+'.cookie')) 
{
retcook={"error":true,"message":"cookie file not found"};
return retcook;
}
else
{
var data = fs.readFileSync(datadir + '.cookie', 'utf-8');
retcook={"error":false,"message":data};
return retcook;
}
}



function writezconf(arg)
{
var conf = arg.conf;
var message={
error:true,
message:""};
if(!lock)
{
lock=true;
try {
  fs.writeFileSync('zcash.conf',(conf));
  lock=false;
  message.error=false;
  message.message="success";
  return message;
  } catch (err) {
  lock=false;
  message.message=err;
  return message;
 }
}
else
{
message.message="lock";
return message;
}
}


async function create(conf)
{
console.log("crtconf");
const configSchema = "CREATE TABLE IF NOT EXISTS config (Username TEXT PRIMARY KEY,Password TEXT,Remotelogin TEXT DEFAULT 'true',Drive TEXT,Updt TEXT DEFAULT 'FALSE',Tor TEXT DEFAULT 'FALSE',addnode TEXT,bannode TEXT,Error INTEGER DEFAULT 0,Errormsg TEXT,Rescan TEXT DEFAULT 'FALSE',Reindex TEXT DEFAULT 'FALSE');";
const transactionsSchema ="CREATE TABLE IF NOT EXISTS transactions (Fromadr TEXT,Txid TEXT PRIMARY KEY,Amount REAL,Type TEXT,Tmstmp INT);";
 try {
    await fs.writeFileSync(dbPath, "", { flag: 'wx' }, function (err) {
    if (err) throw err;
    console.log("It's saved!");
    });
    const db = await new sqlite3.Database(dbPath, sqlite3.OPEN_READ_WRITE);
    await db.run(configSchema);
    await db.run(transactionsSchema);
    console.log('Database and tables created successfully!');
    const hashedPassword = await bcrypt.hash(conf.password, 10);
    const stmt = await db.prepare('INSERT INTO config (username, password, drive) VALUES (?, ?, ?)');
    await stmt.run(conf.name, hashedPassword, conf.drive);
    await stmt.finalize();
    await db.close();
    var message={error:false,message:"Success"};
    return message;
  } catch (err) {
    console.error('Error creating database or tables:', err.message);
    var message={error:true,message: err.message};
    return message;
  }
}





function isValid(name, pwd) {
  console.log("isval");
return new Promise((resolve, reject) => {
    const db1 = new sqlite3.Database(dbPath, sqlite3.OPEN_READ_WRITE, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        reject(err);
      }
    });

    db1.get("SELECT Username, Password FROM config WHERE Username = ?", [name], (err, row) => {
      if (err) {
        console.error('Error querying database:', err.message);
        db1.close();
        reject(err);
      } else if (!row) {
        console.log("Username not found");
        db1.close();
        resolve(false);
      } else {
        bcrypt.compare(pwd, row.Password)
          .then((isPasswordValid) => {
            db1.close();
            resolve(isPasswordValid);
          })
          .catch((err) => {
            console.error('Error comparing passwords:', err.message);
            db1.close();
            reject(err);
          });
      }
    });
  });
}


async function getRemotelogin() {
  console.log("getrl");
if(fs.existsSync(dbPath)){
return new Promise(async (resolve, reject) => {
    let db1;
    try {
      db1 = await new sqlite3.Database(dbPath, sqlite3.OPEN_READ_WRITE);
      db1.get("SELECT * FROM config ORDER BY ROWID ASC LIMIT 1", [], (err, row) => {
        if (err) {
          console.error(err.message);
          resolve({ error: true, message: err.message });
        } else {
          resolve({ error: false, remotelogin: row.Remotelogin});
        }
      });
    } catch (err) {
      console.error('Error listing tables:', err.message);
      reject(err);
    } finally {
      if (db1) {
        await db1.close();
      }
    }
  });
}
else
{
return false;
}

}


async function getsettings() {
  console.log("getsetts");
return new Promise(async (resolve, reject) => {
    let db1;
    try {
      db1 = await new sqlite3.Database(dbPath, sqlite3.OPEN_READ_WRITE);

      db1.get("SELECT Remotelogin,Drive,Updt,Tor,addnode,bannode FROM config ORDER BY ROWID ASC LIMIT 1", [], (err, row) => {
        if (err) {
          console.error(err.message);
          resolve({ error: true, message: err.message });
        } else {
          resolve({ error: false, settings:{drv:row.Drive,update:row.Updt,tor:row.Tor,add:row.addnode==null?"":JSON.parse(row.addnode),ban:row.bannode==null?"":JSON.parse(row.bannode),remote: row.Remotelogin}});
        }
      });
    } catch (err) {
      console.error('Error listing tables:', err.message);
      reject(err);
    } finally {
      if (db1) {
        await db1.close();
      }
    }
  });
}


async function putsettings(settings)
{
console.log("putsetts");
let db;
return new Promise(async (resolve, reject) => {
try{
db = new sqlite3.Database(dbPath);

let sql = "UPDATE config SET Remotelogin = ?,Drive = ? , Updt = ? ,Tor = ? , addnode = ? , bannode = ? WHERE ROWID = (SELECT ROWID FROM config LIMIT 1)";
db.run(sql, [settings.remote,settings.drv,settings.updt,settings.tor,JSON.stringify(settings.add),JSON.stringify(settings.ban)], function(err) {
if (err) {
console.error(err.message);
resolve({error:true,message:err.message});
}
else
{
resolve({error:false});
console.log(`Row(s) updated: ${this.changes}`);
}
});
}
catch (err) {
      console.error('Error listing tables:', err.message);
      reject(err);
    } finally {
      if (db) {
        await db.close();
      }
    }
});
}



async function updateerror(errorobj)
{
console.log("upderr");
let db;
return new Promise(async (resolve, reject) => {
try{
db = new sqlite3.Database(dbPath);

let sql = "UPDATE config SET Error = ? , Errormsg = ? WHERE ROWID = (SELECT ROWID FROM config LIMIT 1)";
db.run(sql, [errorobj.err,errorobj.errmsg], function(err) {
if (err) {
console.error(err.message);
resolve({error:true,message:err.message});
}
else
{
resolve({error:false});
console.log(`Row(s) updated: ${this.changes}`);
}
});
}
catch (err) {
      console.error('Error listing tables:', err.message);
      reject(err);
    } finally {
      if (db) {
        await db.close();
      }
    }
});
}




async function readconf() {
console.log("readconf");
if(fs.existsSync(dbPath)){
  console.log("exists");
return new Promise(async (resolve, reject) => {
    let db1;
    try {
      db1 = await new sqlite3.Database(dbPath, sqlite3.OPEN_READ_WRITE);

      db1.get("SELECT Error,Errormsg,Rescan,Reindex,Drive,Updt,Username FROM config ORDER BY ROWID ASC LIMIT 1", [], (err, row) => {
        if (err) {
          console.log("Readconf error");
          console.error(err.message);
          resolve({ error: true, message: err.message });
        } else {
          resolve({ error: false, drv:row.Drive,err:row.Error,errormsg:row.Errormsg,rescan:row.Rescan,reindex:row.Reindex,update:row.Updt,username:row.Username});
        }
      });
    } catch (err) {
      console.error('Error listing tables:', err.message);
      reject(err);
    } finally {
      if (db1) {
        await db1.close();
      }
    }
  });
}
else
{
return ({ error: true, message: "Db doesn't exist" });
}
}

async function rescanreset()
{
console.log("rescanreset");
let db;
return new Promise(async (resolve, reject) => {
try{
db = new sqlite3.Database(dbPath);
let sql = "UPDATE config SET Rescan = ? WHERE ROWID = (SELECT ROWID FROM config LIMIT 1)";
db.run(sql, ["false"], function(err) {
if (err) {
console.error(err.message);
resolve({error:true,message:err.message});
}
else
{
resolve({error:false});
console.log(`Row(s) updated: ${this.changes}`);
}
});
}
catch (err) {
      console.error('Error listing tables:', err.message);
      reject(err);
    } finally {
      if (db) {
        await db.close();
      }
    }
});
}

async function reindexreset()
{
console.log("reindexreset");
let db;
return new Promise(async (resolve, reject) => {
try{
db = new sqlite3.Database(dbPath);

let sql = "UPDATE config SET Reindex = ? WHERE ROWID = (SELECT ROWID FROM config LIMIT 1)";
db.run(sql, ["false"], function(err) {
if (err) {
console.error(err.message);
resolve({error:true,message:err.message});
}
else
{
resolve({error:false});
console.log(`Row(s) updated: ${this.changes}`);
}
});
}
catch (err) {
      console.error('Error listing tables:', err.message);
      reject(err);
    } finally {
      if (db) {
        await db.close();
      }
    }
});
}


async function reindexset()
{
console.log("reindexset");
let db;
return new Promise(async (resolve, reject) => {
try{
db = new sqlite3.Database(dbPath);

let sql = "UPDATE config SET Reindex = ? , Error = ? , Errormsg = ? WHERE ROWID = (SELECT ROWID FROM config LIMIT 1)";
db.run(sql, ["true",0,""], function(err) {
if (err) {
console.error(err.message);
resolve({error:true,message:err.message});
}
else
{
resolve({error:false});
console.log(`Row(s) updated: ${this.changes}`);
}
});
}
catch (err) {
      console.error('Error listing tables:', err.message);
      reject(err);
    } finally {
      if (db) {
        await db.close();
      }
    }
});
}


async function rescanset()
{
console.log("rescanset");
let db;
return new Promise(async (resolve, reject) => {
try{
db = new sqlite3.Database(dbPath);

let sql = "UPDATE config SET Rescan = ? , Error = ? , Errormsg = ? WHERE ROWID = (SELECT ROWID FROM config LIMIT 1)";
db.run(sql, ["true",0,""], function(err) {
if (err) {
console.error(err.message);
resolve({error:true,message:err.message});
}
else
{
resolve({error:false});
console.log(`Row(s) updated: ${this.changes}`);
}
});
}
catch (err) {
      console.error('Error listing tables:', err.message);
      reject(err);
    } finally {
      if (db) {
        await db.close();
      }
    }
});
}


async function newtxn(txn)
{
return new Promise(async (resolve, reject) => {
try{
    const db = await new sqlite3.Database(dbPath, sqlite3.OPEN_READ_WRITE);
    var tmstmp = await Math.floor(Date.now() / 1000);
    const stmt = await db.prepare('INSERT INTO transactions (Fromadr, Txid , Amount, Type, Tmstmp) VALUES (?, ?, ?, ?, ?)');
    console.log(txn);
    await stmt.run(txn.fromadr, txn.txid, txn.amt, txn.type, tmstmp);
    await stmt.finalize();
    await db.close();
    var message={error:false,message:"Success"};
    resolve(message);
}
catch (err) {
    console.error('Error inserting txns:', err.message);
    var message={error:true,message: err.message};
    resolve(message);
}
});
}



async function gettxn(fromadr)
{
return new Promise(async (resolve, reject) => {
try
{
const db1 = await new sqlite3.Database(dbPath, sqlite3.OPEN_READ_WRITE);
await db1.all("SELECT * FROM transactions WHERE Fromadr = ?",[fromadr], (err, row) => {
console.log(row);
resolve(row);
});
await db1.close();
}
 catch (err) {
    console.error('Error reading txns:', err.message);
    var message={error:true,message: err.message};
    resolve(message);
  }
});
}


module.exports = { cookieread , writezconf , generate6DigitCode , generate8DigitCode , decryptObj , encryptData , create , isValid , getRemotelogin, getsettings , putsettings,updateerror,readconf,rescanreset,reindexreset,rescanset,reindexset,newtxn,gettxn};
