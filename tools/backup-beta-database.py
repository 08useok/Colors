"""Read-only SQLite online backup with a logical-content verification."""
import argparse, hashlib, json, sqlite3
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def digest(db):
    tables = [r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")]
    result = {}
    for name in tables:
        quoted = '"' + name.replace('"', '""') + '"'
        rows = db.execute('SELECT * FROM ' + quoted).fetchall()
        encoded = sorted(json.dumps(list(r), ensure_ascii=False, default=lambda b:b.hex(), separators=(',', ':')) for r in rows)
        result[name] = {'rows':len(rows), 'sha256':hashlib.sha256(('\n'.join(encoded)).encode()).hexdigest()}
    return result

if __name__ == '__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--source',type=Path,default=ROOT/'.local/beta-auth.sqlite');args=parser.parse_args()
    source=args.source.resolve(strict=True)
    folder=ROOT/'.local/backups'/datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ');folder.mkdir(parents=True,exist_ok=False)
    target=folder/'beta-auth.sqlite'
    with sqlite3.connect(source.as_uri()+'?mode=ro',uri=True,timeout=15) as live:
        live.execute('BEGIN')
        before=digest(live)
        with sqlite3.connect(target) as out:
            live.backup(out)
            assert out.execute('PRAGMA integrity_check').fetchall()==[('ok',)]
            assert out.execute('PRAGMA foreign_key_check').fetchall()==[]
            assert digest(out)==before, 'backup logical contents differ'
        live.rollback()
        after=digest(live)
    report={'createdAt':datetime.now(timezone.utc).isoformat(),'source':str(source),'backup':str(target),'method':'SQLite online backup from read-only connection; WAL included','integrity':'ok','foreignKeys':'ok','tables':before,'sourceUnchanged':before==after,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
    (folder/'manifest.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'backup':str(target),'manifest':str(folder/'manifest.json'),'sourceUnchanged':report['sourceUnchanged']}))
