import { BaseMessage } from "./types";
export default function getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
  }

  export const messages: Array<BaseMessage> = [{sourceServiceName: 'Service 1',
  timestamp: '1234',
  requestId: '_id1234',
  correlationId: '_corr1234',messageCounter:0}, 
  {sourceServiceName: 'Service 1',
  timestamp: '1234',
  requestId: '_id1234',
  correlationId: '_corr1234', messageCounter:0}];

// export const messages2: Array<BaseMessage> =[{sourceServiceName: 'Service 1.1',
//   timestamp: '1234',
//   requestId: '_id1234',
//   correlationId: '_corr1234',messageCounter:0},{sourceServiceName: 'Service 1.1',
//   timestamp: '1234',
//   requestId: '_id1234',
//   correlationId: '_corr1234',messageCounter:0}]

export const routes1: Array<string> = ['wildbreeze.highfive.hfd.added', 
  'wildbreeze.highfive.hfd.deleted', 'wildbreeze.highfive.note.added', 'wildbreeze.highfive.note.deleted','wildbreeze.highfive.note.updated',
  'wildbreeze.highfive.reaction.updated', 'wildbreeze.highfive.hfd.updated', 'wildbreeze.highfive.reaction.deleted', 'wildbreeze.highfive.reaction.added'];
  
// export const routes2: Array<string> = ['wildbreeze.users.user.added', 
//       'wildbreeze.users.user.online', 'wildbreeze.users.user.offline', 
//       'wildbreeze.users.user.deleted', 'wildbreeze.users.user.updated'];
  
export function getRandomMessage(source: Array<BaseMessage>): BaseMessage{
  const index = getRandomIntInclusive(0, source.length-1);
  return source[index];
}

export function getRandomRoute(source: Array<string>) : string {
  const index = getRandomIntInclusive(0, source.length-1);
  return source[index];
}

export function delay(n:number){
  return new Promise(function(resolve){
      setTimeout(resolve,n*1000);
  });
}