import {
  HTML_SCRIPT,
  type integrationId,
  JAVASCRIPT_SCRIPT,
  NEXTJS_SCRIPT,
  REACT_SCRIPT,
} from "../constants/index";

export const createScript = (
  integrationId: integrationId,
  organizationId: string
) => {
  if (integrationId === "html") {
    return HTML_SCRIPT.replace(/{{ORGANIZATION_ID}}/g, organizationId);
  }
  if (integrationId === "react") {
    return REACT_SCRIPT.replace(/{{ORGANIZATION_ID}}/g, organizationId);
  }
  if (integrationId === "nextjs") {
    return NEXTJS_SCRIPT.replace(/{{ORGANIZATION_ID}}/g, organizationId);
  }
  if (integrationId === "javascript") {
    return JAVASCRIPT_SCRIPT.replace(/{{ORGANIZATION_ID}}/g, organizationId);
  }
  return '';
};
