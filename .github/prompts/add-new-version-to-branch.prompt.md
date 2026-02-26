---
name: add-new-version-to-branch
description: Use it to generate a new version for the current branch, including a changelog entry for the latets work
---

Take a parameter to this command prompt for type of version update (patch, minor, major) and generate a new version number based on the latest version in the CHANGELOG.md file. Then, create a new changelog entry for this version with the current date and a description of the changes made in this branch.

Follow this guidelines to generate the new version and changelog entry:

1. Read the latest version number from the CHANGELOG.md file.
2. Increment the version number based on the type of update (patch, minor, major).
3. Create a new changelog entry with the new version number, current date, and a description of the changes made in this branch. The description should be concise and highlight the key changes or improvements.
4. Update the #sidenav file to reflect the new version number.

Guidelines for version increment:

- For a patch update, increment the last digit by 0.0.1
- For a minor update, increment the middle digit by 0.1.0 and reset the last digit to 0
- For a major update, increment the first digit by 1.0.0 and reset the middle and last digits to 0

DO NOT COMMIT THE CHANGES SUGGEST A COMMIT MESSAGE FOR THIS UPDATE AND ASK FOR REVIEW.
