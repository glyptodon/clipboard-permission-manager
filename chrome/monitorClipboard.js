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
 * @file Responds to messages received from the clipboard broker, which MUST
 * only send such messages if clipboard access is granted. Requests will take
 * the form of messages having a "type" property which may be "get-data" for
 * requests to read clipboard data and "set-data" for requests to set the
 * current clipboard data. If the type is "get-data", the response callback
 * given to chrome.runtime.sendMessage() will be invoked with the current
 * clipboard data if and when it is successfully read. If the type is
 * "set-data", an additional "data" property must be present which contains
 * the string data to set.
 *
 * @author Michael Jumper
 */

// Wait for and handle any clipboard request messages from the content page
chrome.runtime.onMessage.addListener(function handleMessage(message, sender,
            sendResponse) {

    // Handle message appropriately depending on message type
    switch (message.type) {

        // STUB: Pull clipboard data if requested
        case 'get-data':
            sendResponse('TEST: ' + new Date().toString());
            break;

        // STUB: Set clipboard data if requested
        case 'set-data':
            console.log('SET', message.data);
            break;

    }

});

