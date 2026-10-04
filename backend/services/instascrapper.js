const axios = require("axios");

const scrapeInstagramProfile = async (instagramUrl) => {
  try {
    const username = new URL(instagramUrl).pathname
  .split("/")
  .filter(Boolean)
  .pop();
    const response = await axios.post(
      `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${process.env.APIFY_TOKEN}`,
      {
        usernames: [username],
        resultsType: "details"
      }
    );

    const data = response.data[0];

    return {
      username: data.username,
      bio: data.biography,
      website: data.externalUrl || null
    };

  } catch (error) {
    console.error(
      "Instagram scraping failed:",
      error.response?.data || error.message
    );

    throw error;
  }
};

module.exports = scrapeInstagramProfile;