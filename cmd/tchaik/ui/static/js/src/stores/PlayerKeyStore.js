'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('eventemitter3').EventEmitter;
var assign = require('object-assign');

var WebsocketConstants = require('../constants/WebsocketConstants.js');
var WebsocketAPI = require('../utils/WebsocketAPI.js');

var ControlConstants = require('../constants/ControlConstants.js');

var CHANGE_EVENT = 'change';

var _playerKey = null;
var _pushKey = null;

function setKey(k) {
  _playerKey = k;
  localStorage.setItem("playerKey", k);
}

function key() {
  if (_playerKey !== null) {
    return _playerKey;
  }
  var k = localStorage.getItem("playerKey");
  _playerKey = (k) ? k : "";
  return _playerKey;
}

function sendKey(key) {
  WebsocketAPI.send("KEY", {key: key});
}

function setPushKey(k) {
  _pushKey = k;
  localStorage.setItem("pushKey", k);
}

function pushKey() {
  if (_pushKey !== null) {
    return _pushKey;
  }
  var k = localStorage.getItem("pushKey");
  _pushKey = (k) ? k : "";
  return _pushKey;
}


var PlayerKeyStore = assign({}, EventEmitter.prototype, {

  isKeySet: function() {
    var k = key();
    if (k === null || k === "") {
      return false;
    }
    return true;
  },

  getKey: function() {
    return key();
  },

  isPushKeySet: function() {
    var k = pushKey();
    if (k === null || k === "") {
      return false;
    }
    return true;
  },

  getPushKey: function() {
    return pushKey();
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  /**
   * @param {function} callback
   */
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

});

PlayerKeyStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;
  var source = payload.source;

  if (source === 'VIEW_ACTION') {
    switch (action.actionType) {
      case ControlConstants.SET_KEY:
        setKey(action.key);
        sendKey(action.key);
        PlayerKeyStore.emitChange();
        break;

      case ControlConstants.SET_PUSH_KEY:
        setPushKey(action.key);
        PlayerKeyStore.emitChange();
        break;

      case WebsocketConstants.RECONNECT:
        if (PlayerKeyStore.isKeySet()) {
          sendKey(PlayerKeyStore.getKey());
        }
        break;
    }
  }
  return true;
});

module.exports = PlayerKeyStore;
