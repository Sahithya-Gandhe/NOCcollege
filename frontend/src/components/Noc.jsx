import React, { useState, useEffect } from "react";
import axios from "axios";
import { fetchAllFacultyEmails, examBranchEmail, libraryEmail, tnpEmail, ieeeEmail, sportsEmail, alumniEmail } from "./facultymails";

// Import exported student details from StudentDashboard
import { exportedStudentName,
  exportedRollNo,
  exportedBranch,
  exportedMentor,
  curemailid,
} from "./StudentDashboard";
import { db } from "../firebaseconfig";
import { doc, setDoc } from "firebase/firestore";

export default function Noc() {
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFaculties, setSelectedFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [emailsLoaded, setEmailsLoaded] = useState(false);

  // Load faculty emails from Firestore
  useEffect(() => {
    const loadFacultyEmails = async () => {
      await fetchAllFacultyEmails(); // populates the exported variables

      // Build faculty list array from exported variables, remove Accounts
      const list = [
        { role: "Mentor", email: exportedMentor }, // Use exportedMentor
        { role: "Examination Branch", email: examBranchEmail },
        { role: "Library", email: libraryEmail },
        { role: "Training & Placement Cell", email: tnpEmail },
        { role: "IEEE / ISTE / CSI", email: ieeeEmail },
        { role: "Sports / Games", email: sportsEmail },
        { role: "Alumni Association", email: alumniEmail },
      ].filter(f => f.email); // only keep roles that have emails

      setFacultyList(list);
      setSelectedFaculties(list.map(f => f.email)); // Select all by default
      setEmailsLoaded(true);
    };

    loadFacultyEmails();
  }, []); // Remove mentorEmailProp from dependency array

  // Toggle checkbox selection
  const handleCheckboxChange = (email) => {
    setSelectedFaculties((prev) =>
      prev.includes(email)
        ? prev.filter((e) => e !== email)
        : [...prev, email]
    );
  };

  // Send emails
  const handleSendRequest = async () => {
    if (selectedFaculties.length === 0) {
      alert("Please select at least one faculty.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/send-email`, {
        studentName: exportedStudentName,
        rollNo: exportedRollNo,
        branch: exportedBranch,
        mentor: exportedMentor, // Ensure exportedMentor is used here
        email: curemailid,
        facultyEmails: selectedFaculties,
      });

      // Store NOC request in Firestore
      try {
        await setDoc(doc(db, "nocRequests", exportedRollNo), {
          studentName: exportedStudentName,
          rollNo: exportedRollNo,
          branch: exportedBranch,
          mentor: exportedMentor,
          studentEmail: curemailid,
          facultyEmails: selectedFaculties, // Keep this for reference of who was sent
          facultyStatuses: selectedFaculties.reduce((acc, email) => ({ ...acc, [email]: "Pending" }), {}), // Initialize all selected to Pending
          finalStatus: "Pending", // Initial final status
          timestamp: new Date(),
        });
        alert("NOC request submitted and saved!");
      } catch (firestoreError) {
        console.error("Error saving NOC request to Firestore:", firestoreError);
        alert("Error saving NOC request. Please try again.");
      }

      alert(response.data.message);
      setSelectedFaculties([]); // reset selections
    } catch (err) {
      console.error(err);
      alert("Error sending emails.");
    } finally {
      setLoading(false);
    }
  };

  if (!emailsLoaded) {
    return <p>Loading faculty emails...</p>;
  }

  return (
    <div style={{ padding: "20px"  }}>
      <h2>No Dues Certificate Request</h2>
      <p style={{textAlign:"center"}}><strong>Student:</strong> {exportedStudentName}</p>
      <p style={{textAlign:"center"}}><strong>Roll No:</strong> {exportedRollNo}</p>
      <p style={{textAlign:"center"}}><strong>Branch:</strong> {exportedBranch}</p>
      <p style={{textAlign:"center"}}><strong>Mentor:</strong> {exportedMentor}</p>
      <p style={{textAlign:"center"}}><strong>Email:</strong> {curemailid}</p>

      <h3>Select Faculty to Send Request</h3>
      {facultyList.length === 0 ? (
        <p>No faculty emails found.</p>
      ) : (
        facultyList.map((faculty) => (
          <div key={faculty.role}>
            <label>
              <input
                type="checkbox"
                value={faculty.email}
                checked={selectedFaculties.includes(faculty.email)}
                onChange={() => handleCheckboxChange(faculty.email)}
              />
              {faculty.role}
            </label>
          </div>
        ))
      )}

      <button
        onClick={handleSendRequest}
        disabled={loading || facultyList.length === 0}
        className="send-request-button"
      >
        {loading ? "Sending..." : "Send Request"}
      </button>
    </div>
  );
}
