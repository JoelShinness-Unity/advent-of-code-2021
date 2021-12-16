import { from, map, Observable } from 'rxjs';
import _ from 'lodash';
import { add, linesFromFile } from './lib';

function convertHexStringToBinary(str:string):string {
  return str.split('').map(x => parseInt(x, 16).toString(2).padStart(4, "0")).join("")
}
function *getGroups(str:string, packetLength:number = 5):IterableIterator<string>{
  let current = str;
  while(current.length >= packetLength){
    const nextSet = current.substring(0, packetLength);
    yield nextSet.substring(1)
    if(nextSet[0] === "0"){
      return;
    }
    current = current.substring(packetLength)
  }
}
type BasePackage = {
  version:number,
  strLength:number,
}
type LiteralPackage = BasePackage & {
  value:number
  typeId:4
}

type OperatorType = 0|1|2|3|5|6|7
type OperatorPackage = BasePackage & {
  typeId:OperatorType,
  subpackets:Package[]
}
type Package = LiteralPackage | OperatorPackage
function parseLiteralPackage(val:string):LiteralPackage {
  
  let literal = "";
  let strLength = 6
  for(const group of getGroups(val.substring(6))){
    strLength += 5;
    literal += group;
  }
  return {
    version: parseInt(val.substring(0, 3), 2),
    typeId: 4,
    value: parseInt(literal, 2),
    strLength
  }
}

function parseOperatorPackage0(val:string, typeId:OperatorType):OperatorPackage {
  const version = parseInt(val.substring(0, 3), 2);
  let subpacketsLength = parseInt(val.substring(7, 22), 2);
  let subpacketsString = val.substring(22, 22 + subpacketsLength)
  const subpackets:Package[] = []
  while(subpacketsString.length){
    const newSubpacket = parsePackage(subpacketsString);
    subpackets.push(newSubpacket);
    subpacketsString = subpacketsString.substring(newSubpacket.strLength);
  }
  return {
    version,
    typeId,
    strLength: 22 + subpacketsLength,
    subpackets
  }
}

function parseOperatorPackage1(val:string, typeId:OperatorType):OperatorPackage {
  const version = parseInt(val.substring(0, 3), 2);
  let subpacketsCount = parseInt(val.substring(7, 18), 2);
  let subpacketsString = val.substring(18);
  let strLength = 18;
  const subpackets:Package[] = []

  while(subpacketsCount){
    const newSubpacket = parsePackage(subpacketsString);
    subpackets.push(newSubpacket);
    subpacketsString = subpacketsString.substring(newSubpacket.strLength)
    strLength += newSubpacket.strLength
    subpacketsCount--
  }
  return {
    version,
    typeId,
    strLength,
    subpackets
  }
}

function parseOperatorPackage(val:string, typeId:OperatorType):OperatorPackage {
  return val[6] === "0" ? 
    parseOperatorPackage0(val, typeId) : 
    parseOperatorPackage1(val, typeId)
}

function parsePackage(val:string):Package|undefined{
  const typeId = parseInt(val.substring(3, 6), 2) as OperatorType | 4
  return typeId ===  4 ? parseLiteralPackage(val) : parseOperatorPackage(val,  typeId);
}

function countVersions(pkg:Package):number{
  if(pkg["value"]){
    return (pkg as LiteralPackage).version
  }
  return (pkg as OperatorPackage).subpackets.map(countVersions).reduce(add, pkg.version)
}
function challenge1(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
    map(convertHexStringToBinary),
    map(parsePackage),
    map(countVersions)
  );
}
function isLiteralPackage(pkg:Package):pkg is LiteralPackage {
  return (pkg as {}).hasOwnProperty('value')
}
function evalPackage(pkg:Package):number {
  if(isLiteralPackage(pkg)) return pkg.value;
  const evalledSubpackets = pkg.subpackets.map(evalPackage)
  switch(pkg.typeId){
    case 0: return evalledSubpackets.reduce(add);
    case 1: return evalledSubpackets.reduce((a,b) => a * b, 1)
    case 2: return Math.min(...evalledSubpackets)
    case 3: return Math.max(...evalledSubpackets)
    case 5: {
      const [a, b] = evalledSubpackets;
      return a > b ? 1 : 0
    }
    case 6: {
      const [a, b] = evalledSubpackets;
      return a < b ? 1 : 0
    }
    case 7: {
      const [a, b] = evalledSubpackets;
      return a === b ? 1 : 0
    }
  }
}

function challenge2(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
    map(convertHexStringToBinary),
    map(parsePackage),
    map(evalPackage)
  );
}

(() => {
  // linesFromMock()
  linesFromFile('../inputs/day-16.txt')
    .pipe(challenge1)
    // .pipe(challenge2)
    .subscribe(console.log.bind(console))
})();

function linesFromMock():Observable<string>{
  const mock = `C200B40A82
04005AC33890
880086C3E88112
CE00C43D881120
D8005AC2A8F0
F600BC2D8F
9C005AC2F8F0
9C0141080250320F1802104A08`
  return from(mock.split('\n'));
}
