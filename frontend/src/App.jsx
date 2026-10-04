import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const APIURL = import.meta.env.VITE_API_URL;

function App() {
  const [instagramUrl, setInstagramUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [todayData, setTodayData] = useState({
    todaysLeads: [],
    firstFollowUps: [],
    secondFollowUps: []
  });

  const checkLead = async () => {
    try {
      setLoading(true);
      setResult(null);

      const response = await axios.post(`${APIURL}/api/leads`, {
        instagramUrl
      });

      setResult(response.data);

      // dashboard refresh
      fetchTodayData();

      setInstagramUrl("");
    } catch (error) {
      setResult({
        message:
          error.response?.data?.message || "Something went wrong"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayData = async () => {
    try {
      const response = await axios.get(`${APIURL}/api/leads/today`);
      setTodayData(response.data);
    } catch (error) {
      console.error("Dashboard error:", error);
    }
  };

  useEffect(() => {
    fetchTodayData();
  }, []);

  const LeadCard = ({ lead }) => (
    <div className="lead-card">
      <strong>@{lead.username}</strong>

      {lead.website && (
        <p>
          <b>Website:</b> {lead.website}
        </p>
      )}

      <p>
        <b>Status:</b> {lead.websiteStatus}
      </p>

      {lead.websiteProblems?.length > 0 && (
        <p>
          <b>Problem:</b>{" "}
          {lead.websiteProblems.join(", ")}
        </p>
      )}
    </div>
  );

  return (
    <div className="app">

      <h1>Lead Checker</h1>

      {/* CHECK LEAD */}

      <div className="checker">
        <input
          type="text"
          placeholder="Paste Instagram URL"
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
        />

        <button onClick={()=>{checkLead()}} disabled={loading}>
          {loading ? "Checking..." : "Check Lead"}
        </button>
      </div>

      {result && (
        <div className="result-card">
          <h3>{result.message}</h3>

          {result.lead && (
            <>
              <p>
                <b>Username:</b> @{result.lead.username}
              </p>

              <p>
                <b>Website:</b>{" "}
                {result.lead.website || "No website"}
              </p>
             {result.lead.bio && (
  <p>
    <b>Bio:</b> {result.lead.bio}
  </p>
)}
            </>
          )}
        </div>
      )}

      {/* TODAY DASHBOARD */}

      <div className="dashboard">

        <section>
          <div className="section-title">
            <h2>Today's Leads</h2>
            <span>{todayData.todaysLeads.length}</span>
          </div>

          {todayData.todaysLeads.length === 0 ? (
            <p className="empty">No leads today</p>
          ) : (
            todayData.todaysLeads.map((lead) => (
              <LeadCard key={lead._id} lead={lead} />
            ))
          )}
        </section>


        <section>
          <div className="section-title">
            <h2>Today's First Follow-ups</h2>
            <span>{todayData.firstFollowUps.length}</span>
          </div>

          {todayData.firstFollowUps.length === 0 ? (
            <p className="empty">No first follow-ups today</p>
          ) : (
            todayData.firstFollowUps.map((lead) => (
              <LeadCard key={lead._id} lead={lead} />
            ))
          )}
        </section>


        <section>
          <div className="section-title">
            <h2>Today's Second Follow-ups</h2>
            <span>{todayData.secondFollowUps.length}</span>
          </div>

          {todayData.secondFollowUps.length === 0 ? (
            <p className="empty">No second follow-ups today</p>
          ) : (
            todayData.secondFollowUps.map((lead) => (
              <LeadCard key={lead._id} lead={lead} />
            ))
          )}
        </section>

      </div>

    </div>
  );
}

export default App;