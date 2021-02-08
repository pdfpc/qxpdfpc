/* ************************************************************************

   Copyright: 2021 E. Stambulchik

   License: GPLv3+

   Authors: E. Stambulchik

************************************************************************ */

/**
 * TODO: needs documentation
 */
qx.Class.define("pdfpc.page.Main",
{
    extend : qx.ui.mobile.page.NavigationPage,

    construct : function()
    {
        this.base(arguments);
        // this.setTitle("Main");
        this.setNavigationBarHidden(true);
    },

    members :
    {
        slide   : null,
        notes   : null,
        baseUrl : null,
        rest    : null,

        drawer  : null,

        slideLabel : null,

        form : null,
        host : null,
        port : null,
        ssl  : null,
        pwd  : null,

        meta : null,

        setSlideLabel : function(slideNum, endSlideNum)
        {
            var str = (slideNum + 1) + "/" + (endSlideNum + 1);
            this.slideLabel.setValue(str);
        },

        loadSlide : function(slideNum)
        {
            var root = new qx.ui.mobile.core.Root();
            var width = root.getWidth();
            var height = Math.round(width/this.meta.aspect_ratio);
            var url = this.baseUrl +
                "/slides/" + slideNum + "/image?w=" + width + "&h=" + height;
            // var style = 'style="filter: invert(1);"';
            var html = '<img style="width:100%;height:auto;aspect-ratio:' +
                width + '/' + height + ';" src="' + url + '">';
            this.slide.setHtml(html);
        },

        loadNotes : function(slideNum)
        {
            var root = new qx.ui.mobile.core.Root();
            if (this.meta.note_is_image) {
                var width = root.getWidth();
                var height = Math.round(width/this.meta.aspect_ratio);
                var url = this.baseUrl +
                    "/notes/" + slideNum + "/image?w=" + width + "&h=" + height;
                var html = '<img style="width:100%;height:auto;aspect-ratio:' +
                    width + '/' + height + ';" src="' + url + '">';
            } else {
                var url = this.baseUrl + "/notes/" + slideNum + "/html";
                var html = '<iframe style="border:none;background:white;" ' +
                           'width="100%" src="' + url + '">';
            }
            this.notes.setHtml(html);
        },

        invokeAction : function(action, arg = null)
        {
            var data = {};
            data.action = action;
            data.argument = arg;
            this.rest.control(null, data);
        },

        updateConnection : function(connection)
        {
            // Build the REST base URL
            var url = "http";
            if (connection.ssl) {
                url += "s";
            }
            url += "://" + connection.host + ":" + connection.port + "/api";
            this.baseUrl = url;

            this.rest.setBaseUrl(url);

            this.rest.configureRequest(function(req) {
                req.setRequestHeader("Content-Type", "application/json");
                req.setAuthentication(new
                    qx.io.request.authentication.Basic("pdfpc",
                        connection.passwd));
                });

            // Begin the session
            this.rest.helo();
        },


        /**
         * Event handler for <code>tap</code> on the connect button.
         */
        onConnectTap: function() {
            // use form validation
            if (this.form.validate()) {
                var connection = {};
                connection.host   = this.host.getValue();
                connection.port   = this.port.getValue();
                connection.ssl    = this.ssl.getValue() ? true:false;
                connection.passwd = this.pwd.getValue();

                qx.module.Storage.setLocalItem("connection", connection);

                this.drawer.hide();
                this.updateConnection(connection);
            }
        },

        // overridden
        _initialize : function()
        {
            this.base(arguments);
            this.meta = {};

            var restDescription = {
                "helo":    {method: "GET", url: "/helo"        },
                "meta":    {method: "GET", url: "/meta"        },
                "state":   {method: "GET", url: "/state"       },
                "slide":   {method: "GET", url: "/slides/{idx}"},
                "notes":   {method: "GET", url: "/notes/{idx}" },
                "control": {method: "PUT", url: "/control"     }
            };
            var rest = this.rest = new qx.io.rest.Resource(restDescription);

            rest.addListener("success", function(e) {
                    var r = e.getRequest();
                    var action = e.getAction();
                    switch (action) {
                    case "helo":
                        var ehlo = r.getResponse();
                        if (ehlo != null && ehlo.application == "pdfpc") {
                            // Get the metadata
                            this.rest.meta();
                        }
                        break;
                    case "meta":
                        var meta = r.getResponse();
                        if (meta != null) {
                            this.meta = meta;
                            // Request the state
                            this.rest.state();
                        }
                        break;
                    case "state":
                    case "control":
                        var state = r.getResponse();
                        if (state != null) {
                            // Refresh the state
                            if (state.slide !== null) {
                                this.setSlideLabel(state.user_slide,
                                    state.end_user_slide);
                                this.loadSlide(state.slide);
                                this.loadNotes(state.slide);
                            }
                            return;
                        }
                        break;
                    }
                }, this);

            rest.addListener("error", function(e) {
                    var r = e.getRequest();
                    var status = r.getStatus();
                    console.log("Error: " + status);
                    if (status == 401 || status == 0) {
                        this.drawer.show();
                    } else
                    if (status == 412) {
                        this.rest.helo();
                    }
                }, this);


            // Build the GUI
            var content = this.getContent();
            var slide = this.slide = new qx.ui.mobile.embed.Html();
            slide.addListener("swipe", function(e) {
                    var axis = e.getAxis();
                    if (axis == "x") {
                        if (e.getDirection() == "right") {
                            this.invokeAction("prev");
                        } else {
                            this.invokeAction("next");
                        }
                    }
                }, this);
            content.add(slide);

            var composite = new qx.ui.mobile.container.Composite();
            var layout = new qx.ui.mobile.layout.HBox();
            layout.setAlignX("center");
            layout.setAlignY("middle");
            composite.setLayout(layout);
            content.add(composite);
   
            var nextButton = new qx.ui.mobile.form.Button("Next");
            nextButton.addListener("tap", function(e) {
                    this.invokeAction("next");
                }, this);
            var prevButton = new qx.ui.mobile.form.Button("Prev");
            prevButton.addListener("tap", function(e) {
                    this.invokeAction("prev");
                }, this);

            var slideLabel = this.slideLabel =
                new qx.ui.mobile.basic.Label("slide");
            composite.add(prevButton);
            composite.add(slideLabel);
            composite.add(nextButton);

            var notes = this.notes = new qx.ui.mobile.embed.Html();
            content.add(notes);

            var drawer = this.drawer =
                new qx.ui.mobile.container.Drawer(this);
            drawer.setOrientation("top");
            var root = new qx.ui.mobile.core.Root();
            var width = root.getWidth();
            drawer.setSize(Math.round(3*width/4));
 
 
            var toolbar = new qx.ui.mobile.toolbar.ToolBar();
            content.add(toolbar);

            var button = new qx.ui.mobile.toolbar.Button("Connection");
            button.addListener("tap", function() {
                    drawer.show();
                });
            toolbar.add(button);
            var fs = qx.bom.FullScreen.getInstance();
            button = new qx.ui.mobile.toolbar.Button("Toggle fullscreen");
            button.addListener("tap", function() {
                    if (fs.isFullScreen()) {
                        fs.cancel();
                    } else {
                        fs.request();
                    }
                });
            toolbar.add(button);

 
            // Hostname
            var host = this.host = new qx.ui.mobile.form.TextField();
            host.setRequired(true);

            // Port
            var port = this.port = new qx.ui.mobile.form.NumberField();
            port.setMinimum(1);
            port.setRequired(true);

            // SSL
            var ssl = this.ssl = new qx.ui.mobile.form.ToggleButton(false,
                "YES", "NO");

            // Password
            var pwd = this.pwd = new qx.ui.mobile.form.PasswordField();
            pwd.setRequired(true);

            // Connect Button
            var connectButton = new qx.ui.mobile.form.Button("Connect");
            connectButton.addListener("tap", this.onConnectTap, this);

            var connectForm = this.form = new qx.ui.mobile.form.Form();
            connectForm.add(host, "Hostname");
            connectForm.add(port, "Port");
            connectForm.add(ssl, "SSL");
            connectForm.add(pwd, "Password");

            // Use form renderer
            drawer.add(new qx.ui.mobile.form.renderer.Single(connectForm));
            drawer.add(connectButton);
 
            var connection = qx.module.Storage.getLocalItem("connection");
            if (connection == null) {
                connection = {};
            }

            // Prefill the form
            if (connection.host) {
                host.setValue(connection.host);
            } else {
                host.setValue("localhost");
            }
            if (connection.port) {
                port.setValue(connection.port);
            } else {
                port.setValue(8088);
            }
            ssl.setValue(connection.ssl);
            pwd.setValue(connection.passwd);

            if (!connection || !connection.host || !connection.port) {
                drawer.show();
                return;
            }

            this.updateConnection(connection);
        }
    }
});
