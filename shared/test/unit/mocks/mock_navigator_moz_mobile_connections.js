'use strict';

/**
 * Will provide 1 Mobileconnection by default. call mAddMobileConnection and
 * mRemoveMobileConnection to add/remove extra connections.
 */
(function() {
  function MockMobileconnection() {
    var props = ['voice', 'data', 'iccId', 'radioState', 'iccInfo'];
    var eventListeners = null;
    var radioEnabledReq = null;
    var sendMMIReq = null;

    function mnmmc_init() {
      props.forEach(function(prop) {
        _mock[prop] = null;
      });
      eventListeners = {
        'voicechange': [],
        'iccinfochange': [],
        'radiostatechange': [],
        'datachange': [],
        'cfstatechange': [],
        'ussdreceived': []
      };
      radioEnabledReq = {};
      sendMMIReq = {};
    }

    function mnmmc_addEventListener(type, callback) {
      if (eventListeners[type]) {
        eventListeners[type][eventListeners[type].length] = callback;
      }
    }

    function mnmmc_removeEventListener(type, callback) {
      if (eventListeners[type]) {
        var idx = eventListeners[type].indexOf(callback);
        eventListeners[type].splice(idx, 1);
      }
    }

    function mnmmc_triggerEventListeners(type, evt) {
      if (!eventListeners[type]) {
        return;
      }
      eventListeners[type].forEach(function(callback) {
        if (typeof callback === 'function') {
          callback(evt);
        } else if (typeof callback == 'object' &&
                   typeof callback.handleEvent === 'function') {
          callback.handleEvent(evt);
        }
      });

      if (typeof _mock['on' + type] === 'function') {
        _mock['on' + type](evt);
      }
    }

    function mnmmc_setRadioEnabled() {
      return radioEnabledReq;
    }

    function mnmmc_sendMMI() {
      return sendMMIReq;
    }
    function mnmmc_cancelMMI() {}

    var _mock = {
      // Constants
      ICC_SERVICE_CLASS_VOICE: (1 << 0),
      ICC_SERVICE_CLASS_DATA: (1 << 1),
      ICC_SERVICE_CLASS_FAX: (1 << 2),
      ICC_SERVICE_CLASS_SMS: (1 << 3),
      ICC_SERVICE_CLASS_DATA_SYNC: (1 << 4),
      ICC_SERVICE_CLASS_DATA_ASYNC: (1 << 5),
      ICC_SERVICE_CLASS_PACKET: (1 << 6),
      ICC_SERVICE_CLASS_PAD: (1 << 7),
      ICC_SERVICE_CLASS_MAX: (1 << 7),
      // Methods
      addEventListener: mnmmc_addEventListener,
      removeEventListener: mnmmc_removeEventListener,
      triggerEventListeners: mnmmc_triggerEventListeners,
      setRadioEnabled: mnmmc_setRadioEnabled,
      sendMMI: mnmmc_sendMMI,
      cancelMMI: mnmmc_cancelMMI,
      mTeardown: mnmmc_init,
      get mCachedRadioEnabledReq() {
        return radioEnabledReq;
      },
      get mCachedSendMMIReq() {
        return sendMMIReq;
      },
      get mEventListeners() {
        return eventListeners;
      }
    };

    mnmmc_init();

    return _mock;
  }

  function MockMobileConnections() {
    var _mobileConnections = [];

    function _mAddMobileConnection(newConn, index) {
      if (newConn) {
        _mobileConnections.splice(index, 0, newConn);
        _mock[index] = newConn;
      } else {
        var conn = MockMobileconnection();
        _mock[_mobileConnections.length] = conn;
        _mobileConnections.push(conn);
      }
    }

    function _mRemoveMobileConnection(index) {
      if (!_mobileConnections.length) {
        return;
      }

      if (index) {
        _mobileConnections.splice(index, 1);
        _mock[index] = null;
      } else {
        _mobileConnections.splice(_mobileConnections.length - 1, 1);
        _mock[_mobileConnections.length - 1] = null;
      }
    }

    function _mTeardown() {
      _mobileConnections.every(function(conn, index) {
        conn.mTeardown();
      });
      _mobileConnections = [];
      _mAddMobileConnection();
    }

    var _mock = {
      mTeardown: _mTeardown,
      mAddMobileConnection: _mAddMobileConnection,
      mRemoveMobileConnection: _mRemoveMobileConnection,
      get length() {
        return _mobileConnections.length;
      }
    };

    _mAddMobileConnection();

    return _mock;
  }

  window.MockMobileconnection = MockMobileconnection;
  window.MockNavigatorMozMobileConnections = MockMobileConnections();
})();
