---
name: Bump Version
description: Bump the version (MAJOR, MINOR, or PATCH) in the sidenav, add an entry in CHANGELOG, and update package.json.
---

# Bump Version Skill

This skill automates bumping the project version (MAJOR, MINOR, or PATCH) across multiple files, adhering to the codebase standards.

## Instructions

When the user requests to bump the version (e.g. `MAJOR`, `MINOR`, or `PATCH`):

1. **Verify requested bump type**:
   - Determine whether the change is `MAJOR`, `MINOR`, or `PATCH`.

2. **Retrieve Current Version**:
   - Read the current version from the project's [package.json](package.json).

3. **Calculate New Version**:
   - Increment the version number according to semantic versioning rules based on the user's input.

4. **Update Files**:
   - **package.json**: Update the `"version"` field in [package.json](/package.json).
   - **Sidenav Component**: Locate the component displaying the version in the side navigation bar and update its version string.
   - **CHANGELOG**: Add a new entry detailing the changes for the new version in [CHANGELOG.md](CHANGELOG.md).

5. **Reference Standards**:
   - Refer to [README.md](README.md) to ensure all standards are followed.
