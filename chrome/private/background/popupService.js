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
 * @file Handles requests to display the permission control popup.
 *
 * @author Michael Jumper
 */

(function() {

    /**
     * Sets the icon of the popup for the given tab depending on whether
     * clipboard access is currently allowed.
     *
     * @param {Tab} tab
     *     The tab associated with the popup.
     *
     * @param {Boolean} allowed
     *     Whether clipboard access is currently allowed on the given tab.
     */
    var setIcon = function setIcon(tab, allowed) {

        var iconPaths;

        // If clipboard access is granted, select the "allowed" icon
        if (allowed)
            iconPaths = {
                '19' : 'private/popup/icons/clipboard-allow-19.png',
                '38' : 'private/popup/icons/clipboard-allow-38.png'
            };

        // Otherwise, select the "denied" icon
        else
            iconPaths = {
                '19' : 'private/popup/icons/clipboard-deny-19.png',
                '38' : 'private/popup/icons/clipboard-deny-38.png'
            };

        // Update the popup to use the selected icon
        chrome.pageAction.setIcon({
            'tabId' : tab.id,
            'path'  : iconPaths
        });

    };

    // Wait for requests to display the popup
    chrome.runtime.onMessage.addListener(function handleMessage(message,
                sender, sendResponse) {

        // Handle message appropriately depending on message type
        switch (message.type) {

            // Display the clipboard popup when requested
            case 'display-popup':
                chrome.pageAction.show(sender.tab.id);
                setIcon(sender.tab, message.data.allowed);
                break;

        }

    }); // end message handler

})();

