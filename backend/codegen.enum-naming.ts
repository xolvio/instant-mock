import {pascalCase} from 'pascal-case';

function FixEnumValueNaming(str) {
  const hasLowercase = /[a-z]/.test(str);
  const normalizedStr = str.replace(/([A-Z]{2,})(?![a-z])/g, function (match) {
    return match.slice(0, 1) + match.slice(1).toLowerCase();
  });
  const pascalCaseStr = pascalCase(normalizedStr);
  if (hasLowercase && normalizedStr === pascalCaseStr) {
    return pascalCaseStr + 'Pascal';
  }
  return pascalCaseStr;
}
module.exports = FixEnumValueNaming;
