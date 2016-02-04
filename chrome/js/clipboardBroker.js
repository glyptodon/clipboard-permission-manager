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

    // Forward request for clipboard data if clipboard access is granted
    document.addEventListener('_clip-perm-man-get-data', function getData(e) {
        chrome.runtime.sendMessage({
            'type' : 'get-data'
        }, notifyClipboardRead);
    });

    // Forward request to set clipboard data if clipboard access is granted
    document.addEventListener('_clip-perm-man-set-data', function setData(e) {
        chrome.runtime.sendMessage({
            'type' : 'set-data',
            'data' : e.detail
        });
    });

})();

