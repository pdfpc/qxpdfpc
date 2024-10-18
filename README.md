About
=====

`qxpdfpc` is a Web-based application for remotely controlling
[PDF Presenter Console (aka pdfpc)](https://pdfpc.github.io). It is mainly aimed
at mobile (specifically, smartphone) devices.

**`qxpdfpc` requires `pdfpc` at least version 4.6**.

Installation
============

- Fetch the qxpdfpc sources from [github.com](https://github.com/pdfpc/qxpdfpc).

- Download and install the [Qooxdoo toolkit](https://qooxdoo.org/). You need
  version 7.7 or above.

- In the qxpdfpc root directory, run `qx compile`. This should produce
  the `compiled` directory with various files and subdirectories.


Usage
=====
- Configure `pdfpc`. Set these options in the `pdfpcrc` file (`man pdfpcrc`):
    - `option rest-static-root /full/path/to/qxpdfpc/compiled/source`
    - `option rest-passwd a_very_secret_password` (yes, make it special; you do
      not want somebody else from the auditorium to control your presentation,
      do you?) In principle, `pdfpc` can generate a secure random password and
      allow to scan it and other connection details in the form of a QR-encoded
      image, but currently `qxpdfpc` does not support it.

- Run `pdfpc` with the `-V` flag. This will enable the application Web server
  bound to port 8088. If another port is desired, it can be configured either on
  the command line (`-p`) or permanently in `pdfpcrc`.

- Make sure access to the port from outside is not blocked (that is, no
  firewall is running on your PC; if it is, you should reconfigure it
  appropriately  -- refer to the manual of your OS).

- In your smartphone, open a browser and enter the URL of the server, e.g.,
  `http://IP_of_your_PC:8088/`. When you do it first time, a dialog will appear
  where the connection details (the same `IP_of_your_PC`, chosen port, and
  password) should be entered. Press `Connect`.

- Voila! Now you can control your presentation from the mobile device in your
  palm: navigate  with `Next`/`Prev` buttons, as well as see the current slide
  and read respective notes, if any.

- More functionality to follow, stay tuned (or better, contribute to the
  development).
