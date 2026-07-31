import {
  confirmSignupTemplate,
  resetPasswordTemplate,
  magicLinkTemplate,
  changeEmailTemplate
} from "./email-templates";

import fs from "fs";

fs.writeFileSync("confirm-signup.html", confirmSignupTemplate);
fs.writeFileSync("reset-password.html", resetPasswordTemplate);
fs.writeFileSync("magic-link.html", magicLinkTemplate);
fs.writeFileSync("change-email.html", changeEmailTemplate);

console.log("HTML files created!");