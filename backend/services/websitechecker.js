const axios = require("axios");

const checkWebsite = async (website) => {
  // No website
  if (!website) {
    return {
      hasWebsite: false,
      websiteStatus: "NO_WEBSITE",
      problems: []
    };
  }

  const problems = [];

  try {
    const response = await axios.get(website, {
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: () => true,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36"
      }
    });

    // HTTP errors
    if (response.status >= 400 && response.status < 500) {
      problems.push(`HTTP_${response.status}`);
    }

    if (response.status >= 500) {
      problems.push(`SERVER_ERROR_${response.status}`);
    }

    // Check whether we actually received HTML
    const contentType = response.headers["content-type"] || "";

    if (
      response.status >= 200 &&
      response.status < 400 &&
      !contentType.includes("text/html")
    ) {
      problems.push("INVALID_PAGE_CONTENT");
    }

    // Check for empty HTML
    if (
      contentType.includes("text/html") &&
      (!response.data || response.data.length < 100)
    ) {
      problems.push("EMPTY_PAGE");
    }

    // Final result
    if (problems.length > 0) {
      return {
        hasWebsite: true,
        websiteStatus: "TECHNICAL_PROBLEM",
        problems
      };
    }

    return {
      hasWebsite: true,
      websiteStatus: "WORKING",
      problems: []
    };

  } catch (error) {
    // Timeout
    if (error.code === "ECONNABORTED") {
      problems.push("TIMEOUT");
    }

    // DNS / unreachable
    else if (
      error.code === "ENOTFOUND" ||
      error.code === "EAI_AGAIN"
    ) {
      problems.push("DOMAIN_UNREACHABLE");
    }

    // Connection refused
    else if (error.code === "ECONNREFUSED") {
      problems.push("CONNECTION_REFUSED");
    }

    // SSL certificate
    else if (
      error.code === "CERT_HAS_EXPIRED" ||
      error.code === "DEPTH_ZERO_SELF_SIGNED_CERT" ||
      error.code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE"
    ) {
      problems.push("SSL_ERROR");
    }

    // Other connection problem
    else {
      problems.push(error.code || "CONNECTION_ERROR");
    }

    return {
      hasWebsite: true,
      websiteStatus: "TECHNICAL_PROBLEM",
      problems
    };
  }
};

module.exports = checkWebsite;