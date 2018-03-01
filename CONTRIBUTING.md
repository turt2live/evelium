# Contributing to Evelium

Evelium uses a contributor agreement that is very similar to [matrix.org/synapse's guidelines](https://github.com/matrix-org/synapse/blob/master/CONTRIBUTING.rst). In short, everyone is welcome to contribute code to Evelium provided that they license their work under the same license as Evelium. The act of submitting a contribution means that the contributor agrees to license it under the same terms as the project's LICENSE.

# How to contribute

After forking this repository and making your changes, create a pull request against the **develop** branch (not master). The pull request (or commits) should contain a sign off, which is described in a later section here.

The master branch is to be treated as stable for the most recent release. The `develop` branch is used to try out new features, fix bugs, and generally progress on the project until the next release. The best workflow to use would be to create a feature branch based on `develop`, write the appropriate changes, and finally open a pull request on GitHub. Once the pull request is opened, the maintainers and other community members may provide feedback which may include changes needing to be made. 

Travis-CI is used to verify that pull requests build and pass the required tests. The same system is also used for the various branches on the project. Please make sure that your pull request gets a passing grade from Travis-CI.

# Code style

Evelium makes use of tslint to ensure that code is kept to a common standard. To validate your changes, run `npm run lint` to get a report of anything that is not adhering to the guidelines. If the linting feels too strict, please visit #evelium:t2bot.io and let us know.

# Sign off

To ensure we have a record that your contribution is intentional and that you agree to license it under the same terms as the project's license, we've adopted the use of the [DCO (Developer Certificate of Origin)](https://developercertificate.org/). This is a simple declaration that you wrote the contribution or otherwise have the right to contribute it to Evelium:
```
Developer Certificate of Origin
Version 1.1

Copyright (C) 2004, 2006 The Linux Foundation and its contributors.
660 York Street, Suite 102,
San Francisco, CA 94110 USA

Everyone is permitted to copy and distribute verbatim copies of this
license document, but changing it is not allowed.

Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am
    permitted to submit under a different license), as indicated
    in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.
```

If you agree to the DCO for your contribution, please include the following in every commit on your pull request, or in a comment on the pull request itself.

```
Signed-off-by: Your Real Name <your@email.address.com>
```

Unfortunately we do require a real name be used as we cannot accept contributions anonymously or by nicknames. Git makes this fairly easy by simply including the `-s` flag when you `git commit` to use your `user.name` and `user.email` in the commit. 

# Conclusion

If you've made it this far, we hope to see your pull request soon! Many contributors and interested parties can be found in [#evelium:t2bot.io](https://matrix.to/#/#evelium:t2bot.io) - feel free to come by and ask questions or say hi.
