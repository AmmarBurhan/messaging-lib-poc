"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = exports.getRandomRoute = exports.getRandomMessage = exports.routes2 = exports.routes1 = exports.messages2 = exports.messages = void 0;
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}
exports.default = getRandomIntInclusive;
exports.messages = [{ sourceServiceName: 'Service 1',
        timestamp: '1234',
        requestId: '_id1234',
        correlationId: '_corr1234', messageCounter: 0 },
    { sourceServiceName: 'Service 1',
        timestamp: '1234',
        requestId: '_id1234',
        correlationId: '_corr1234', messageCounter: 0 }];
exports.messages2 = [{ sourceServiceName: 'Service 1.1',
        timestamp: '1234',
        requestId: '_id1234',
        correlationId: '_corr1234', messageCounter: 0 }, { sourceServiceName: 'Service 1.1',
        timestamp: '1234',
        requestId: '_id1234',
        correlationId: '_corr1234', messageCounter: 0 }];
exports.routes1 = ['wildbreeze.highfive.hfd.added',
    'wildbreeze.highfive.hfd.deleted', 'wildbreeze.highfive.note.added', 'wildbreeze.highfive.note.deleted', 'wildbreeze.highfive.note.updated',
    'wildbreeze.highfive.reaction.updated', 'wildbreeze.highfive.hfd.updated', 'wildbreeze.highfive.reaction.deleted', 'wildbreeze.highfive.reaction.added'];
exports.routes2 = ['wildbreeze.users.user.added',
    'wildbreeze.users.user.online', 'wildbreeze.users.user.offline',
    'wildbreeze.users.user.deleted', 'wildbreeze.users.user.updated'];
function getRandomMessage(source) {
    const index = getRandomIntInclusive(0, source.length - 1);
    return source[index];
}
exports.getRandomMessage = getRandomMessage;
function getRandomRoute(source) {
    const index = getRandomIntInclusive(0, source.length - 1);
    return source[index];
}
exports.getRandomRoute = getRandomRoute;
function delay(n) {
    return new Promise(function (resolve) {
        setTimeout(resolve, n * 1000);
    });
}
exports.delay = delay;
