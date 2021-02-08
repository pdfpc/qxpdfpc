/* ************************************************************************

   Copyright: 2021 E. Stambulchik

   License: GPLv3+

   Authors: E. Stambulchik

************************************************************************ */

/**
 * The main application class
 *
 * @asset(pdfpc/*)
 */
qx.Class.define("pdfpc.Application",
{
    extend : qx.application.Mobile,

    members :
    {
        /**
         * This method contains the initial application code and gets called
         * during startup of the application
         */
        main : function()
        {
            // Call super class
            this.base(arguments);

            // Enable logging in debug variant
            if (qx.core.Environment.get("qx.debug"))
            {
                // support native logging capabilities, e.g. Firebug for Firefox
                qx.log.appender.Native;
                // support additional cross-browser console.
                // Trigger a "longtap" event on the navigation bar for opening it.
                qx.log.appender.Console;
            }

            var main = new pdfpc.page.Main();

            // Add the pages to the page manager.
            var manager = new qx.ui.mobile.page.Manager(false);
            manager.addDetail([
                main
            ]);

            // Initialize the application routing
            this.getRouting().onGet("/", this._show, main);

            this.getRouting().init();
        },

        /**
         * Default behaviour when a route matches. Displays the corresponding page on screen.
         * @param data {Map} the animation properties
         */
        _show : function(data) {
            this.show(data.customData);
        }
    }
});
