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
 * @file Controls the display elements of the permission settings popup,
 * automatically pulling the current permissions when the popup is loaded.
 *
 * @author Michael Jumper
 */

/**
 * Map of all interface elements by their defined ID.
 *
 * @type {Object.<String, Element>}
 */
var elements = {

    /**
     * The interface element containing the name or URL of the website affected
     * by the settings in this popup.
     *
     * @type {Element}
     */
    'site' : document.getElementById('site'),

    /**
     * The interface element which displays whether clipboard access is
     * currently allowed or denied for the current website.
     *
     * @type {Element}
     */
    'state' : document.getElementById('state'),

    /**
     * A radio button which will be selected when clipboard access is allowed.
     *
     * @type {HTMLInputElement}
     */
    'allowed' : document.getElementById('allowed'),

    /**
     * A radio button which will be selected when clipboard access is denied.
     *
     * @type {HTMLInputElement}
     */
    'denied' : document.getElementById('denied')

};

/**
 * Sets the displayed state of clipboard access within this popup. Invoking
 * this function will affect the human-readable clipboard access state and the
 * corresponding radio buttons.
 *
 * @param {Boolean} allowed
 *     Whether clipboard access is currently allowed for the website affected
 *     by the settings within this popup.
 */
var setDisplayedState = function setDisplayedState(allowed) {

    // Access is currently allowed 
    if (allowed) {
        elements.state.textContent = 'allowed';
        elements.state.className = 'allowed';
        elements.allowed.checked = true;
    }

    // Access is currently denied
    else {
        elements.state.textContent = 'denied';
        elements.state.className = 'denied';
        elements.denied.checked = true;
    }

};

/**
 * Sets the name of the site to be displayed where relevant within the settings
 * interface of this popup.
 *
 * @param {String} name
 *     The name or URL of the website controlled by the settings within this
 *     popup.
 */
var setDisplayedSite = function setDisplayedSite(name) {
    elements.site.textContent = name;
};

// Update displayed state whenever the selection changes
elements.allowed.onchange = elements.denied.onchange = function updateState() {
    setDisplayedState(elements.allowed.checked);
};

// Pull permission information from active tab when known
chrome.tabs.query({
    'active' : true,
    'currentWindow' : true,
}, function tabsReceived(tabs) {

    // Init display state with permissions granted to active tab
    chrome.tabs.sendMessage(tabs[0].id, {
        'type' : 'check-permission'
    }, function permissionReceived(perm) {
        setDisplayedSite(perm.origin);
        setDisplayedState(perm.allowed);
    });

});

