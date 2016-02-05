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
 * @file Overrides the default document.execCommand() implementation, providing
 * versions of the "cut", "copy", and "paste" commands which directly access
 * clipboard data if permission has been explicitly granted for the current
 * page. If permission has not been granted, or a different command is given,
 * the default document.execCommand() implementation is used.
 *
 * @author Michael Jumper
 */

// Override document.execCommand() such that clipboard data can be exposed
// without corresponding user events if permission is explicitly granted.
(function overrideExecCommand() {

    /**
     * The current contents of the local clipboard. This will be continuously
     * updated by the clipboard monitor script. If the clipboard cannot be read
     * this will be null.
     *
     * @type {String}
     */
    var clipboardContents = null;

    /**
     * The previous definition of document.execCommand(). This function will be
     * invoked when the original behavior of document.execCommand() is needed.
     *
     * @type {Function}
     */
    var _execCommand = document.execCommand;

    /**
     * Sets the value of the local clipboard to the given string.
     *
     * @param {String} value
     *     The value to assign to the local clipboard.
     */
    var setLocalClipboard = function setLocalClipboard(value) {
        document.dispatchEvent(new CustomEvent('_clip-perm-man-set-data', {
            'detail' : value
        }));
    };

    /**
     * Requests that data from the local clipboard be pulled. This pull is
     * asynchronous; data will be returned via a "_clip-perm-man-data" event
     * if reading from the clipboard is successful.
     */
    var requestLocalClipboard = function requestLocalClipboard() {

        // Defer request for clipboard data
        window.setTimeout(function requestClipboardData() {
            document.dispatchEvent(new CustomEvent('_clip-perm-man-get-data'));
        }, 50);

    };

    /**
     * Map of handlers for document.execCommand() functions, where the key of
     * each entry is the name of the command being overridden.
     *
     * @type {Object.<String, Function>}
     */
    var commandHandlers = {

        /**
         * Handler for document.execCommand('cut').
         */
        'cut' : function handleCut() {
            setLocalClipboard(window.getSelection().toString());
            _execCommand.call(this, 'insertText', false, '');
        },

        /**
         * Handler for document.execCommand('copy').
         */
        'copy' : function handleCopy() {
            setLocalClipboard(window.getSelection().toString());
        },

        /**
         * Handler for document.execCommand('paste').
         */
        'paste' : function handlePaste() {
            _execCommand.call(this, 'insertText', false, clipboardContents);
        }

    };

    /**
     * An implementation of document.execCommand() which allows access to all
     * clipboard commands as long as the user has approved this access ahead of
     * time. All other commands are passed through to the browser's own
     * document.execCommand() implementation.
     *
     * @param {String} name
     *     The name of the command to execute within the current document.
     *
     * @return {Boolean}
     *     true if the command was executed successfully, false otherwise.
     */
    document.execCommand = function clipExecCommand(name) {

        // Override behavior only if the command has a defined handler
        var commandHandler = commandHandlers[name];
        if (commandHandler) {

            // If clipboard has ever successfully been read, override default
            // behavior of document.execCommand()
            if (clipboardContents !== null) {
                commandHandler.apply(this);
                return true;
            }

        }

        // Otherwise pass through to original execCommand() implementation
        return _execCommand.apply(this, arguments);

    };

    // Request an update of the local clipboard when it may have changed
    window.addEventListener('load',  requestLocalClipboard, true);
    window.addEventListener('focus', requestLocalClipboard, true);
    window.addEventListener('copy',  requestLocalClipboard, true);
    window.addEventListener('cut',   requestLocalClipboard, true);

    // When clipboard contents are received, update our internal clipboard
    // content tracking property
    document.addEventListener('_clip-perm-man-data', function handleData(e) {
        clipboardContents = e.detail;
    });

})();

