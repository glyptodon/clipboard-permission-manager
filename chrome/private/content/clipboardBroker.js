/*
 * Copyright (C) 2016 Glyptodon Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * @file Acts as the intermediary between the injected document.execCommand()
 * implementation and the privileged background script with actual clipboard
 * access. Requests to set or read clipboard data are only honored if the user
 * has granted explicit permission, thus this script functions as access
 * control surrounding the local clipboard.
 *
 * If the user has granted access, clipboard data is requested by firing a
 * '_clip-perm-man-get-data' event at the document level, which will result
 * in a '_clip-perm-man-data' event containing the clipboard data if access
 * to clipboard data is allowed, while The clipboard contents can be set by
 * sending the contents within a '_clip-perm-man-set-data' event. If access
 * has not been granted, neither of these events will have any effect.
 *
 * @author Michael Jumper
 */

(function() {

    /**
     * The origin (protocol, domain, etc. portion of the URL) of the current
     * tab.
     *
     * @type {String}
     */
    var origin = window.location.origin;

    /**
     * Signals the popup service that the clipboard permission popup for the
     * current tab should be shown using an icon appropriate for the given
     * permissions. This permissions object MUST consist of two properties:
     * "origin", which will be the origin (protocol, domain, etc. portion of
     * the URL) of the tab for which the permission is granted, and "allowed",
     * a boolean which will be true if and only if direct clipboard access is
     * granted to the origin in question.
     *
     * @param {Object} perms
     *     An object representing the permissions granted to this tab.
     */
    var showPopup = function showPopup(perms) {
        chrome.runtime.sendMessage({
            'type' : 'display-popup',
            'data' : perms
        });
    };

    /**
     * Retrieves an object representing the permissions granted to this tab.
     * This object will consist of two properties: "origin", which will be the
     * origin (protocol, domain, etc. portion of the URL) of the tab for which
     * the permission is granted, and "allowed", a boolean which will be true
     * if and only if direct clipboard access is granted to the origin in
     * question.
     *
     * This function operates asynchronously, and will return the data via the
     * sole parameter of the provided callback.
     *
     * @param {Function}
     *     The callback to invoke with the returned data once retrieved.
     */
    var getPermissions = function getPermissions(callback) {
        chrome.storage.sync.get(origin, function valuesRetrieved(values) {
            callback({
                'origin'  : origin,
                'allowed' : (values && values[origin]) || false
            });
        });
    };

    /**
     * Invokes the given callback if and only if clipboard access has been
     * granted.
     *
     * @param {Function} callback
     *     The callback to invoke if and only if clipboard access has been
     *     granted.
     */
    var ifAllowed = function ifAllowed(callback) {
        getPermissions(function checkIfAllowed(perms) {

            // Invoke callback only if allowed
            if (perms.origin === origin && perms.allowed)
                callback();

        });
    };

    /**
     * Assigns the permissions granted to this tab. This object MUST consist of
     * two properties: "origin", which will be the origin (protocol, domain,
     * etc. portion of the URL) of the tab for which the permission is granted,
     * and "allowed", a boolean which will be true if and only if direct
     * clipboard access is granted to the origin in question. If the permission
     * object does not match the origin of the current tab, this function will
     * have no effect.
     *
     * @param {Object} data
     *     An object representing the permissions granted to this tab.
     */
    var setPermissions = function setPermissions(data) {

        // Only honor requests which affect this page
        if (data.origin !== origin)
            return;

        // If not allowed, simply remove any existing setting
        if (!data.allowed)
            chrome.storage.sync.remove(origin);

        // Store setting otherwise
        else {
            var storageData = {};
            storageData[origin] = data.allowed;
            chrome.storage.sync.set(storageData);
        }

        // Signal popup to update according to new permissions
        showPopup(data);

    };

    /**
     * Notifies the overridden document.execCommand() implementation that the
     * local clipboard contents have been successfully read as requested.
     *
     * @param {String} contents
     *     The local clipboard contents.
     */
    var notifyClipboardRead = function notifyClipboardRead(contents) {
        document.dispatchEvent(new CustomEvent('_clip-perm-man-data', {
            'detail' : contents 
        }));
    };

    // Show the popup if a request for access confirmation is received
    document.addEventListener('_clip-perm-man-confirm',
            function confirmAccess() {
        getPermissions(function checkIfAllowed(perms) {
            showPopup(perms);
        });
    });

    // Forward request for clipboard data if clipboard access is granted
    document.addEventListener('_clip-perm-man-get-data', function getData(e) {

        // Only forward request if allowed
        ifAllowed(function forwardGetRequest() {
            chrome.runtime.sendMessage({
                'type' : 'get-data'
            }, notifyClipboardRead);
        });

    });

    // Forward request to set clipboard data if clipboard access is granted
    document.addEventListener('_clip-perm-man-set-data', function setData(e) {

        // Only forward request if allowed
        ifAllowed(function forwardSetRequest() {
            chrome.runtime.sendMessage({
                'type' : 'set-data',
                'data' : e.detail
            });
        });

    });

    // Wait for requests to check or alter permissions
    chrome.runtime.onMessage.addListener(function handleMessage(message,
                sender, sendResponse) {

        // Handle message appropriately depending on message type
        switch (message.type) {

            // Send the permissions currently granted to this page
            case 'get-permissions':
                getPermissions(sendResponse);
                return true;

            // Assign permissions when requested
            case 'set-permissions':
                setPermissions(message.data);
                break;

        };

    }); // end message handler

})();

