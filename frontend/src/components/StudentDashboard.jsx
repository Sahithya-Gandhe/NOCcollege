import React, { useState, useEffect } from 'react';
import { auth } from '../firebaseconfig';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';
import { db } from '../firebaseconfig';
import { collection, addDoc, query, where, getDocs, doc, onSnapshot } from 'firebase/firestore';
import Noc from "./Noc";

import { examBranchEmail, libraryEmail, tnpEmail, ieeeEmail, sportsEmail, alumniEmail } from "./facultymails";

// Exportable variables for NOC
export let exportedStudentName = '';
export let exportedRollNo = '';
export let exportedBranch = '';
export let exportedMentor = '';
export let curemailid = '';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // loading state
  const [rollNo, setRollNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [branch, setBranch] = useState('');
  const [purpose, setPurpose] = useState('');
  const [hasSentRequest, setHasSentRequest] = useState(false);
  const [mentor, setMentor] = useState('');
  const [nocRequestStatus, setNocRequestStatus] = useState(null); // New state for NOC request status

  // Submit form data to Firestore
  const adduser = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "users"), {
        rollNo,
        studentName,
        branch,
        purpose,
        mentor,
        email: user.email,
        timestamp: new Date()
      });
      console.log("Document written with ID: ", docRef.id);
      alert('NOC request submitted successfully!');
      setHasSentRequest(true);

      // Clear form
      setRollNo('');
      setStudentName('');
      setBranch('');
      setPurpose('');
      setMentor('');

      // Update exported variables
      exportedRollNo = rollNo;
      exportedStudentName = studentName;
      exportedBranch = branch;
      exportedMentor = mentor;
      curemailid = user.email;

    } catch (error) {
      console.error("Error adding document:", error.message);
      alert('Error submitting NOC request: ' + error.message);
    }
  };

  // Check login state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        const q = query(collection(db, "users"), where("email", "==", currentUser.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setHasSentRequest(true);
          const data = querySnapshot.docs[0].data();
          setRollNo(data.rollNo || '');
          setStudentName(data.studentName || '');
          setBranch(data.branch || '');
          setPurpose(data.purpose || '');
          setMentor(data.mentor || '');

          exportedRollNo = data.rollNo || '';
          exportedStudentName = data.studentName || '';
          exportedBranch = data.branch || '';
          exportedMentor = data.mentor || '';
          curemailid = currentUser.email;

          // Listen for real-time updates on NOC request status
          console.log("Listening for NOC request status for rollNo:", exportedRollNo);
          if (exportedRollNo) {
            const nocDocRef = doc(db, "nocRequests", exportedRollNo);
            onSnapshot(nocDocRef, (docSnap) => {
              if (docSnap.exists()) {
                setNocRequestStatus(docSnap.data());
              } else {
                setNocRequestStatus(null);
              }
            });
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();
      alert('Logged out successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Error logging out: ' + error.message);
    }
  };

  // While checking auth
  if (loading) {
    return (
      <div className="student-dashboard-container">
        <div className="student-dashboard-content">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="student-dashboard-container">
        <div className="student-dashboard-content">
          <p>Please log in to view this page.</p>
        </div>
      </div>
    );
  }

  // Logged in
  return (
    <div className="student-dashboard-container">
      <div className="student-dashboard-content">
        <div className="dashboard-header">
          <h1>Welcome, {user.displayName || user.email}!</h1>
          {/* <button onClick={handleLogout} className="logout-button">Logout</button> */}
        </div>

        <div className="form-container">
          <h2>NOC Request Form</h2>
          {hasSentRequest && nocRequestStatus && nocRequestStatus.finalStatus !== "Accepted" ? (
            <div>
              <p>You have an active NOC request.</p>
              <p><strong>Final Status:</strong> {nocRequestStatus.finalStatus}</p>
              {nocRequestStatus.facultyStatuses && (
                <div>
                  <h4>Individual Faculty Statuses:</h4>
                  <ul>
                    {Object.entries(nocRequestStatus.facultyStatuses).map(([email, status]) => {
                      const facultyRoleMap = {
                        // [mentorEmail]: "Mentor",
                        [examBranchEmail]: "Examination Branch",
                        [libraryEmail]: "Library",
                        [tnpEmail]: "Training & Placement Cell",
                        [ieeeEmail]: "IEEE / ISTE / CSI",
                        [sportsEmail]: "Sports / Games",
                        [alumniEmail]: "Alumni Association",
                      };
                      const role = facultyRoleMap[email] || "Unknown Faculty";
                      return (
                        <li key={email}>{role}: {status}</li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {nocRequestStatus.finalStatus === "Rejected" && (
                <p style={{ color: 'red' }}>Your NOC request has been rejected by one or more faculty members. Please contact the college administration for further details.</p>
              )}
              {nocRequestStatus.finalStatus === "Pending" && (
                <p style={{ color: 'orange' }}>Your NOC request is pending review by faculty members. Please check back later for updates.</p>
              )}
            </div>
          ) : hasSentRequest ?(
            <p style={{textAlign:"center"}}>You have already sent an NOC request.</p>
          ) : (
            <form onSubmit={adduser}>
              <div className="form-group">
                <label htmlFor="rollNo">Roll No.:</label>
                <input
                  type="text"
                  id="rollNo"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="studentName">Name:</label>
                <input
                  type="text"
                  id="studentName"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="branch">Branch:</label>
                <input
                  type="text"
                  id="branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="purpose">Purpose of NOC:</label>
                <textarea
                  id="purpose"
                  rows="4"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="mentor">Mentor:</label>
                <input
                    type="email"
                    id="mentor"
                    placeholder="Mentor's Email"
                    value={mentor}
                    onChange={(e) => setMentor(e.target.value)}
                    required
                  />
              </div>
              <button type="submit" className="submit-button">Submit Request</button>
            </form>
          )}
        </div>

        {nocRequestStatus && nocRequestStatus.finalStatus === "Accepted" ? (
          <div className="form-container">
            <h2>No Dues Certificate Issued</h2>
            <p style={{textAlign:"center"}}>Your No Dues Certificate has been successfully issued.</p>
            <p style={{textAlign:"center"}}>Please download the certificate by contacting the NOC Admin.</p>
            <p style={{textAlign:"center"}}>Thank you for using our service  :-)</p>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        ) : (
          <div className="form-container">
            <Noc />
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
