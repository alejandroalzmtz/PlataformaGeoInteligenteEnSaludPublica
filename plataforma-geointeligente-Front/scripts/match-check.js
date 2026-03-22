const fs = require('fs');
const path = require('path');

const mxPath = path.join(__dirname, '..', 'src', 'assets', 'mx.json');
const mapDataPath = path.join(__dirname, '..', 'map-data-sample.json');

function normalize(s){
  if(!s) return '';
  try{ return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }catch(e){ return s.toLowerCase(); }
}

const mx = require(mxPath);
const featureNames = mx.features.map(f => f.properties && f.properties.name).filter(Boolean);

let mapData;
if(fs.existsSync(mapDataPath)){
  mapData = require(mapDataPath);
} else {
  console.error('map-data-sample.json not found. Please create it with the API response.');
  process.exit(2);
}

const mappingFile = path.join(__dirname, '..', 'src', 'app', 'core', 'constants', 'state-mapping.ts');
const mappingSrc = fs.readFileSync(mappingFile,'utf8');
const nameToId = {};
mappingSrc.split('\n').forEach(line => {
  const m = line.match(/^\s*'([^']+)'\s*:\s*(\d+)/);
  if(m){ nameToId[m[1]] = Number(m[2]); }
});
const idToName = {};
Object.keys(nameToId).forEach(n => idToName[nameToId[n]] = n);

let found = 0;
mapData.data.forEach(d => {
  const mappedName = idToName[d.idEstado] || d.nombreEstado || '';
  const target = normalize(mappedName);
  const match = featureNames.find(fn => normalize(fn) === target);
  if(match) found++;
  else console.log('No match for', d.idEstado, d.nombreEstado, 'mapped:', mappedName);
});
console.log(`Matched ${found} / ${mapData.data.length}`);
