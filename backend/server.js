const express=require("express")
const cors=require("cors");
const scrapeInstagramProfile = require("./services/instascrapper");
const Lead = require("./models/lead");
require("dotenv").config();
const checkWebsite = require("./services/websitechecker");
const connectdb=require("./config/db")

const app = express();

app.use(cors({
  origin: "https://lead-app-p348.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  optionsSuccessStatus: 200

}));

app.options("*", cors());

app.use(express.json());
connectdb();
app.get(`/getss`,(req,res)=>{
    res.send("Running")
})
app.post("/api/leads", async (req, res) => {
  try {
    const { instagramUrl } = req.body;

    if (!instagramUrl) {
      return res.status(400).json({
        message: "Instagram URL is required"
      });
    }

    // 1. Scrape Instagram
    const profile = await scrapeInstagramProfile(instagramUrl);

    // 2. Check website
    const websiteCheck = await checkWebsite(profile.website);

    const now = new Date();

const followUp1 = new Date(now);
followUp1.setDate(followUp1.getDate() + 3);

const followUp2 = new Date(now);
followUp2.setDate(followUp2.getDate() + 7);
    // 3. NO WEBSITE → SAVE
    if (websiteCheck.websiteStatus === "NO_WEBSITE") {
     const lead = await Lead.create({
  instagramUrl,
  username: profile.username,
  bio: profile.bio,
  website: null,
  hasWebsite: false,
  websiteStatus: "NO_WEBSITE",
  websiteProblems: [],
  status: "New",

  lastContacted: now,
  followUp1,
  followUp2
});
      return res.status(201).json({
        message: "Lead saved - no website",
        lead
      });
    }

    // 4. WORKING WEBSITE → DON'T SAVE
    if (websiteCheck.websiteStatus === "WORKING") {
      return res.status(200).json({
        message: "Website is working - not a lead",
        username: profile.username,
        website: profile.website,
        websiteStatus: "WORKING"
      });
    }

    // 5. WEBSITE HAS PROBLEM → SAVE
  const lead = await Lead.create({
  instagramUrl,
  username: profile.username,
  bio: profile.bio,
  website: profile.website,
  hasWebsite: true,
  websiteStatus: websiteCheck.websiteStatus,
  websiteProblems: websiteCheck.problems,
  status: "New",

  lastContacted: now,
  followUp1,
  followUp2
});

    return res.status(201).json({
      message: "Lead saved - website has technical problems",
      problems: websiteCheck.problems,
      lead
    });

  } catch (error) {
    console.error("Lead processing failed:", error.message);

    res.status(500).json({
      message: "Failed to process lead"
    });
  }
});
app.get("/api/leads/today", async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const leads = await Lead.find({
      $or: [
        {
          createdAt: {
            $gte: start,
            $lte: end
          }
        },
        {
          followUp1: {
            $gte: start,
            $lte: end
          }
        },
        {
          followUp2: {
            $gte: start,
            $lte: end
          }
        }
      ]
    }).sort({ createdAt: -1 });

    const todaysLeads = leads.filter(
      lead =>
        lead.createdAt >= start &&
        lead.createdAt <= end
    );

    const firstFollowUps = leads.filter(
      lead =>
        lead.followUp1 >= start &&
        lead.followUp1 <= end
    );

    const secondFollowUps = leads.filter(
      lead =>
        lead.followUp2 >= start &&
        lead.followUp2 <= end
    );

    res.json({
      todaysLeads,
      firstFollowUps,
      secondFollowUps
    });

  } catch (error) {
    console.error("Today's leads error:", error.message);

    res.status(500).json({
      message: "Failed to fetch today's leads"
    });
  }
});




module.exports = app;